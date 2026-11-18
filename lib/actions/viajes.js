"use server";

// Server Actions del modo viaje: guardar y borrar. Verifican la sesión y
// escriben solo bajo users/{uid de la sesión}/viajes.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { requireUser } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { planearViaje } from "@/lib/data/viajes";
import { leerUbicacion } from "@/lib/ubicacion";

function viajesRef(uid) {
  return getAdminDb().collection("users").doc(uid).collection("viajes");
}

// "YYYY-MM-DD" a Timestamp al mediodía UTC (así el día no se corre).
const aTimestamp = (fecha) =>
  Timestamp.fromDate(new Date(`${fecha}T12:00:00Z`));

// El formulario manda ciudad y fechas. El plan (clima y valija) se vuelve a
// calcular acá: no guardamos nada que venga armado del navegador.
export async function guardarViaje(_estadoPrevio, formData) {
  const user = await requireUser();

  const ubicacion = leerUbicacion({
    lat: formData.get("lat"),
    lon: formData.get("lon"),
    ciudad: formData.get("ciudad"),
  });
  if (!ubicacion) return { mensaje: "Elegí una ciudad." };

  const plan = await planearViaje(
    user,
    ubicacion,
    formData.get("desde"),
    formData.get("hasta"),
  );
  if (plan.error) return { mensaje: plan.error };

  let id;
  try {
    const ref = await viajesRef(user.uid).add({
      ciudad: ubicacion,
      desde: aTimestamp(plan.desde),
      hasta: aTimestamp(plan.hasta),
      resumenClima: plan.resumen,
      prendaIds: [...new Set(plan.dias.flatMap((d) => d.prendaIds))],
      dias: plan.dias,
      faltantes: plan.faltantes,
      createdAt: FieldValue.serverTimestamp(),
    });
    id = ref.id;
  } catch (error) {
    console.error("guardarViaje:", error);
    return { mensaje: "No pudimos guardar el viaje. Probá de nuevo." };
  }

  revalidatePath("/viajes");
  redirect(`/viajes/${id}`); // fuera del try: redirect funciona lanzando una excepción
}

export async function eliminarViaje(id) {
  const user = await requireUser();
  if (id && !id.includes("/")) {
    await viajesRef(user.uid).doc(id).delete();
  }
  revalidatePath("/viajes");
  redirect("/viajes");
}
