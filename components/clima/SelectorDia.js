// Pestañas "Hoy | Mañana" de /hoy. Server Component: cada pestaña es un
// <Link> que cambia ?dia= en la URL, así funciona el botón de atrás y el
// link se puede compartir.
//
// Cada pestaña muestra el clima de tu horario en chiquito, y la de mañana
// suma etiquetas con lo que cambia respecto de hoy (↓ 5°, 💧 80%, 🧥 más
// abrigo). Así se ve la diferencia antes de tocar.
//
// Usa el mismo getPronostico que el resto de /hoy: Next deduplica el fetch.
import Link from "next/link";
import {
  describirCodigo,
  elegirFecha,
  getPronostico,
  nombreDelDia,
  resumirVentana,
} from "@/lib/clima";
import { compararConManana } from "@/lib/manana";
import { hrefConDia } from "@/lib/ubicacion";

export default async function SelectorDia({ ubicacion, desde, hasta, dia, params, perfil }) {
  let pronostico;
  try {
    pronostico = await getPronostico(ubicacion.lat, ubicacion.lon);
  } catch {
    return null; // sin pronóstico no hay nada que comparar
  }

  const { fecha, hoy, manana, hoyTerminado } = elegirFecha(pronostico, dia, hasta);
  const climaHoy = resumirVentana(pronostico, desde, hasta, { fecha: hoy });
  const climaManana = manana ? resumirVentana(pronostico, desde, hasta, { fecha: manana }) : null;
  if (!climaHoy || !climaManana) return null;

  const { consejos } = compararConManana({ hoy: climaHoy, manana: climaManana, perfil });

  return (
    <nav
      aria-label="Elegí el día"
      className="grid grid-cols-2 gap-1.5 rounded-2xl border border-border bg-background p-1.5"
    >
      <Pestana
        href={hrefConDia(params, "hoy")}
        activa={fecha === hoy}
        titulo="Hoy"
        fecha={hoy}
        clima={climaHoy}
        nota={hoyTerminado ? "Tu horario ya terminó" : null}
      />
      <Pestana
        href={hrefConDia(params, "manana")}
        activa={fecha === manana}
        titulo="Mañana"
        fecha={manana}
        clima={climaManana}
        etiquetas={consejos.map((c) => c.etiqueta)}
        nota={consejos.length === 0 ? "Parecido a hoy" : null}
      />
    </nav>
  );
}

function Pestana({ href, activa, titulo, fecha, clima, etiquetas = [], nota }) {
  const { icono, texto } = describirCodigo(clima.codigo, clima.esDeDia);

  return (
    <Link
      href={href}
      scroll={false}
      // aria-current le dice al lector de pantalla cuál es la pestaña elegida.
      aria-current={activa ? "page" : undefined}
      className={`flex min-h-24 flex-col gap-1.5 rounded-xl px-4 py-3 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:px-5 ${
        activa ? "bg-foreground text-background shadow-sm" : "hover:bg-border/40"
      }`}
    >
      <span className="flex flex-wrap items-baseline gap-x-2 text-xs">
        <span className="font-bold uppercase tracking-widest">{titulo}</span>
        <span className="opacity-70">{nombreDelDia(fecha)}</span>
      </span>

      <span className="flex items-center gap-2">
        <span aria-hidden="true" className="text-xl">
          {icono}
        </span>
        <span className="text-lg font-bold tracking-tight">
          {Math.round(clima.tempMin)}° a {Math.round(clima.tempMax)}°
        </span>
        {/* En el celular no entra: queda solo para el lector de pantalla. */}
        <span className="sr-only sm:not-sr-only sm:text-sm sm:opacity-70">· {texto}</span>
      </span>

      {(etiquetas.length > 0 || nota) && (
        <span className="flex flex-wrap gap-1.5">
          {etiquetas.map((etiqueta) => (
            <span
              key={etiqueta}
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                activa ? "bg-background/15" : "bg-border/60"
              }`}
            >
              {etiqueta}
            </span>
          ))}
          {nota && <span className="text-xs opacity-70">{nota}</span>}
        </span>
      )}
    </Link>
  );
}

// Lo que se ve mientras llega el pronóstico: el mismo alto que las pestañas.
export function SelectorDiaSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-[7.75rem] animate-pulse rounded-2xl border border-border bg-border/40"
    />
  );
}
