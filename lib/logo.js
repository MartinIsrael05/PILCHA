// Datos del logo de PILCHA. Viven acá (y no dentro del componente) porque
// los usan el header, el footer, el indicador de carga y la imagen de Open
// Graph.
//
// El logo tiene dos partes:
// - Isotipo: un cuadrado redondeado en degradé cálido con una percha blanca
//   adentro, dibujada con el mismo estilo de línea que los íconos del menú.
// - Palabra: "PILCHA" en Geist Black, la misma tipografía de los títulos.

// La percha completa (gancho, cuello, hombros y barra) en un solo trazo,
// dentro de una caja de 32 x 32.
export const PERCHA = "M13 11.25a3 3 0 1 1 3 3V16L6.5 23.75h19L16 16";
export const GROSOR_PERCHA = 2.5;

// Caja ajustada a la percha sola, sin el cuadrado (para la carga). El
// centro de arriba coincide con la punta del gancho: de ahí se balancea.
export const VIEWBOX_PERCHA = "5 6 22 20";

// Colores de marca: degradé de terracota a naranja, trazo blanco.
export const COLORES = {
  fondo1: "#e07a5f",
  fondo2: "#f2a65a",
  trazo: "#ffffff",
};
