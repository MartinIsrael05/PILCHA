// Reglas del perfil. Funciones puras: las usan el formulario (cliente) y la
// Server Action (servidor), así la validación es la misma en los dos lados.

export const SENSIBILIDADES = {
  friolento: { nombre: "Friolento", detalle: "Siempre tengo frío" },
  normal: { nombre: "Normal", detalle: "Ni frío ni calor" },
  caluroso: { nombre: "Caluroso", detalle: "Siempre tengo calor" },
};

export const MAX_NOMBRE = 60;
const MAX_CIUDAD = 80;

// Recibe los valores del formulario (strings) y devuelve { errores, datos }.
// La ciudad es opcional: si no viene ninguno de sus tres campos, queda en null.
export function validarPerfil(valores) {
  const errores = {};

  const nombre = String(valores.nombre ?? "").trim();
  if (!nombre) errores.nombre = "Contanos cómo te llamás.";
  else if (nombre.length > MAX_NOMBRE) {
    errores.nombre = `Usá ${MAX_NOMBRE} caracteres como máximo.`;
  }

  const horaSalida = Number(valores.horaSalida);
  const horaVuelta = Number(valores.horaVuelta);
  if (!esHora(horaSalida)) errores.horaSalida = "Elegí una hora entre 0 y 23.";
  if (!esHora(horaVuelta)) errores.horaVuelta = "Elegí una hora entre 0 y 23.";
  if (esHora(horaSalida) && esHora(horaVuelta) && horaSalida >= horaVuelta) {
    errores.horaVuelta = "La vuelta tiene que ser después de la salida.";
  }

  const sensibilidad = String(valores.sensibilidad ?? "");
  if (!Object.hasOwn(SENSIBILIDADES, sensibilidad)) {
    errores.sensibilidad = "Elegí cómo sentís la temperatura.";
  }

  const ciudad = leerCiudad(valores);
  if (ciudad === undefined) errores.ciudad = "Elegí la ciudad de la lista.";

  if (Object.keys(errores).length > 0) return { errores, datos: null };

  return {
    errores: {},
    datos: { nombre, horaSalida, horaVuelta, sensibilidad, ciudad },
  };
}

function esHora(n) {
  return Number.isInteger(n) && n >= 0 && n <= 23;
}

// null si no hay ciudad, { nombre, lat, lon } si es válida, undefined si
// vino algo pero no sirve (por ejemplo, coordenadas fuera de rango).
function leerCiudad({ ciudadNombre, ciudadLat, ciudadLon }) {
  const nombre = String(ciudadNombre ?? "").trim();
  const vacios = [nombre, ciudadLat, ciudadLon].every((v) => v == null || v === "");
  if (vacios) return null;

  const lat = Number(ciudadLat);
  const lon = Number(ciudadLon);
  const valida =
    nombre &&
    nombre.length <= MAX_CIUDAD &&
    ciudadLat !== "" &&
    ciudadLon !== "" &&
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180;

  return valida ? { nombre, lat, lon } : undefined;
}
