// Pruebas del modo viaje. Correr con: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  armarValija,
  climaPorDia,
  contarDias,
  formatearDia,
  resumenClima,
  validarFechas,
} from "../lib/viajes.js";

const prenda = (id, categoria, abrigo, extra = {}) => ({
  id,
  nombre: id,
  categoria,
  abrigo,
  color: { hex: "#ffffff" },
  impermeable: false,
  usos: 0,
  ...extra,
});

// Un día de pronóstico en el formato del motor.
const dia = (fecha, sensacion, extra = {}) => ({
  fecha,
  tempMin: sensacion - 3,
  tempMax: sensacion + 3,
  sensacion,
  lluviaProb: 0,
  viento: 10,
  uv: 3,
  codigo: 1,
  esDeDia: true,
  ...extra,
});

test("validarFechas: orden y máximo de 14 días", () => {
  assert.deepEqual(validarFechas({ desde: "2026-11-20", hasta: "2026-11-22" }), {});
  assert.ok(validarFechas({ desde: "2026-11-22", hasta: "2026-11-20" }).hasta);
  assert.ok(validarFechas({ desde: "2026-11-01", hasta: "2026-11-20" }).hasta);
  assert.ok(validarFechas({ desde: "", hasta: "2026-11-20" }).desde);
  assert.equal(contarDias("2026-11-28", "2026-12-02"), 5);
});

test("climaPorDia recorta el pronóstico y rechaza fechas fuera de rango", () => {
  const diario = {
    daily: {
      time: ["2026-11-18", "2026-11-19", "2026-11-20"],
      temperature_2m_min: [8, 9, 10],
      temperature_2m_max: [16, 17, 18],
      apparent_temperature_min: [6, 7, 8],
      apparent_temperature_max: [14, 15, 16],
      precipitation_probability_max: [80, 10, 0],
      weather_code: [61, 2, 0],
      uv_index_max: [3, 5, 8],
      wind_speed_10m_max: [20, 10, 5],
    },
  };
  const dias = climaPorDia(diario, "2026-11-19", "2026-11-20");
  assert.deepEqual(
    dias.map((d) => [d.fecha, d.sensacion]),
    [
      ["2026-11-19", 11],
      ["2026-11-20", 12],
    ]
  );
  assert.equal(climaPorDia(diario, "2026-11-19", "2026-12-25"), null);
  assert.deepEqual(resumenClima(climaPorDia(diario, "2026-11-18", "2026-11-20")), {
    tempMin: 8,
    tempMax: 18,
    diasLluvia: 1,
  });
});

test("armarValija reusa pantalón y calzado, y cada remera dura 2 días", () => {
  const prendas = [
    prenda("remera-1", "superior", 1),
    prenda("remera-2", "superior", 1),
    prenda("remera-3", "superior", 1),
    prenda("short", "inferior", 1),
    prenda("zapas", "calzado", 1),
  ];
  const dias = ["2026-11-20", "2026-11-21", "2026-11-22", "2026-11-23"].map((f) => dia(f, 25));
  const { valija, faltantes } = armarValija({ dias, prendas });

  const ids = valija.map((v) => v.prenda.id).sort();
  // 4 días: 2 remeras (2 días cada una), 1 short y 1 par de zapatillas.
  assert.deepEqual(ids, ["remera-1", "remera-2", "short", "zapas"]);
  assert.ok(valija.every((v) => v.prenda.categoria !== "superior" || v.fechas.length <= 2));
  assert.deepEqual(faltantes, []);
});

test("armarValija suma abrigo solo para los días fríos", () => {
  const prendas = [
    prenda("remera", "superior", 1),
    prenda("buzo", "superior", 3),
    prenda("short", "inferior", 1),
    prenda("jean", "inferior", 3),
    prenda("zapas", "calzado", 2),
    prenda("campera", "abrigo", 4),
  ];
  const dias = [dia("2026-11-20", 25), dia("2026-11-21", 9)];
  const { valija, porDia } = armarValija({ dias, prendas });

  const campera = valija.find((v) => v.prenda.id === "campera");
  assert.deepEqual(campera.fechas, ["2026-11-21"]);
  assert.ok(!porDia[0].prendaIds.includes("campera"));
});

test("armarValija avisa qué falta si el placard no alcanza", () => {
  const prendas = [prenda("remera", "superior", 1), prenda("short", "inferior", 1)];
  const { faltantes } = armarValija({ dias: [dia("2026-11-20", 25)], prendas });
  assert.deepEqual(
    faltantes.map((f) => [f.categoria, f.fechas]),
    [["calzado", ["2026-11-20"]]]
  );
});

test("formatearDia no se corre por la zona horaria", () => {
  assert.equal(formatearDia("2026-11-21"), "sáb, 21 nov");
});
