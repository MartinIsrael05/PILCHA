// Pruebas de lib/manana.js y de los helpers de días de lib/clima.js.
// Correr con: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { compararConManana } from "../lib/manana.js";
import { diaSiguiente, elegirFecha, horasDelDia, nombreDelDia } from "../lib/clima.js";
import { hrefConDia, leerDia } from "../lib/ubicacion.js";

// Un resumen de ventana como el que devuelve resumirVentana.
function clima(datos = {}) {
  return {
    tempMin: 18,
    tempMax: 24,
    sensacion: 22,
    lluviaProb: 10,
    viento: 10,
    uv: 3,
    codigo: 1,
    esDeDia: true,
    ...datos,
  };
}

test("si mañana es parecido a hoy, no hay consejos", () => {
  const { consejos } = compararConManana({ hoy: clima(), manana: clima({ sensacion: 23 }) });
  assert.deepEqual(consejos, []);
});

test("avisa cuando mañana está bastante más fresco y pide abrigo", () => {
  const { diferencia, consejos } = compararConManana({
    hoy: clima({ sensacion: 24 }),
    manana: clima({ sensacion: 10, tempMin: 8, tempMax: 13 }),
  });
  assert.equal(diferencia, -14);
  assert.ok(consejos.some((c) => c.tipo === "frio" && c.texto.includes("14° más fresco")));
  assert.ok(consejos.some((c) => c.tipo === "abrigo" && c.texto.startsWith("Sumá abrigo")));
});

test("si mañana hace calor, dice que se puede dejar el abrigo", () => {
  const { consejos } = compararConManana({
    hoy: clima({ sensacion: 10, tempMin: 8, tempMax: 13 }),
    manana: clima({ sensacion: 25, tempMin: 22, tempMax: 28 }),
  });
  assert.ok(consejos.some((c) => c.tipo === "calor"));
  assert.ok(consejos.some((c) => c.texto === "Podés salir sin abrigo."));
});

test("avisa la lluvia solo si cambia respecto de hoy", () => {
  const llueveManana = compararConManana({ hoy: clima(), manana: clima({ lluviaProb: 70 }) });
  assert.ok(llueveManana.consejos.some((c) => c.tipo === "lluvia" && c.texto.includes("70%")));

  const llueveLosDos = compararConManana({
    hoy: clima({ lluviaProb: 80 }),
    manana: clima({ lluviaProb: 70 }),
  });
  assert.ok(!llueveLosDos.consejos.some((c) => c.tipo === "lluvia"));

  const dejaDeLlover = compararConManana({ hoy: clima({ lluviaProb: 80 }), manana: clima() });
  assert.ok(dejaDeLlover.consejos.some((c) => c.texto.startsWith("Deja de llover")));
});

test("sugiere capas si mañana hay mucha amplitud y hoy no", () => {
  const { consejos } = compararConManana({
    hoy: clima(),
    manana: clima({ tempMin: 12, tempMax: 25 }),
  });
  assert.ok(consejos.some((c) => c.tipo === "capas" && c.texto.includes("12° a 25°")));
});

test("diaSiguiente cruza fin de mes y de año", () => {
  assert.equal(diaSiguiente("2026-11-19"), "2026-11-20");
  assert.equal(diaSiguiente("2026-11-30"), "2026-12-01");
  assert.equal(diaSiguiente("2026-12-31"), "2027-01-01");
});

test("horasDelDia devuelve las 24 horas de esa fecha y nada más", () => {
  const time = [];
  const temperature_2m = [];
  const precipitation_probability = [];
  for (const dia of ["2026-11-19", "2026-11-20"]) {
    for (let h = 0; h < 24; h++) {
      time.push(`${dia}T${String(h).padStart(2, "0")}:00`);
      temperature_2m.push(dia === "2026-11-20" ? 10 + h * 0.5 : 0);
      precipitation_probability.push(h === 15 ? 60 : 0);
    }
  }
  const horas = horasDelDia(
    { hourly: { time, temperature_2m, precipitation_probability } },
    "2026-11-20"
  );
  assert.equal(horas.length, 24);
  assert.deepEqual(horas[15], { hora: 15, temp: 17.5, lluviaProb: 60 });
});

test("cada consejo trae una etiqueta corta para las pestañas", () => {
  const { consejos } = compararConManana({
    hoy: clima({ sensacion: 24 }),
    manana: clima({ sensacion: 10, tempMin: 8, tempMax: 13, lluviaProb: 80 }),
  });
  const etiquetas = consejos.map((c) => c.etiqueta);
  assert.ok(etiquetas.includes("↓ 14°"));
  assert.ok(etiquetas.includes("🧥 más abrigo"));
  assert.ok(etiquetas.includes("💧 80%"));
});

// Pronóstico mínimo para elegirFecha: hoy y mañana, y la hora actual.
function pronosticoDosDias(ahoraHora) {
  const time = [];
  for (const dia of ["2026-11-19", "2026-11-20"]) {
    for (let h = 0; h < 24; h++) time.push(`${dia}T${String(h).padStart(2, "0")}:00`);
  }
  return {
    current: { time: `2026-11-19T${String(ahoraHora).padStart(2, "0")}:00` },
    hourly: { time },
  };
}

test("elegirFecha: automático muestra hoy si el horario no terminó", () => {
  const r = elegirFecha(pronosticoDosDias(10), null, 20);
  assert.deepEqual(r, { fecha: "2026-11-19", hoy: "2026-11-19", manana: "2026-11-20", hoyTerminado: false });
});

test("elegirFecha: automático pasa a mañana si el horario de hoy terminó", () => {
  const r = elegirFecha(pronosticoDosDias(21), null, 20);
  assert.equal(r.fecha, "2026-11-20");
  assert.equal(r.hoyTerminado, true);
});

test("elegirFecha: la pestaña elegida manda sobre el automático", () => {
  assert.equal(elegirFecha(pronosticoDosDias(21), "hoy", 20).fecha, "2026-11-19");
  assert.equal(elegirFecha(pronosticoDosDias(10), "manana", 20).fecha, "2026-11-20");
});

test("elegirFecha: sin mañana en el pronóstico se queda en hoy", () => {
  const p = pronosticoDosDias(21);
  p.hourly.time = p.hourly.time.filter((t) => t.startsWith("2026-11-19"));
  const r = elegirFecha(p, "manana", 20);
  assert.equal(r.fecha, "2026-11-19");
  assert.equal(r.manana, null);
});

test("nombreDelDia arma el día de la semana y el número", () => {
  assert.equal(nombreDelDia("2026-11-20"), "viernes 20");
});

test("leerDia acepta solo hoy o manana", () => {
  assert.equal(leerDia({ dia: "hoy" }), "hoy");
  assert.equal(leerDia({ dia: "manana" }), "manana");
  assert.equal(leerDia({ dia: "pasado" }), null);
  assert.equal(leerDia({}), null);
});

test("hrefConDia conserva ubicación y horario y cambia el día", () => {
  const href = hrefConDia({ lat: "-34.61", lon: "-58.38", desde: "9", hasta: "20", dia: "hoy" }, "manana");
  assert.equal(href, "/hoy?lat=-34.61&lon=-58.38&desde=9&hasta=20&dia=manana");
});
