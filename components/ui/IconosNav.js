// Íconos de la barra de navegación. SVG inline: no suman peticiones,
// heredan el color del texto (currentColor) y se ven igual en claro y oscuro.
// Diseño: líneas simples, pensados para 20 px en el nav de escritorio y para
// la barra inferior de mobile.
const SVG_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

const ICONOS = {
  // Sol asomando entre nubes: "Hoy".
  hoy: (p) => (
    <svg {...SVG_PROPS} {...p}>
      <circle cx="9" cy="10" r="3" />
      <path d="M9 4v1M4 10h1M9 16v-1M14 10h-1M5.5 6.5l.7.7M12.5 6.5l-.7.7" />
      <path d="M12 17a4 4 0 1 1 4-4h.5a3 3 0 0 1 0 6H9a3 3 0 0 1-.9-5.8" />
    </svg>
  ),
  // Percha simple: "Mi placard".
  placard: (p) => (
    <svg {...SVG_PROPS} {...p}>
      <path d="M12 9a2 2 0 1 1 2-2" />
      <path d="M12 9v2L4 17h16L12 11" />
      <path d="M3.5 18.5h17" />
    </svg>
  ),
  // Reloj con flecha hacia atrás: "Historial".
  historial: (p) => (
    <svg {...SVG_PROPS} {...p}>
      <path d="M4 10a8 8 0 1 1 1.5 5" />
      <path d="M4 5v5h5" />
      <path d="M12 8v4l3 2" />
    </svg>
  ),
  // Valija con manija: "Viajes".
  viajes: (p) => (
    <svg {...SVG_PROPS} {...p}>
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M12 12v4" />
    </svg>
  ),
  // Barras: "Estadísticas".
  stats: (p) => (
    <svg {...SVG_PROPS} {...p}>
      <path d="M4 20V10M10 20V4M16 20v-7" />
      <path d="M3 20h18" />
    </svg>
  ),
  // Paleta de pintor: "Paletas".
  paletas: (p) => (
    <svg {...SVG_PROPS} {...p}>
      <path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-.6 1.5-1.4 0-.4-.2-.8-.4-1.1-.3-.4-.4-.7-.4-1 0-.8.6-1.5 1.5-1.5H17a4 4 0 0 0 4-4A8 8 0 0 0 12 3Z" />
      <circle cx="7.5" cy="10.5" r="1" fill="currentColor" />
      <circle cx="12" cy="7.5" r="1" fill="currentColor" />
      <circle cx="16.5" cy="10.5" r="1" fill="currentColor" />
    </svg>
  ),
  // Silueta: "Mi perfil".
  perfil: (p) => (
    <svg {...SVG_PROPS} {...p}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  ),
  // Engranaje: "Admin".
  admin: (p) => (
    <svg {...SVG_PROPS} {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v2M12 19.5v2M4.2 7l1.7 1M18.1 16l1.7 1M4.2 17l1.7-1M18.1 8l1.7-1M2.5 12h2M19.5 12h2" />
    </svg>
  ),
  // Salir: flecha saliendo de una puerta.
  salir: (p) => (
    <svg {...SVG_PROPS} {...p}>
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      <path d="M10 8l-4 4 4 4" />
      <path d="M6 12h10" />
    </svg>
  ),
};

export default function IconoNav({ nombre, className = "size-5" }) {
  const Icono = ICONOS[nombre];
  if (!Icono) return null;
  return <Icono className={className} />;
}
