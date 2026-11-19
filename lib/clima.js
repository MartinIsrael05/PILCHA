// Todo lo relacionado con el clima: pedirle datos a Open-Meteo y resumirlos.
// Open-Meteo es gratis y no pide API key. Estas funciones se pueden usar
// tanto en el servidor como en el navegador.

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
// Reverse geocoding: Open-Meteo no lo ofrece. BigDataCloud tiene un endpoint
// gratuito sin API key pensado para esto (ver README). No lo usamos para
// pedir el clima: solo para traducir lat/lon en un nombre humano cuando el
// usuario comparte su ubicación.
const REVERSE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

const VARIABLES_HORARIAS = [
  "temperature_2m",
  "apparent_temperature",
  "precipitation_probability",
  "wind_speed_10m",
  "uv_index",
  "weather_code",
  "is_day",
].join(",");

const VARIABLES_ACTUALES = [
  "temperature_2m",
  "apparent_temperature",
  "weather_code",
  "is_day",
].join(",");

// ---------------------------------------------------------------------------
// Pedidos a la API
// ---------------------------------------------------------------------------

// Busca ciudades por nombre. Devuelve hasta 5 resultados.
export async function buscarCiudad(nombre) {
  const texto = nombre?.trim();
  if (!texto || texto.length < 2) return [];

  const params = new URLSearchParams({
    name: texto,
    count: "5",
    language: "es",
  });

  // En el servidor, Next.js cachea la respuesta un día (las ciudades no cambian).
  // En el navegador la opción "next" se ignora.
  const res = await fetch(`${GEOCODING_URL}?${params}`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error("No pudimos buscar la ciudad.");

  const datos = await res.json();
  return (datos.results ?? []).map((r) => ({
    id: r.id,
    nombre: r.name,
    lat: r.latitude,
    lon: r.longitude,
    // "Córdoba, Argentina" para distinguir ciudades con el mismo nombre.
    detalle: [r.admin1, r.country].filter(Boolean).join(", "),
  }));
}

// Dada una latitud y longitud, devuelve el nombre de la ciudad o localidad.
// Si el servicio falla (sin conexión, 429, etc.), devuelve null y quien
// llame se queda con el fallback que prefiera ("Tu ubicación").
export async function reverseGeocode(lat, lon) {
  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      localityLanguage: "es",
    });
    const res = await fetch(`${REVERSE_URL}?${params}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const datos = await res.json();
    // Priorizamos el nombre más familiar: ciudad > localidad > principalSubdivision.
    return (
      datos.city ||
      datos.locality ||
      datos.principalSubdivision ||
      null
    );
  } catch {
    return null;
  }
}

// Pronóstico por hora. timezone=auto hace que las horas vengan en la hora
// local de la ciudad, así "las 9" son las 9 de allá y no las de Argentina.
// dias=2 por default: si la ventana del usuario ya pasó (por ejemplo salgo
// 9 vuelvo 20 y ahora son las 22), podemos mostrar la de mañana.
// Por defecto pide 3 días: hoy, mañana y pasado. El tercero hace falta
// cuando la ventana de hoy ya pasó (la app muestra mañana) y la tarjeta
// "Tené en cuenta" tiene que hablar del día siguiente a ese.
export async function getPronostico(lat, lon, { dias = 3 } = {}) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: VARIABLES_HORARIAS,
    current: VARIABLES_ACTUALES,
    timezone: "auto",
    forecast_days: String(dias),
  });

  // Cacheamos media hora: el pronóstico no cambia tan seguido.
  const res = await fetch(`${FORECAST_URL}?${params}`, {
    next: { revalidate: 1800 },
  });
  if (!res.ok) throw new Error("No pudimos obtener el pronóstico.");

  return res.json();
}

// Pronóstico por día (para el modo viaje). Open-Meteo cubre hasta 16 días;
// usamos 14 como máximo de viaje.
const VARIABLES_DIARIAS = [
  "temperature_2m_max",
  "temperature_2m_min",
  "apparent_temperature_max",
  "apparent_temperature_min",
  "precipitation_probability_max",
  "weather_code",
  "uv_index_max",
  "wind_speed_10m_max",
].join(",");

export async function getPronosticoDiario(lat, lon) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    daily: VARIABLES_DIARIAS,
    timezone: "auto",
    forecast_days: "16",
  });

  const res = await fetch(`${FORECAST_URL}?${params}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("No pudimos obtener el pronóstico.");

  return res.json();
}

