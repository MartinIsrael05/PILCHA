// Pruebas de los cálculos de /stats. Correr con: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  familiaDeColor,
  masUsadas,
  nuncaUsadas,
  distribucionColores,
  calificacionesPorTemperatura,
} from "../lib/stats.js";

const prenda = (id, hex, usos) => ({ id, nombre: id, color: { hex }, usos });

test("familiaDeColor agrupa por tono y separa los neutros", () => {
  assert.equal(familiaDeColor("#ffffff").clave, "neutros");
  assert.equal(familiaDeColor("#ff0000").clave, "rojos");
  assert.equal(familiaDeColor("#f43f5e").clave, "rojos"); // rojo rosado, del otro lado del 0
  assert.equal(familiaDeColor("#5b3a29").clave, "tierras"); // marrón
  assert.equal(familiaDeColor("#16a34a").clave, "verdes");
  assert.equal(familiaDeColor("#1f3250").clave, "azules"); // azul marino
});

test("masUsadas ordena por usos y deja afuera las nunca usadas", () => {
  const prendas = [prenda("a", "#fff", 2), prenda("b", "#fff", 0), prenda("c", "#fff", 5)];
  assert.deepEqual(
    masUsadas(prendas).map((p) => p.id),
    ["c", "a"]
  );
  assert.deepEqual(
    nuncaUsadas(prendas).map((p) => p.id),
    ["b"]
  );
});

test("distribucionColores cuenta por familia de mayor a menor", () => {
  const prendas = [
    prenda("1", "#ffffff", 0),
    prenda("2", "#111111", 0),
    prenda("3", "#1f3250", 0),
  ];
  assert.deepEqual(
    distribucionColores(prendas).map((f) => [f.clave, f.cantidad]),
    [
      ["neutros", 2],
      ["azules", 1],
    ]
  );
});

test("calificacionesPorTemperatura agrupa por rango y saltea los sin calificar", () => {
  const outfit = (sensacion, calificacion) => ({ clima: { sensacion }, calificacion });
  const filas = calificacionesPorTemperatura([
    outfit(8, "frio"),
    outfit(10, "frio"),
    outfit(11, "bien"),
    outfit(25, "calor"),
    outfit(25, null), // sin calificar: no cuenta
  ]);
  assert.deepEqual(filas, [
    { clave: "frio", rango: "6 a 12°", frio: 2, bien: 1, calor: 0 },
    { clave: "caluroso", rango: "22 a 27°", frio: 0, bien: 0, calor: 1 },
  ]);
});
