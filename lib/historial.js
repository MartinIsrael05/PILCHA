// Reglas del historial y del aprendizaje. Funciones puras (sin Firebase):
// las usan las Server Actions y las pruebas.
//
// Cómo aprende PILCHA: el motor calcula
//   tempEfectiva = sensación + offset de sensibilidad + ajusteTermico
// Si calificás "frío", el ajuste baja 0.5: la próxima vez el día "se siente"
// más frío para vos y te recomienda más abrigo. Con "calor" pasa lo
// contrario. Es el mismo sentido que el offset de "friolento" (-3).

export const CALIFICACIONES = {
  frio: { nombre: "Tuve frío", icono: "🥶", delta: -0.5 },
  bien: { nombre: "Estuve bien", icono: "😌", delta: 0 },
  calor: { nombre: "Tuve calor", icono: "🥵", delta: 0.5 },
};

export const AJUSTE_MIN = -5;
export const AJUSTE_MAX = 5;
export const MAX_NOTA = 200;
export const MAX_PRENDAS_OUTFIT = 8;

export function esCalificacion(valor) {
  return Object.hasOwn(CALIFICACIONES, valor);
}

// Calcula el nuevo ajuste térmico. Si el outfit ya tenía una calificación,
// primero deshacemos su efecto: cambiar de opinión no suma dos veces.
export function nuevoAjuste(ajusteActual, calificacionAnterior, calificacionNueva) {
  const deltaAnterior = CALIFICACIONES[calificacionAnterior]?.delta ?? 0;
  const deltaNuevo = CALIFICACIONES[calificacionNueva]?.delta ?? 0;
  const valor = (ajusteActual ?? 0) - deltaAnterior + deltaNuevo;
  const limitado = Math.min(AJUSTE_MAX, Math.max(AJUSTE_MIN, valor));
  return Math.round(limitado * 10) / 10;
}

// Valida la calificación y la nota que manda el formulario.
export function validarCalificacion({ calificacion, nota }) {
  const errores = {};
  const valor = String(calificacion ?? "");
  if (!esCalificacion(valor)) errores.calificacion = "Elegí cómo te fue.";

  const texto = String(nota ?? "").trim();
  if (texto.length > MAX_NOTA) errores.nota = `Usá ${MAX_NOTA} caracteres como máximo.`;

  if (Object.keys(errores).length > 0) return { errores, datos: null };
  return { errores: {}, datos: { calificacion: valor, nota: texto } };
}

// Limpia la lista de ids de prendas que manda el formulario de "Usé este
// outfit": solo strings no vacíos, sin repetidos y con un máximo.
// Devuelve null si no sirve.
export function limpiarPrendaIds(ids) {
  const limpios = [...new Set(ids.map((id) => String(id).trim()).filter(Boolean))];
  // Los ids de Firestore no tienen "/" (si no, apuntarían a otra ruta).
  if (limpios.some((id) => id.includes("/"))) return null;
  if (limpios.length === 0 || limpios.length > MAX_PRENDAS_OUTFIT) return null;
  return limpios;
}

// "lunes, 16 de noviembre". Fijamos la zona horaria de Argentina porque el
// servidor (Vercel) corre en UTC: a la noche mostraría el día siguiente.
export function formatearFecha(ms, { conAnio = false } = {}) {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(conAnio && { year: "numeric" }),
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(ms);
}
