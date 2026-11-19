// Pruebas de lib/manana.js y de los helpers de días de lib/clima.js.
// Correr con: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { compararConManana } from "../lib/manana.js";
import { diaSiguiente, horasDelDia } from "../lib/clima.js";

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
