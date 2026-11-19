// Lectura de paletas desde Firestore. Solo servidor.
// Las paletas son públicas (las reglas permiten leerlas a cualquiera), pero
// las leemos con Admin desde el servidor para no sumar Firestore al cliente.
import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { CLIMAS } from "@/lib/paletas";

const ORDEN = Object.keys(CLIMAS);

function paletasRef() {
  return getAdminDb().collection("paletas");
}

function aPaleta(doc) {
  const d = doc.data();
  return {
    id: doc.id,
    clima: d.clima,
    nombre: d.nombre,
    armonia: d.armonia,
    colores: d.colores ?? [],
    descripcion: d.descripcion ?? "",
    activa: Boolean(d.activa),
  };
}

// Todas las paletas, ordenadas por clima (como en CLIMAS) y después por nombre.
export async function listarPaletas() {
  const snap = await paletasRef().get();
  return snap.docs
    .map(aPaleta)
    .sort(
      (a, b) =>
        ORDEN.indexOf(a.clima) - ORDEN.indexOf(b.clima) || a.nombre.localeCompare(b.nombre)
    );
}

// Las paletas de un clima (normalmente una, pero el admin puede sumar más).
export async function getPaletasDeClima(clima) {
  const snap = await paletasRef().where("clima", "==", clima).get();
  return snap.docs.map(aPaleta).sort((a, b) => a.nombre.localeCompare(b.nombre));
}

// La paleta que se usa en /hoy para un clima: la que el admin marcó como
// "activa". Si no hay ninguna marcada (compatibilidad con paletas viejas),
// cae en la primera por orden alfabético. null si no hay ninguna.
export async function getPaletaDelDia(clima) {
  const paletas = await getPaletasDeClima(clima);
  if (paletas.length === 0) return null;
  return paletas.find((p) => p.activa) ?? paletas[0];
}

// Una paleta por id (para editarla en el admin). null si no existe.
export async function getPaleta(id) {
  if (!id || id.includes("/")) return null;
  const doc = await paletasRef().doc(id).get();
  return doc.exists ? aPaleta(doc) : null;
}
