// Mini demo visual del maniquí para la landing. Sin datos reales: los
// colores se eligen a mano para armar un outfit coherente. Server Component.
import { CLIMAS } from "@/lib/paletas";

export default function DemoManiqui() {
  // Un "clima" simulado: tarde templada con sol.
  const clima = CLIMAS["soleado-templado"];

  return (
    <div className="relative mx-auto flex max-w-sm flex-col items-center gap-4 rounded-2xl bg-background p-5 shadow-xl ring-1 ring-border">
      <div className="flex w-full items-center justify-between">
        <span className="flex items-center gap-1.5 rounded-full bg-border/40 px-3 py-1 text-xs font-semibold">
          <span aria-hidden="true">{clima.icono}</span>
          {clima.nombre}
        </span>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted">
          Vista previa
        </span>
      </div>

      <svg viewBox="0 0 240 420" className="h-72 w-auto">
        {/* Silueta */}
        <g fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.2">
          <circle cx="120" cy="50" r="30" />
          <path d="M108 78 v14 M132 78 v14" />
          <path d="M70 100 Q100 90 120 92 Q140 90 170 100 L180 240 L155 240 L150 110 L90 110 L85 240 L60 240 Z" />
          <path d="M85 240 L72 400 L105 400 L118 260 L122 260 L135 400 L168 400 L155 240" />
        </g>
        {/* Prendas simuladas */}
        <rect x="60" y="120" width="120" height="110" rx="10" fill="#f2a65a" />
        <rect x="70" y="220" width="100" height="160" rx="10" fill="#3d5f8c" />
        <rect x="70" y="380" width="100" height="30" rx="8" fill="#5b3a29" />
        <circle cx="120" cy="45" r="12" fill="#1f3250" opacity="0.9" />
      </svg>

      <div className="flex w-full flex-col gap-1 border-t border-border pt-3 text-sm">
        <Fila color="#f2a65a" categoria="Superior" nombre="Camisa terracota" />
        <Fila color="#3d5f8c" categoria="Inferior" nombre="Jean azul" />
        <Fila color="#5b3a29" categoria="Calzado" nombre="Zapatillas marrón" />
      </div>
    </div>
  );
}

function Fila({ color, categoria, nombre }) {
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className="size-4 rounded-sm ring-1 ring-border"
        style={{ backgroundColor: color }}
      />
      <span className="w-20 text-xs uppercase tracking-wide text-muted">
        {categoria}
      </span>
      <span className="font-medium">{nombre}</span>
    </div>
  );
}
