// Cálculos de /stats. Funciones puras: reciben las prendas y los outfits ya
// leídos de Firestore y devuelven los datos listos para los gráficos.
import { esNeutro, hexAHsl } from "./colores.js";

// Familias de color para agrupar el placard. "muestra" es el color del
// cuadradito que acompaña a cada nombre en el gráfico.
// Los rangos de tono (h) van de 0 a 360 en el círculo cromático.
export const FAMILIAS_COLOR = [
  { clave: "neutros", nombre: "Neutros", muestra: "#9ca3af" },
  {
    clave: "rojos",
    nombre: "Rojos",
    muestra: "#dc2626",
    desde: 345,
    hasta: 15,
  },
  {
    clave: "tierras",
    nombre: "Naranjas y tierras",
    muestra: "#c2703d",
    desde: 15,
    hasta: 45,
  },
  {
    clave: "amarillos",
    nombre: "Amarillos",
    muestra: "#eab308",
    desde: 45,
    hasta: 70,
  },
  {
    clave: "verdes",
    nombre: "Verdes",
    muestra: "#16a34a",
    desde: 70,
    hasta: 170,
  },
  {
    clave: "azules",
    nombre: "Azules",
    muestra: "#2563eb",
    desde: 170,
    hasta: 255,
  },
  {
    clave: "violetas",
    nombre: "Violetas",
    muestra: "#7c3aed",
    desde: 255,
    hasta: 300,
  },
  {
    clave: "rosas",
    nombre: "Rosas",
    muestra: "#db2777",
    desde: 300,
    hasta: 345,
  },
];

// Los mismos cortes que los niveles del motor (lib/recomendar.js).
export const RANGOS_TEMPERATURA = [
  { clave: "muy-frio", nombre: "Menos de 6°", hasta: 6 },
  { clave: "frio", nombre: "6 a 12°", hasta: 12 },
  { clave: "fresco", nombre: "12 a 17°", hasta: 17 },
  { clave: "templado", nombre: "17 a 22°", hasta: 22 },
  { clave: "caluroso", nombre: "22 a 27°", hasta: 27 },
  { clave: "muy-caluroso", nombre: "27° o más", hasta: Infinity },
];

// Nunca tira: si el hex está mal guardado (un bug viejo, una migración),
// cuenta como neutro para no romper la página entera de estadísticas.
export function familiaDeColor(hex) {
  let h;
  try {
    if (esNeutro(hex)) return FAMILIAS_COLOR[0];
    h = hexAHsl(hex).h;
  } catch {
    return FAMILIAS_COLOR[0];
  }
  return (
    FAMILIAS_COLOR.slice(1).find((f) =>
      // Los rojos cruzan el 0: van de 345 a 360 y de 0 a 15.
      f.desde > f.hasta
        ? h >= f.desde || h < f.hasta
        : h >= f.desde && h < f.hasta,
    ) ?? FAMILIAS_COLOR[0]
  );
}

// Las prendas con más usos (solo las que se usaron al menos una vez).
export function masUsadas(prendas, limite = 5) {
  return prendas
    .filter((p) => p.usos > 0)
    .sort((a, b) => b.usos - a.usos || a.nombre.localeCompare(b.nombre))
    .slice(0, limite)
    .map((p) => ({ id: p.id, nombre: p.nombre, usos: p.usos }));
}

export function nuncaUsadas(prendas) {
  return prendas
    .filter((p) => !p.usos)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

// Cuántas prendas hay de cada familia de color, de mayor a menor.
export function distribucionColores(prendas) {
  const cuenta = new Map();
  for (const p of prendas) {
    const familia = familiaDeColor(p.color.hex);
    cuenta.set(familia.clave, (cuenta.get(familia.clave) ?? 0) + 1);
  }
  return FAMILIAS_COLOR.filter((f) => cuenta.has(f.clave))
    .map((f) => ({
      clave: f.clave,
      nombre: f.nombre,
      muestra: f.muestra,
      cantidad: cuenta.get(f.clave),
    }))
    .sort((a, b) => b.cantidad - a.cantidad);
}

export function rangoDeTemperatura(sensacion) {
  return RANGOS_TEMPERATURA.find((r) => sensacion < r.hasta);
}

// Para cada rango de sensación térmica, cuántas veces calificaste frío, bien
// o calor. Solo cuenta outfits calificados y rangos con al menos uno.
export function calificacionesPorTemperatura(outfits) {
  const filas = RANGOS_TEMPERATURA.map((r) => ({
    clave: r.clave,
    rango: r.nombre,
    frio: 0,
    bien: 0,
    calor: 0,
  }));

  for (const o of outfits) {
    if (!o.calificacion || typeof o.clima?.sensacion !== "number") continue;
    const rango = rangoDeTemperatura(o.clima.sensacion);
    const fila = filas.find((f) => f.clave === rango.clave);
    fila[o.calificacion] += 1;
  }
  return filas.filter((f) => f.frio + f.bien + f.calor > 0);
}
