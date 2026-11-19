// Logo de PILCHA. Server Component: no tiene estado ni eventos.
//
// <Logo /> muestra el isotipo + la palabra. El tamaño se controla con el
// font-size (por ejemplo className="text-2xl"): el isotipo mide 1.25em, así
// que siempre acompaña a la palabra.
//
// La palabra es texto real en Geist Black con tracking-tight, igual que los
// títulos de las páginas. Toma el color del texto, así anda en claro y oscuro.
import { COLORES, GROSOR_PERCHA, PERCHA } from "@/lib/logo";

// Cuadrado redondeado en degradé con la percha blanca. Los colores salen de
// variables CSS (--logo-*) con los de marca como valor por defecto: en /hoy
// LogoDelDia las pisa con el color de la paleta del día. Van inline (y no en
// globals.css) para que el logo se vea bien aunque falte la hoja de estilos.
export function Isotipo({ id = "logo", className = "" }) {
  // El degradé necesita un id único en la página: el header y el footer
  // muestran el logo a la vez, así que cada uno pasa el suyo.
  const idDegrade = `${id}-degrade`;
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={idDegrade} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: `var(--logo-fondo-1, ${COLORES.fondo1})` }} />
          <stop offset="1" style={{ stopColor: `var(--logo-fondo-2, ${COLORES.fondo2})` }} />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${idDegrade})`} />
      <path
        d={PERCHA}
        fill="none"
        style={{ stroke: `var(--logo-trazo, ${COLORES.trazo})` }}
        strokeWidth={GROSOR_PERCHA}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Logo({ id, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-[0.4em] leading-none ${className}`}>
      <Isotipo id={id} className="h-[1.25em] w-[1.25em] shrink-0" />
      <span className="font-black tracking-tight">PILCHA</span>
    </span>
  );
}
