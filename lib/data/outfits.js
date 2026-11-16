// Lectura de outfits guardados. Solo servidor. Siempre con el uid de la
// sesión y bajo users/{uid}/outfits.
import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";

function outfitsRef(uid) {
  return getAdminDb().collection("users").doc(uid).collection("outfits");
}

// Objeto simple (las fechas en milisegundos) para poder pasarlo a componentes.
function aOutfit(doc) {
  const d = doc.data();
  return {
    id: doc.id,
    prendaIds: d.prendaIds ?? [],
    fecha: d.fecha?.toMillis() ?? 0,
    clima: d.clima,
    paletaId: d.paletaId ?? null,
    calificacion: d.calificacion ?? null,
    nota: d.nota ?? "",
  };
}

// Del más nuevo al más viejo.
export async function listarOutfits(uid) {
  const snap = await outfitsRef(uid).orderBy("fecha", "desc").get();
  return snap.docs.map(aOutfit);
}

// null si no existe (o si es de otra persona: no está bajo este uid).
export async function getOutfit(uid, id) {
  if (!id || id.includes("/")) return null;
  const doc = await outfitsRef(uid).doc(id).get();
  return doc.exists ? aOutfit(doc) : null;
}
