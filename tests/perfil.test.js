// Pruebas de la validación del perfil. Correr con: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { validarPerfil } from "../lib/perfil.js";

const valido = {
  nombre: "  Martín ",
  horaSalida: "8",
  horaVuelta: "19",
  sensibilidad: "friolento",
  ciudadNombre: "Rosario",
  ciudadLat: "-32.95",
  ciudadLon: "-60.64",
};

test("un perfil válido se limpia y convierte a números", () => {
  const { errores, datos } = validarPerfil(valido);
  assert.deepEqual(errores, {});
  assert.deepEqual(datos, {
    nombre: "Martín",
    horaSalida: 8,
    horaVuelta: 19,
    sensibilidad: "friolento",
    ciudad: { nombre: "Rosario", lat: -32.95, lon: -60.64 },
  });
});

test("la ciudad es opcional", () => {
  const { errores, datos } = validarPerfil({
    ...valido,
    ciudadNombre: "",
    ciudadLat: "",
    ciudadLon: "",
  });
  assert.deepEqual(errores, {});
  assert.equal(datos.ciudad, null);
});

test("una ciudad a medias o con coordenadas imposibles da error", () => {
  assert.ok(validarPerfil({ ...valido, ciudadLat: "" }).errores.ciudad);
  assert.ok(validarPerfil({ ...valido, ciudadLat: "123" }).errores.ciudad);
});

test("la vuelta tiene que ser después de la salida", () => {
  const { errores } = validarPerfil({ ...valido, horaSalida: "20", horaVuelta: "9" });
  assert.ok(errores.horaVuelta);
});

test("horas, sensibilidad y nombre inválidos", () => {
  const { errores } = validarPerfil({
    ...valido,
    nombre: "",
    horaSalida: "25",
    sensibilidad: "tibio",
  });
  assert.ok(errores.nombre);
  assert.ok(errores.horaSalida);
  assert.ok(errores.sensibilidad);
});
