// Pruebas de la validación de paletas del panel de admin. Correr con: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { validarPaleta } from "../lib/paletas.js";

const valida = {
  clima: "lluvia",
  nombre: "  Piloto amarillo ",
  armonia: "complementaria",
  colores: ["#1D3557", "#457b9d", "#a8dadc", "#e9c46a"],
  descripcion: "Azules con un amarillo.",
};

test("una paleta válida se limpia (nombre sin espacios, hex en minúscula)", () => {
  const { errores, datos } = validarPaleta(valida);
  assert.deepEqual(errores, {});
  assert.equal(datos.nombre, "Piloto amarillo");
  assert.equal(datos.colores[0], "#1d3557");
});

test("entre 4 y 6 colores, válidos y sin repetir", () => {
  assert.ok(
    validarPaleta({ ...valida, colores: ["#000000", "#ffffff", "#ff0000"] })
      .errores.colores,
  );
  assert.ok(
    validarPaleta({
      ...valida,
      colores: Array(7)
        .fill(0)
        .map((_, i) => `#00000${i}`),
    }).errores.colores,
  );
  assert.ok(
    validarPaleta({
      ...valida,
      colores: ["#000000", "#ffffff", "#ff0000", "rojo"],
    }).errores.colores,
  );
  assert.ok(
    validarPaleta({
      ...valida,
      colores: ["#000000", "#000000", "#ff0000", "#00ff00"],
    }).errores.colores,
  );
});

test("clima, armonía y nombre obligatorios", () => {
  const { errores } = validarPaleta({
    ...valida,
    clima: "tormenta",
    armonia: "rara",
    nombre: "",
  });
  assert.ok(errores.clima);
  assert.ok(errores.armonia);
  assert.ok(errores.nombre);
});
