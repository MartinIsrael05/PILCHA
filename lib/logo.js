// Trazos del logo de PILCHA. Viven acá (y no dentro del componente) porque
// los usan el header, el footer y la imagen de Open Graph.
//
// Todo el logo es "monolínea": cada letra y la percha son trazos del mismo
// grosor con puntas redondeadas. Así la percha y la palabra se leen como una
// sola pieza. El gancho tiene forma de "?": la pregunta de "¿qué me pongo?".

export const GROSOR = 8;

// Percha: el cuerpo (triángulo) y el gancho van separados para pintarlos
// de colores distintos.
export const CUERPO = "M31 14 L58 36 H4 Z";
export const GANCHO = "M23 0 a8 8 0 1 1 8 8 v6";

// P, I, L, C, H, A. Altura de mayúscula: de y=0 a y=40 (con el grosor).
export const LETRAS = [
  "M80 36 V4 H91 a10 10 0 0 1 0 20 H80",
  "M117 4 V36",
  "M135 4 V36 H155",
  "M190.5 9.5 A16 16 0 1 0 190.5 30.5",
  "M204 4 V36 M228 4 V36 M204 20 H228",
  "M244 36 L258 4 L272 36 M249.5 25 H266.5",
].join(" ");

// Cajas de cada variante (x, y, ancho, alto). El gancho sube por encima de
// la altura de las letras, por eso arranca en y=-12.
export const VIEWBOX_COMPLETO = "0 -12 276 52";
export const VIEWBOX_ISOTIPO = "0 -12 62 52";

// Colores de marca: el cuerpo va en degradé cálido (terracota a naranja) y
// el gancho en turquesa. En /hoy y en la portada el gancho toma el color de
// la paleta del día (ver components/ui/LogoDelDia.js).
export const COLORES = {
  calido1: "#e07a5f",
  calido2: "#f2a65a",
  gancho: "#3d9a9b",
};