// ---------------------------------------------------------------------------
// Procesamiento (funciones puras, sin red)
// ---------------------------------------------------------------------------

// Recorta el pronóstico a las horas en que el usuario está afuera y calcula
// el resumen que usa el resto de la app.
// Devuelve null si en esa ventana no hay datos.
//
// Ventana adaptativa: si el usuario consulta cuando la ventana del día ya
// pasó (por ejemplo "salgo 9 vuelvo 20" y son las 22), usamos la del día
// siguiente. Así las alertas (y especialmente la de UV) corresponden a
// algo real y no a lo que pasó hace horas. `auto` lo activa; `fecha`
// forzada lo desactiva para los tests.
export function resumirVentana(pronostico, horaSalida, horaVuelta, { fecha, auto = true } = {}) {
  const h = pronostico.hourly;

  const dia = fecha ?? elegirDia(pronostico, horaSalida, horaVuelta, auto);
  if (!dia) return null;

  const horas = [];
  h.time.forEach((time, i) => {
    // time viene como "2026-11-12T09:00"
    const hora = Number(time.slice(11, 13));
    if (time.startsWith(dia) && hora >= horaSalida && hora <= horaVuelta) {
      horas.push({
        hora,
        temp: h.temperature_2m[i],
        sensacion: h.apparent_temperature[i],
        lluviaProb: h.precipitation_probability[i] ?? 0,
        viento: h.wind_speed_10m[i],
        uv: h.uv_index[i] ?? 0,
        codigo: h.weather_code[i],
        esDeDia: h.is_day[i] === 1,
      });
    }
  });

  if (horas.length === 0) return null;

  const temps = horas.map((x) => x.temp);
  const horasDeDia = horas.filter((x) => x.esDeDia).length;
  // "paraMañana" ayuda a la UI: "Mañana entre las 9 y las 20".
  const hoy = (pronostico.current?.time ?? h.time[0]).slice(0, 10);

  return {
    tempMin: redondear(Math.min(...temps)),
    tempMax: redondear(Math.max(...temps)),
    sensacion: redondear(promedio(horas.map((x) => x.sensacion))),
    lluviaProb: Math.max(...horas.map((x) => x.lluviaProb)),
    viento: redondear(Math.max(...horas.map((x) => x.viento))),
    uv: redondear(Math.max(...horas.map((x) => x.uv))),
    codigo: codigoPredominante(horas.map((x) => x.codigo)),
    // Es "de día" si la mayoría de las horas de la ventana son de día.
    esDeDia: horasDeDia >= horas.length / 2,
    horas,
    fecha: dia,
    paraManana: dia > hoy,
  };
}

// Qué día usar para la ventana: hoy si todavía no pasó la hora de vuelta,
// mañana si la ventana ya pasó. Puede devolver null si no hay suficientes
// días en el pronóstico.
function elegirDia(pronostico, horaSalida, horaVuelta, auto) {
  if (!auto) return pronostico.hourly.time[0].slice(0, 10);
  return elegirFecha(pronostico, null, horaVuelta).fecha;
}

// Qué fecha mostrar según la pestaña que eligió el usuario en /hoy:
//   "hoy" o "manana": esa, sin vueltas.
//   null (no eligió): hoy, salvo que su horario de hoy ya haya terminado;
//   en ese caso, mañana. Es la "ventana adaptativa".
// Devuelve también las fechas de hoy y mañana (mañana es null si no está
// en el pronóstico) y si el horario de hoy ya terminó.
export function elegirFecha(pronostico, dia, horaVuelta) {
  const h = pronostico.hourly;
  // Hora local actual que viene con `current.time`. Si no está, usamos el
  // primer time del hourly (que es la hora redondeada del arranque del día).
  const ahora = pronostico.current?.time ?? h.time[0];
  const hoy = ahora.slice(0, 10);
  const siguiente = diaSiguiente(hoy);
  const manana = h.time.some((t) => t.startsWith(siguiente)) ? siguiente : null;
  const hoyTerminado = Number(ahora.slice(11, 13)) >= horaVuelta;

  let fecha = hoy;
  if (dia === "manana" && manana) fecha = manana;
  else if (dia !== "hoy" && hoyTerminado && manana) fecha = manana;

  return { fecha, hoy, manana, hoyTerminado };
}

