// Pruebas de lib/clima.js. Correr con: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  resumirVentana,
  esLluvia,
  esNieve,
  esTormenta,
  esNiebla,
  condicionPaleta,
} from "../lib/clima.js";

// Arma un pronóstico con 2 días horarios (hoy y mañana) y una "current.time"
// que dice la hora local actual.
function pronostico({ hoy = "2026-11-19", ahoraHora = 10 } = {}) {
  const partes = hoy.split("-").map(Number);
  const fechaUTC = Date.UTC(partes[0], partes[1] - 1, partes[2]);
  const siguiente = new Date(fechaUTC + 86400000).toISOString().slice(0, 10);

  const time = [];
  const temperature_2m = [];
  const apparent_temperature = [];
  const precipitation_probability = [];
  const wind_speed_10m = [];
  const uv_index = [];
  const weather_code = [];
  const is_day = [];

  for (const dia of [hoy, siguiente]) {
    for (let h = 0; h < 24; h++) {
      time.push(`${dia}T${String(h).padStart(2, "0")}:00`);
      temperature_2m.push(h < 6 || h > 20 ? 15 : 24);
      apparent_temperature.push(h < 6 || h > 20 ? 14 : 23);
      precipitation_probability.push(10);
      wind_speed_10m.push(15);
      // UV solo de día: mediodía alto, noche 0.
      uv_index.push(h >= 10 && h <= 16 ? 8 : 0);
      weather_code.push(0);
      is_day.push(h >= 7 && h <= 19 ? 1 : 0);
    }
  }

  return {
    current: { time: `${hoy}T${String(ahoraHora).padStart(2, "0")}:00` },
    hourly: {
      time,
      temperature_2m,
      apparent_temperature,
      precipitation_probability,
      wind_speed_10m,
      uv_index,
      weather_code,
      is_day,
    },
  };
}

test("resumirVentana usa hoy si la ventana todavía no terminó", () => {
  const r = resumirVentana(pronostico({ ahoraHora: 14 }), 9, 20);
  assert.equal(r.fecha, "2026-11-19");
  assert.equal(r.paraManana, false);
});

test("resumirVentana pasa a mañana si la ventana ya pasó", () => {
  const r = resumirVentana(pronostico({ ahoraHora: 22 }), 9, 20);
  assert.equal(r.fecha, "2026-11-20");
  assert.equal(r.paraManana, true);
});

test("resumirVentana respeta la fecha forzada (desactiva auto)", () => {
  const r = resumirVentana(pronostico({ ahoraHora: 22 }), 9, 20, { fecha: "2026-11-19" });
  assert.equal(r.fecha, "2026-11-19");
});

test("resumirVentana marca esDeDia según la mayoría de horas", () => {
  const r = resumirVentana(pronostico({ ahoraHora: 10 }), 9, 20);
  assert.equal(r.esDeDia, true);
});

test("clasificadores de código: lluvia, nieve, tormenta, niebla", () => {
  assert.equal(esLluvia(61), true); // lluvia
  assert.equal(esLluvia(80), true); // chaparrón
  assert.equal(esLluvia(0), false);
  assert.equal(esNieve(73), true);
  assert.equal(esTormenta(95), true);
  assert.equal(esTormenta(99), true);
  assert.equal(esNiebla(45), true);
  assert.equal(esNiebla(48), true);
  assert.equal(esNiebla(0), false);
});

test("condicionPaleta: noche gana sobre todo", () => {
  assert.equal(
    condicionPaleta({ esDeDia: false, codigo: 0, sensacion: 20, lluviaProb: 0 }),
    "noche",
  );
});
