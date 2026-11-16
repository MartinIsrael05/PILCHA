// Teoría del color para decidir qué prendas combinan entre sí y con la
// paleta del día. Funciones puras: reciben colores en hex ("#1e40af") y
// devuelven números, sin red ni base de datos.

// Puntajes de combinación, de 0 a 1.
export const PUNTAJE = {
  alto: 1, // análogos o complementarios
  neutro: 0.7, // un neutro combina con todo, pero no "suma" tanto como una armonía
  medio: 0.6, // triádicos
  bajo: 0.2, // colores que no siguen ninguna armonía
};

// Convierte "#rrggbb" (o "#rgb") a { h: 0-360, s: 0-100, l: 0-100 }.
export function hexAHsl(hex) {
  let limpio = String(hex).trim().replace("#", "");
  if (limpio.length === 3) {
    limpio = limpio.split("").map((c) => c + c).join("");
  }
  if (!/^[0-9a-f]{6}$/i.test(limpio)) {
    throw new Error(`Color inválido: ${hex}`);
  }

  // Pasamos cada canal a un valor entre 0 y 1.
  const r = parseInt(limpio.slice(0, 2), 16) / 255;
  const g = parseInt(limpio.slice(2, 4), 16) / 255;
  const b = parseInt(limpio.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  // Luminosidad: punto medio entre el canal más claro y el más oscuro.
  const l = (max + min) / 2;

  // Gris puro: no tiene tono ni saturación.
  if (delta === 0) return { h: 0, s: 0, l: Math.round(l * 100) };

  // Saturación: qué tan "vivo" es el color.
  const s = delta / (1 - Math.abs(2 * l - 1));

  // Tono: en qué parte del círculo cromático está (0 rojo, 120 verde, 240 azul).
  let h;
  if (max === r) h = ((g - b) / delta) % 6;
  else if (max === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;

  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Neutros: muy poco saturados (grises, beige) o casi negros o casi blancos.
export function esNeutro(hex) {
  const { s, l } = hexAHsl(hex);
  return s < 15 || l < 12 || l > 90;
}

// Distancia entre dos tonos en el círculo cromático (0 a 180 grados).
export function distanciaTono(h1, h2) {
  const d = Math.abs(h1 - h2) % 360;
  return d > 180 ? 360 - d : d;
}

// Qué tan bien combinan dos colores, de 0 a 1.
export function puntajeColores(hexA, hexB) {
  if (esNeutro(hexA) || esNeutro(hexB)) return PUNTAJE.neutro;

  const d = distanciaTono(hexAHsl(hexA).h, hexAHsl(hexB).h);
  if (d <= 30) return PUNTAJE.alto; // análogos: vecinos en el círculo
  if (d >= 150) return PUNTAJE.alto; // complementarios: opuestos (150° a 210°)
  if (d >= 105 && d <= 135) return PUNTAJE.medio; // triádicos: a ~120°
  return PUNTAJE.bajo;
}

// Qué tan bien combina un color con la paleta: el mejor puntaje contra
// cualquiera de sus colores. Sin paleta, devolvemos un valor neutro.
export function puntajeContraPaleta(hex, coloresPaleta = []) {
  if (!coloresPaleta.length) return PUNTAJE.neutro;
  return Math.max(...coloresPaleta.map((c) => puntajeColores(hex, c)));
}

// Luminancia relativa según WCAG (0 = negro, 1 = blanco).
function luminancia(hex) {
  const limpio = String(hex).replace("#", "");
  const canales = [0, 2, 4].map((i) => {
    const c = parseInt(limpio.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * canales[0] + 0.7152 * canales[1] + 0.0722 * canales[2];
}

// Contraste entre dos colores según WCAG (de 1 a 21).
export function contraste(hexA, hexB) {
  const [claro, oscuro] = [luminancia(hexA), luminancia(hexB)].sort((a, b) => b - a);
  return (claro + 0.05) / (oscuro + 0.05);
}

// Negro o blanco, el que se lea mejor encima de ese color.
export function colorDeTexto(hexFondo) {
  return contraste(hexFondo, "#000000") >= contraste(hexFondo, "#ffffff")
    ? "#000000"
    : "#ffffff";
}
