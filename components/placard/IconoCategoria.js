// Íconos SVG de las categorías de ropa. Server Component (puro JSX).
// Diseño: silueta simple, solo contorno, pensada para verse grande sobre el
// cuadrado de color de la tarjeta de una prenda sin foto.
const SVG_PROPS = {
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

export default function IconoCategoria({ categoria, className = "size-10", style }) {
  const Icono = ICONOS[categoria] ?? ICONOS.superior;
  return <Icono className={className} style={style} />;
}

const ICONOS = {
  superior: (props) => (
    // Remera
    <svg {...SVG_PROPS} {...props}>
      <path d="M17 8 L13 12 L8 16 L12 22 L16 20 L16 40 L32 40 L32 20 L36 22 L40 16 L35 12 L31 8 L28 10 Q24 13 20 10 Z" />
    </svg>
  ),
  inferior: (props) => (
    // Pantalón
    <svg {...SVG_PROPS} {...props}>
      <path d="M14 8 L34 8 L35 20 L32 40 L25 40 L24 22 L23 40 L16 40 L13 20 Z" />
    </svg>
  ),
  calzado: (props) => (
    // Zapatilla de perfil
    <svg {...SVG_PROPS} {...props}>
      <path d="M6 32 L10 20 L18 18 L22 22 L28 22 L34 26 L42 28 L42 34 Q42 36 40 36 L8 36 Q6 36 6 34 Z" />
      <path d="M22 22 L22 28" />
      <path d="M28 22 L28 28" />
    </svg>
  ),
  abrigo: (props) => (
    // Campera con cierre central
    <svg {...SVG_PROPS} {...props}>
      <path d="M17 8 L13 12 L8 18 L12 24 L16 22 L16 40 L32 40 L32 22 L36 24 L40 18 L35 12 L31 8 L28 10 Q24 13 20 10 Z" />
      <path d="M24 14 L24 40" />
    </svg>
  ),
  accesorio: (props) => (
    // Gorra
    <svg {...SVG_PROPS} {...props}>
      <path d="M8 28 L8 32 L42 32 L42 28 Q42 18 24 18 Q14 18 11 26 Z" />
      <path d="M24 18 L24 10 Q24 8 26 8 L28 8" />
    </svg>
  ),
};
