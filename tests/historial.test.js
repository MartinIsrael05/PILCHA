// Pruebas del historial y del aprendizaje. Correr con: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  nuevoAjuste,
  validarCalificacion,
  limpiarPrendaIds,
} from "../lib/historial.js";
import { calcularTempEfectiva, recomendar } from "../lib/recomendar.js";

test("frío baja el ajuste, calor lo sube, bien no lo cambia", () => {
  assert.equal(nuevoAjuste(0, null, "frio"), -0.5);
  assert.equal(nuevoAjuste(0, null, "calor"), 0.5);
  assert.equal(nuevoAjuste(1.5, null, "bien"), 1.5);
});

test("el aprendizaje va en el sentido correcto: con frío, más abrigo", () => {
  // Alguien calificó "frío" cuatro veces seguidas.
  let ajuste = 0;
  for (let i = 0; i < 4; i++) ajuste = nuevoAjuste(ajuste, null, "frio");
  assert.equal(ajuste, -2);

  const clima = { tempMin: 15, tempMax: 19, sensacion: 17, lluviaProb: 0, viento: 5, uv: 2, codigo: 3, esDeDia: true };
  const antes = recomendar({ clima, perfil: { sensibilidad: "normal", ajusteTermico: 0 } });
  const despues = recomendar({ clima, perfil: { sensibilidad: "normal", ajusteTermico: ajuste } });

  // 17° era "templado" (abrigo opcional); con lo aprendido pasa a "fresco"
  // (abrigo obligatorio).
  assert.equal(calcularTempEfectiva(clima, { ajusteTermico: ajuste }), 15);
  assert.equal(antes.nivel.clave, "templado");
  assert.equal(despues.nivel.clave, "fresco");
});

test("cambiar la calificación de un outfit no cuenta dos veces", () => {
  const conFrio = nuevoAjuste(0, null, "frio"); // -0.5
  assert.equal(nuevoAjuste(conFrio, "frio", "bien"), 0); // se deshace
  assert.equal(nuevoAjuste(conFrio, "frio", "calor"), 0.5); // de -0.5 a +0.5
  assert.equal(nuevoAjuste(conFrio, "frio", "frio"), -0.5); // la misma: no cambia
});

test("el ajuste queda entre -5 y +5", () => {
  assert.equal(nuevoAjuste(-5, null, "frio"), -5);
  assert.equal(nuevoAjuste(5, null, "calor"), 5);
});

test("validarCalificacion", () => {
  assert.deepEqual(validarCalificacion({ calificacion: "bien", nota: "  joya " }).datos, {
    calificacion: "bien",
    nota: "joya",
  });
  assert.ok(validarCalificacion({ calificacion: "tibio" }).errores.calificacion);
  assert.ok(validarCalificacion({ calificacion: "bien", nota: "x".repeat(201) }).errores.nota);
});

test("limpiarPrendaIds saca repetidos y rechaza rutas", () => {
  assert.deepEqual(limpiarPrendaIds(["a", "b", "a", " "]), ["a", "b"]);
  assert.equal(limpiarPrendaIds([]), null);
  assert.equal(limpiarPrendaIds(["../otro-usuario"]), null);
  assert.equal(limpiarPrendaIds(Array.from({ length: 9 }, (_, i) => `p${i}`)), null);
});
