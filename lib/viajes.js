// Modo viaje: con el pronóstico de cada día del viaje y tu placard, arma la
// valija. Funciones puras (sin red ni Firebase) para poder probarlas.
import { recomendar, UMBRALES } from "./recomendar.js";
import { esLluvia } from "./clima.js";

export const MAX_DIAS_VIAJE = 14;

// Cuántos días seguidos se puede usar una misma prenda en un viaje. Las
// remeras y camisas, 2 días; lo demás (pantalones, abrigos, calzado,
// accesorios) se reusa todo lo que haga falta.
export const MAX_DIAS_POR_PRENDA = { superior: 2 };

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

// Cantidad de días entre dos fechas "YYYY-MM-DD", contando las dos puntas.
export function contarDias(desde, hasta) {
  const ms = Date.parse(`${hasta}T12:00:00Z`) - Date.parse(`${desde}T12:00:00Z`);
  return Math.round(ms / 86400000) + 1;
}

// Valida las fechas que manda el formulario. Que estén dentro del pronóstico
// se chequea después, con los datos de Open-Meteo.
export function validarFechas({ desde, hasta }) {
  const errores = {};
  if (!FECHA.test(String(desde ?? ""))) errores.desde = "Elegí la fecha de ida.";
  if (!FECHA.test(String(hasta ?? ""))) errores.hasta = "Elegí la fecha de vuelta.";
  if (Object.keys(errores).length) return errores;

  const dias = contarDias(desde, hasta);
  if (dias < 1) errores.hasta = "La vuelta tiene que ser el mismo día o después de la ida.";
  else if (dias > MAX_DIAS_VIAJE) {
    errores.hasta = `El viaje puede durar hasta ${MAX_DIAS_VIAJE} días (lo que cubre el pronóstico).`;
  }
  return errores;
}

// Recorta el pronóstico diario a las fechas del viaje y lo pasa al mismo
// formato de "clima" que usa el motor. Devuelve null si alguna fecha no está
// en el pronóstico (por ejemplo, si es más de 16 días hacia adelante).
export function climaPorDia(diario, desde, hasta) {
  const d = diario.daily;
  const inicio = d.time.indexOf(desde);
  const fin = d.time.indexOf(hasta);
  if (inicio === -1 || fin === -1 || fin < inicio) return null;

  const dias = [];
  for (let i = inicio; i <= fin; i++) {
    dias.push({
      fecha: d.time[i],
      tempMin: d.temperature_2m_min[i],
      tempMax: d.temperature_2m_max[i],
      // Sensación del día: el promedio entre la mínima y la máxima.
      sensacion: Math.round(((d.apparent_temperature_min[i] + d.apparent_temperature_max[i]) / 2) * 10) / 10,
      lluviaProb: d.precipitation_probability_max[i] ?? 0,
      viento: d.wind_speed_10m_max[i] ?? 0,
      uv: d.uv_index_max[i] ?? 0,
      codigo: d.weather_code[i],
      esDeDia: true,
    });
  }
  return dias;
}

export function resumenClima(dias) {
  return {
    tempMin: Math.min(...dias.map((d) => d.tempMin)),
    tempMax: Math.max(...dias.map((d) => d.tempMax)),
    diasLluvia: dias.filter((d) => d.lluviaProb >= UMBRALES.lluvia || esLluvia(d.codigo)).length,
  };
}

// Arma la valija día por día.
// 1. Primero intenta armar el outfit del día SOLO con lo que ya está en la
//    valija (y que no pasó su máximo de días).
// 2. Para cada categoría que haga falta y no se cubra así, le pide al motor
//    la mejor prenda de todo el placard y la suma a la valija.
// Así la valija lleva lo mínimo que alcanza para todos los días.
export function armarValija({ dias, prendas, perfil = null }) {
  const valija = new Map(); // id -> { prenda, fechas: [] }
  const porDia = [];
  const faltantes = new Map(); // categoria -> { categoria, texto, fechas: [] }

  for (const clima of dias) {
    // Las que ya se usaron todos los días permitidos no se pueden volver a elegir.
    const agotadas = new Set(
      [...valija.values()]
        .filter(({ prenda, fechas }) => fechas.length >= (MAX_DIAS_POR_PRENDA[prenda.categoria] ?? Infinity))
        .map(({ prenda }) => prenda.id)
    );
    const enValija = [...valija.values()].map(({ prenda }) => prenda).filter((p) => !agotadas.has(p.id));
    const delPlacard = prendas.filter((p) => !agotadas.has(p.id));

    const conValija = recomendar({ clima, perfil, prendas: enValija });
    const conPlacard = recomendar({ clima, perfil, prendas: delPlacard });

    const elegidas = [];
    conValija.outfit.forEach((item, i) => {
      if (item.prenda) {
        elegidas.push(item.prenda);
        return;
      }
      // El motor arma las categorías en el mismo orden con el mismo clima,
      // así que el item i de las dos recomendaciones es la misma categoría.
      const nueva = conPlacard.outfit[i].prenda;
      if (nueva && !elegidas.some((p) => p.id === nueva.id)) {
        elegidas.push(nueva);
      } else if (!nueva && !item.opcional) {
        const falta = faltantes.get(item.categoria) ?? { categoria: item.categoria, texto: item.texto, fechas: [] };
        falta.fechas.push(clima.fecha);
        faltantes.set(item.categoria, falta);
      }
    });

    for (const prenda of elegidas) {
      const entrada = valija.get(prenda.id) ?? { prenda, fechas: [] };
      entrada.fechas.push(clima.fecha);
      valija.set(prenda.id, entrada);
    }
    porDia.push({ ...clima, prendaIds: elegidas.map((p) => p.id), nivel: conPlacard.nivel });
  }

  return {
    valija: [...valija.values()],
    porDia,
    faltantes: [...faltantes.values()],
  };
}

// "sáb, 21 nov" a partir de "2026-11-21". Usamos UTC al mediodía para
// que la fecha no se corra un día por la zona horaria del servidor.
export function formatearDia(fecha) {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${fecha}T12:00:00Z`));
}
