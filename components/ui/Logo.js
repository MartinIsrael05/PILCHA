// Logo de PILCHA en SVG. Server Component: no tiene estado ni eventos.
//
// variante="completo": percha + palabra (header, footer).
// variante="isotipo": solo la percha (íconos, carga).
//
// La palabra usa currentColor, así toma el color del texto y anda sola en
// modo claro y oscuro. Los colores de la percha salen de variables CSS
// (--logo-*) con los colores de marca como valor por defecto.
import {
  CUERPO,
  GANCHO,
  GROSOR,
  LETRAS,
  VIEWBOX_COMPLETO,
  VIEWBOX_ISOTIPO,
} from "@/lib/logo";

export default function Logo({
  variante = "completo",
  // El degradé necesita un id único en la página: el header y el footer
  // muestran el logo a la vez, así que cada uno pasa el suyo.
  id = "logo",
  titulo = "PILCHA",
  className = "",
}) {
  const completo = variante === "completo";
  const idDegrade = `${id}-degrade`;

  return (
    <svg
      viewBox={completo ? VIEWBOX_COMPLETO : VIEWBOX_ISOTIPO}
      className={className}
      role={titulo ? "img" : undefined}
      aria-label={titulo || undefined}
      aria-hidden={titulo ? undefined : true}
      fill="none"
      strokeWidth={GROSOR}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient id={idDegrade} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" className="logo-calido-1" />
          <stop offset="1" className="logo-calido-2" />
        </linearGradient>
      </defs>
      <path d={CUERPO} stroke={`url(#${idDegrade})`} />
      <path d={GANCHO} className="logo-gancho" />
      {completo && <path d={LETRAS} stroke="currentColor" />}
    </svg>
  );
}