// "2026-11-20" => "viernes 20". Mediodía UTC para que ningún huso horario
// cambie el día.
export function nombreDelDia(fecha) {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${fecha}T12:00:00Z`));
}

// "2026-11-19" => "2026-11-20". En UTC para no depender del huso horario
// del servidor: solo sumamos un día al calendario.
export function diaSiguiente(fecha) {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return new Date(Date.UTC(anio, mes - 1, dia + 1)).toISOString().slice(0, 10);
}

// Las 24 horas de un día, con lo justo para dibujar la curva del selector
// de horario: hora, temperatura y probabilidad de lluvia.
export function horasDelDia(pronostico, fecha) {
  const h = pronostico.hourly;
  const horas = [];
  h.time.forEach((time, i) => {
    if (time.startsWith(fecha)) {
      horas.push({
        hora: Number(time.slice(11, 13)),
        temp: redondear(h.temperature_2m[i]),
        lluviaProb: h.precipitation_probability[i] ?? 0,
      });
    }
  });
  return horas;
}

// Elige qué paleta corresponde al clima. Devuelve una de las claves de
// paletas.clima: soleado-calido, soleado-templado, nublado, lluvia, frio, noche.
export function condicionPaleta(clima) {
  if (!clima.esDeDia) return "noche";
  if (esLluvia(clima.codigo) || clima.lluviaProb >= 60) return "lluvia";
  if (esNieve(clima.codigo) || clima.sensacion < 12) return "frio";
  if (clima.codigo <= 1) {
    return clima.sensacion >= 22 ? "soleado-calido" : "soleado-templado";
  }
  return "nublado";
}

// Texto e ícono para cada código del clima (códigos WMO que usa Open-Meteo).
export function describirCodigo(codigo, esDeDia = true) {
  if (codigo === 0) return { texto: "Despejado", icono: esDeDia ? "☀️" : "🌙" };
  if (codigo === 1) return { texto: "Mayormente despejado", icono: esDeDia ? "🌤️" : "🌙" };
  if (codigo === 2) return { texto: "Parcialmente nublado", icono: "⛅" };
  if (codigo === 3) return { texto: "Nublado", icono: "☁️" };
  if (codigo === 45 || codigo === 48) return { texto: "Niebla", icono: "🌫️" };
  if (codigo >= 51 && codigo <= 57) return { texto: "Llovizna", icono: "🌦️" };
  if (codigo >= 61 && codigo <= 67) return { texto: "Lluvia", icono: "🌧️" };
  if (codigo >= 71 && codigo <= 77) return { texto: "Nieve", icono: "❄️" };
  if (codigo >= 80 && codigo <= 82) return { texto: "Chaparrones", icono: "🌦️" };
  if (codigo === 85 || codigo === 86) return { texto: "Nevadas", icono: "🌨️" };
  if (codigo === 95) return { texto: "Tormenta", icono: "⛈️" };
  if (codigo === 96 || codigo === 99) return { texto: "Tormenta con granizo", icono: "⛈️" };
  return { texto: "Sin datos", icono: "🌡️" };
}

// Nivel del índice UV según la escala de la OMS.
export function nivelUV(uv) {
  if (uv < 3) return "bajo";
  if (uv < 6) return "moderado";
  if (uv < 8) return "alto";
  if (uv < 11) return "muy alto";
  return "extremo";
}

export function esLluvia(codigo) {
  return (
    (codigo >= 51 && codigo <= 67) ||
    (codigo >= 80 && codigo <= 82) ||
    codigo >= 95
  );
}

export function esNieve(codigo) {
  return (codigo >= 71 && codigo <= 77) || codigo === 85 || codigo === 86;
}

// Tormenta con o sin granizo (códigos WMO 95, 96, 99).
export function esTormenta(codigo) {
  return codigo === 95 || codigo === 96 || codigo === 99;
}

// Niebla / neblina helada (códigos 45 y 48).
export function esNiebla(codigo) {
  return codigo === 45 || codigo === 48;
}

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

// El código que más se repite en la ventana. Si hay empate, gana el más
// "fuerte" (los códigos WMO más altos son peores: lluvia, tormenta).
function codigoPredominante(codigos) {
  const cuenta = {};
  for (const c of codigos) cuenta[c] = (cuenta[c] ?? 0) + 1;

  let mejor = codigos[0];
  for (const c of Object.keys(cuenta).map(Number)) {
    if (cuenta[c] > cuenta[mejor] || (cuenta[c] === cuenta[mejor] && c > mejor)) {
      mejor = c;
    }
  }
  return mejor;
}

function promedio(valores) {
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

function redondear(n) {
  return Math.round(n * 10) / 10;
}
