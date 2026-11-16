// Reglas y textos de las paletas. Sin red ni Firebase: lo usan las páginas,
// el admin y las pruebas. Los colores en sí viven en Firestore (colección
// "paletas") y se cargan con `npm run seed:paletas`.
import { colorAcento, colorDeTexto } from "./colores.js";

// Una paleta por cada condición que devuelve condicionPaleta() en lib/clima.js.
// El orden es el que se usa para listarlas.
// "frase" completa títulos como "Paleta para días de lluvia".
export const CLIMAS = {
  "soleado-calido": { nombre: "Soleado y cálido", icono: "☀️", frase: "para días de sol y calor" },
  "soleado-templado": { nombre: "Soleado y templado", icono: "🌤️", frase: "para días de sol templados" },
  nublado: { nombre: "Nublado", icono: "☁️", frase: "para días nublados" },
  lluvia: { nombre: "Lluvia", icono: "🌧️", frase: "para días de lluvia" },
  frio: { nombre: "Frío", icono: "🧣", frase: "para días de frío" },
  noche: { nombre: "Noche", icono: "🌙", frase: "para salir de noche" },
};

export const ARMONIAS = {
  analoga: {
    nombre: "Análoga",
    explicacion: "Colores vecinos en el círculo cromático: combinan sin esfuerzo.",
  },
  complementaria: {
    nombre: "Complementaria",
    explicacion: "Colores opuestos en el círculo cromático: contraste con energía.",
  },
  "neutros-acento": {
    nombre: "Neutros + acento",
    explicacion: "Una base de neutros con un color que resalta.",
  },
};

export const MIN_COLORES = 4;
export const MAX_COLORES = 6;

export function esClimaValido(clima) {
  return Object.hasOwn(CLIMAS, clima);
}

// Variables CSS para que la interfaz tome colores de la paleta del día:
//   --tema-acento: el color más vivo de la paleta.
//   --tema-acento-texto: negro o blanco, el que se lea mejor encima.
// Sin paleta devuelve undefined y los componentes usan los colores de siempre.
export function variablesDeTema(paleta) {
  const acento = colorAcento(paleta?.colores);
  if (!acento) return undefined;
  return {
    "--tema-acento": acento,
    "--tema-acento-texto": colorDeTexto(acento),
  };
}
