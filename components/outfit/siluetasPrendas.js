// Siluetas SVG de las prendas usadas en el maniquí. Cada categoría tiene
// una variante "liviana" y una "abrigada" según el nivel de abrigo (1-5).
// Son paths pensados en un viewBox 240x480 (lo usa ManiquiOutfit).
//
// Cada entrada devuelve:
//   { d: string (path), x,y,w,h: bounding box en pixeles para colocar fotos. }
// El bounding box se usa para recortar la imagen de la prenda a la silueta
// con un clipPath. Si la prenda no tiene foto, se rellena con su color.

export function siluetaPrenda(categoria, abrigo) {
  const liviana = abrigo <= 2;
  const map = {
    superior: liviana ? SUPERIOR_LIVIANO : SUPERIOR_ABRIGADO,
    inferior: liviana ? INFERIOR_SHORT : INFERIOR_PANT,
    abrigo: abrigo >= 5 ? ABRIGO_TAPADO : ABRIGO_CAMPERA,
    calzado: liviana ? CALZADO_ZAPATILLA : CALZADO_BOTA,
    accesorio: liviana ? ACCESORIO_GORRA : ACCESORIO_GORRO,
  };
  return map[categoria] ?? null;
}

// --- SUPERIOR (torso) --------------------------------------------------------

// Remera manga corta: cuerpo con pequeñas mangas a los costados.
const SUPERIOR_LIVIANO = {
  d: "M72 112 L88 108 L104 112 L116 108 Q120 106 124 108 L136 112 L152 108 L168 112 L178 138 L162 148 L160 230 L80 230 L78 148 L62 138 Z",
  x: 62,
  y: 108,
  w: 116,
  h: 122,
};

// Buzo / sweater: mangas largas hasta las muñecas, cuello más alto.
const SUPERIOR_ABRIGADO = {
  d: "M72 112 L88 106 L104 110 L120 104 L136 110 L152 106 L168 112 L186 238 L160 240 L158 148 L155 232 L85 232 L82 148 L80 240 L54 238 Z",
  x: 54,
  y: 104,
  w: 132,
  h: 136,
};

// --- INFERIOR (piernas) ------------------------------------------------------

// Short: termina en la mitad del muslo.
const INFERIOR_SHORT = {
  d: "M78 232 L162 232 L160 260 L135 300 L120 260 L105 300 L80 260 Z",
  x: 78,
  y: 232,
  w: 84,
  h: 70,
};

// Pantalón largo: dos perneras hasta los tobillos.
const INFERIOR_PANT = {
  d: "M78 232 L162 232 L158 380 L128 380 L121 260 L119 260 L112 380 L82 380 Z",
  x: 78,
  y: 232,
  w: 84,
  h: 150,
};

// --- ABRIGO (sobre el torso) -------------------------------------------------

// Campera: forma similar al superior pero más ancha y abierta al medio.
const ABRIGO_CAMPERA = {
  d: "M60 110 L88 102 Q90 106 100 108 L116 112 L120 110 L124 112 L140 108 Q150 106 152 102 L180 110 L196 240 L166 244 L160 148 L155 236 L120 236 L85 236 L80 148 L74 244 L44 240 Z",
  x: 44,
  y: 102,
  w: 152,
  h: 142,
  linea: "M120 118 L120 236",
};

// Tapado largo: cubre hasta las rodillas.
const ABRIGO_TAPADO = {
  d: "M60 110 L88 102 Q90 106 100 108 L116 112 L120 110 L124 112 L140 108 Q150 106 152 102 L180 110 L202 320 L172 326 L160 148 L158 318 L82 318 L80 148 L68 326 L38 320 Z",
  x: 38,
  y: 102,
  w: 164,
  h: 224,
  linea: "M120 118 L120 318",
};

// --- CALZADO (pies) ----------------------------------------------------------

// Zapatilla: baja, dos pies separados.
const CALZADO_ZAPATILLA = {
  d: "M70 388 Q66 410 90 412 L110 412 Q115 412 115 404 L113 388 Z M127 388 L125 404 Q125 412 130 412 L150 412 Q174 410 170 388 Z",
  x: 66,
  y: 388,
  w: 108,
  h: 26,
};

// Bota alta: cubre hasta media pantorrilla.
const CALZADO_BOTA = {
  d: "M70 360 L115 360 Q116 402 108 412 L92 412 Q68 410 72 388 Z M125 360 L170 360 Q174 410 148 412 L132 412 Q124 402 125 388 Z",
  x: 66,
  y: 360,
  w: 108,
  h: 54,
};

// --- ACCESORIO (cabeza) ------------------------------------------------------

// Gorra: visera adelante.
const ACCESORIO_GORRA = {
  d: "M92 30 Q90 18 120 18 Q150 18 148 30 L148 42 L92 42 Z M148 42 L170 48 L168 54 L148 50 Z",
  x: 90,
  y: 18,
  w: 80,
  h: 36,
};

// Gorro de lana: cubre toda la parte superior de la cabeza, con pompón.
const ACCESORIO_GORRO = {
  d: "M88 42 Q86 10 120 10 Q154 10 152 42 L152 50 L88 50 Z",
  x: 88,
  y: 10,
  w: 64,
  h: 40,
  pompon: { cx: 120, cy: 8, r: 5 },
};
