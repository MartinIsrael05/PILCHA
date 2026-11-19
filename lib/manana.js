// Compara el clima de mañana con el de hoy y arma consejos cortos.
// Función pura, sin red ni Firebase, como el motor: se puede testear.
//
// La idea no es repetir otro pronóstico entero, sino decir qué cambia:
// "va a estar 8° más fresco", "sumá abrigo", "puede llover". Si nada
// cambia lo suficiente, devuelve la lista vacía y la UI dice "parecido a hoy".
import { esLluvia } from "./clima.js";
import { recomendar, UMBRALES } from "./recomendar.js";

// A partir de cuántos grados de sensación térmica vale la pena avisar.
export const DIFERENCIA_NOTABLE = 4;

export function compararConManana({ hoy, manana, perfil = null }) {
  const consejos = [];

  // 1. Temperatura: comparamos la sensación térmica de las dos ventanas.
  const diferencia = Math.round(manana.sensacion - hoy.sensacion);
  if (diferencia <= -DIFERENCIA_NOTABLE) {
    consejos.push({ tipo: "frio", texto: `Va a estar ${-diferencia}° más fresco que hoy.` });
  } else if (diferencia >= DIFERENCIA_NOTABLE) {
    consejos.push({ tipo: "calor", texto: `Va a estar ${diferencia}° más cálido que hoy.` });
  }

  // 2. Abrigo: corremos el motor para los dos días y comparamos el nivel
  // de abrigo que pide cada uno (0 si no pide abrigo).
  const abrigoHoy = nivelDeAbrigo(recomendar({ clima: hoy, perfil }));
  const requerimientoManana = abrigoRequerido(recomendar({ clima: manana, perfil }));
  const abrigoManana = requerimientoManana?.min ?? 0;

  if (abrigoManana > abrigoHoy) {
    consejos.push({
      tipo: "abrigo",
      texto:
        abrigoHoy === 0
          ? `Sumá abrigo: ${requerimientoManana.texto}.`
          : `Vas a necesitar más abrigo: ${requerimientoManana.texto}.`,
    });
  } else if (abrigoManana < abrigoHoy) {
    consejos.push({
      tipo: "abrigo",
      texto:
        abrigoManana === 0
          ? "Podés salir sin abrigo."
          : `Alcanza con algo más liviano: ${requerimientoManana.texto}.`,
    });
  }

  // 3. Lluvia: solo avisamos si cambia respecto de hoy.
  const lluviaHoy = hayLluvia(hoy);
  const lluviaManana = hayLluvia(manana);
  if (lluviaManana && !lluviaHoy) {
    consejos.push({
      tipo: "lluvia",
      texto: `Puede llover (${manana.lluviaProb}%): dejá el paraguas a mano.`,
    });
  } else if (!lluviaManana && lluviaHoy) {
    consejos.push({ tipo: "lluvia", texto: "Deja de llover: el paraguas puede quedarse en casa." });
  }

  // 4. Amplitud: si mañana hay mucha diferencia entre la mínima y la máxima
  // y hoy no, conviene vestirse en capas.
  if (amplitud(manana) >= UMBRALES.amplitud && amplitud(hoy) < UMBRALES.amplitud) {
    consejos.push({
      tipo: "capas",
      texto: `Cambia mucho en el día (${Math.round(manana.tempMin)}° a ${Math.round(manana.tempMax)}°): vestite en capas.`,
    });
  }

  return { diferencia, consejos };
}

// El abrigo que el motor pide como obligatorio (los opcionales no cuentan).
function abrigoRequerido(recomendacion) {
  return recomendacion.requerimientos.find((r) => r.categoria === "abrigo" && !r.opcional);
}

function nivelDeAbrigo(recomendacion) {
  return abrigoRequerido(recomendacion)?.min ?? 0;
}

function hayLluvia(clima) {
  return clima.lluviaProb >= UMBRALES.lluvia || esLluvia(clima.codigo);
}

function amplitud(clima) {
  return clima.tempMax - clima.tempMin;
}
