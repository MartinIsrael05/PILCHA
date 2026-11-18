// Viajes: planear (pronóstico + placard + motor) y leer los guardados.
// Solo servidor. Siempre con el uid de la sesión, bajo users/{uid}/viajes.
import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { getPronosticoDiario } from "@/lib/clima";
import { listarPrendas } from "@/lib/data/prendas";
import {
  armarValija,
  climaPorDia,
  resumenClima,
  validarFechas,
} from "@/lib/viajes";

function viajesRef(uid) {
  return getAdminDb().collection("users").doc(uid).collection("viajes");
}

// Lo usan la vista previa de /viajes y la Server Action que guarda, así las
// dos calculan exactamente lo mismo. Devuelve { error } o el plan completo.
export async function planearViaje(user, ubicacion, desde, hasta) {
  const errores = validarFechas({ desde, hasta });
  if (Object.keys(errores).length) {
    return { error: errores.desde ?? errores.hasta };
  }

  let diario;
  try {
    diario = await getPronosticoDiario(ubicacion.lat, ubicacion.lon);
  } catch {
    return {
      error: "No pudimos traer el pronóstico. Probá de nuevo en un rato.",
    };
  }

  const dias = climaPorDia(diario, desde, hasta);
  if (!dias) {
    return {
      error:
        "Elegí fechas dentro de los próximos 14 días: más adelante no hay pronóstico.",
    };
  }

  const prendas = await listarPrendas(user.uid);
  const perfil = {
    sensibilidad: user.sensibilidad,
    ajusteTermico: user.ajusteTermico,
  };
  const { porDia, faltantes } = armarValija({ dias, prendas, perfil });

  return {
    ciudad: ubicacion,
    desde,
    hasta,
    resumen: resumenClima(dias),
    // Por día guardamos lo justo para mostrarlo después.
    dias: porDia.map((d) => ({
      fecha: d.fecha,
      tempMin: d.tempMin,
      tempMax: d.tempMax,
      lluviaProb: d.lluviaProb,
      codigo: d.codigo,
      nivel: d.nivel.nombre,
      prendaIds: d.prendaIds,
    })),
    faltantes,
    prendas,
  };
}

function aViaje(doc) {
  const d = doc.data();
  return {
    id: doc.id,
    ciudad: d.ciudad,
    // Se guardan a las 12:00 UTC, así el día no se corre por la zona horaria.
    desde: d.desde.toDate().toISOString().slice(0, 10),
    hasta: d.hasta.toDate().toISOString().slice(0, 10),
    resumen: d.resumenClima,
    dias: d.dias ?? [],
    faltantes: d.faltantes ?? [],
    prendaIds: d.prendaIds ?? [],
  };
}

// Los próximos primero.
export async function listarViajes(uid) {
  const snap = await viajesRef(uid).orderBy("desde", "desc").get();
  return snap.docs.map(aViaje);
}

export async function getViaje(uid, id) {
  if (!id || id.includes("/")) return null;
  const doc = await viajesRef(uid).doc(id).get();
  return doc.exists ? aViaje(doc) : null;
}
