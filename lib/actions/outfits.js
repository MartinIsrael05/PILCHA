"use server";

// Server Actions del historial: guardar el outfit que usaste y calificarlo.
// Verifican la sesión y escriben solo bajo users/{uid de la sesión}.
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { requireUser } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { getPronostico, resumirVentana, condicionPaleta } from "@/lib/clima";
import { getPaletaDelDia } from "@/lib/data/paletas";
import { leerHorario, leerUbicacion } from "@/lib/ubicacion";
import { limpiarPrendaIds, nuevoAjuste, validarCalificacion } from "@/lib/historial";

function userRef(uid) {
  return getAdminDb().collection("users").doc(uid);
}

// "Usé este outfit". El formulario manda la ubicación, el horario y los ids
// de las prendas. El clima NO viene del navegador: lo volvemos a calcular
// acá con el pronóstico (que está en caché), así nadie puede guardar un
// clima inventado.
export async function guardarOutfit(_estadoPrevio, formData) {
  const user = await requireUser();
  const error = (mensaje) => ({ ok: false, id: null, mensaje });

  const ubicacion = leerUbicacion({
    lat: formData.get("lat"),
    lon: formData.get("lon"),
    ciudad: formData.get("ciudad"),
  });
  const { desde, hasta } = leerHorario(
    { desde: formData.get("desde"), hasta: formData.get("hasta") },
    { desde: user.horaSalida, hasta: user.horaVuelta }
  );
  const prendaIds = limpiarPrendaIds(formData.getAll("prendaId"));
  if (!ubicacion || !prendaIds) return error("No pudimos guardar el outfit.");

  try {
    // Las prendas tienen que existir y ser de esta persona.
    const prendasRef = userRef(user.uid).collection("prendas");
    const prendas = await getAdminDb().getAll(...prendaIds.map((id) => prendasRef.doc(id)));
    if (prendas.some((doc) => !doc.exists)) {
      return error("Alguna prenda ya no está en tu placard. Recargá la página.");
    }

    const resumen = resumirVentana(await getPronostico(ubicacion.lat, ubicacion.lon), desde, hasta);
    if (!resumen) return error("No hay datos del clima para ese horario.");
    const paleta = await getPaletaDelDia(condicionPaleta(resumen));

    // Todo junto en un batch: el outfit y un uso más para cada prenda.
    const batch = getAdminDb().batch();
    const outfitRef = userRef(user.uid).collection("outfits").doc();
    batch.set(outfitRef, {
      prendaIds,
      fecha: FieldValue.serverTimestamp(),
      clima: {
        tempMin: resumen.tempMin,
        tempMax: resumen.tempMax,
        sensacion: resumen.sensacion,
        lluviaProb: resumen.lluviaProb,
        viento: resumen.viento,
        uv: resumen.uv,
        codigo: resumen.codigo,
        ciudad: ubicacion.nombre,
      },
      paletaId: paleta?.id ?? null,
      calificacion: null,
      nota: "",
    });
    for (const doc of prendas) {
      batch.update(doc.ref, {
        usos: FieldValue.increment(1),
        ultimoUso: FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();

    revalidatePath("/historial");
    revalidatePath("/placard");
    return { ok: true, id: outfitRef.id, mensaje: null };
  } catch (e) {
    console.error("guardarOutfit:", e);
    return error("No pudimos guardar el outfit. Probá de nuevo.");
  }
}

// Calificar cómo te fue con un outfit. Actualiza el outfit y el ajuste
// térmico del usuario en una transacción: o se guardan las dos cosas o
// ninguna (así el ajuste nunca queda desfasado de las calificaciones).
export async function calificarOutfit(id, _estadoPrevio, formData) {
  const user = await requireUser();

  const { errores, datos } = validarCalificacion({
    calificacion: formData.get("calificacion"),
    nota: formData.get("nota"),
  });
  if (Object.keys(errores).length > 0) {
    return { ok: false, errores, mensaje: "Revisá los campos marcados." };
  }
  if (!id || id.includes("/")) return { ok: false, errores: {}, mensaje: "Ese outfit no existe." };

  try {
    const outfitRef = userRef(user.uid).collection("outfits").doc(id);
    const existe = await getAdminDb().runTransaction(async (tx) => {
      const [outfitSnap, userSnap] = await Promise.all([
        tx.get(outfitRef),
        tx.get(userRef(user.uid)),
      ]);
      if (!outfitSnap.exists) return false;

      const ajuste = nuevoAjuste(
        userSnap.data().ajusteTermico ?? 0,
        outfitSnap.data().calificacion,
        datos.calificacion
      );
      tx.update(outfitRef, datos);
      tx.update(userRef(user.uid), { ajusteTermico: ajuste });
      return true;
    });
    if (!existe) return { ok: false, errores: {}, mensaje: "Ese outfit no existe." };
  } catch (e) {
    console.error("calificarOutfit:", e);
    return { ok: false, errores: {}, mensaje: "No pudimos guardar la calificación. Probá de nuevo." };
  }

  revalidatePath("/historial");
  revalidatePath(`/historial/${id}`);
  revalidatePath("/perfil");
  revalidatePath("/hoy");
  return { ok: true, errores: {}, mensaje: mensajeDeAprendizaje(datos.calificacion) };
}

function mensajeDeAprendizaje(calificacion) {
  if (calificacion === "frio") return "Anotado. La próxima te vamos a abrigar un poco más.";
  if (calificacion === "calor") return "Anotado. La próxima te vamos a recomendar algo más liviano.";
  return "¡Bien! Seguimos así.";
}
