// Tarjeta "Tené en cuenta": qué cambia mañana respecto del día que se está
// mostrando. Server Component: recibe el pronóstico que ya se pidió para
// /hoy (no hace otra llamada) y usa lib/manana.js para los consejos.
import Link from "next/link";
import { describirCodigo, diaSiguiente, nombreDelDia, resumirVentana } from "@/lib/clima";
import { compararConManana } from "@/lib/manana";

const ICONOS = { frio: "🌬️", calor: "☀️", abrigo: "🧥", lluvia: "☔", capas: "🌡️" };

// hrefManana (opcional): link a la pestaña "Mañana" de /hoy.
export default function ClimaManana({ pronostico, clima, desde, hasta, perfil, hrefManana }) {
  // Si la ventana de hoy ya pasó, la app muestra mañana: la tarjeta habla
  // del día siguiente a ese (pasado mañana), así no repite el mismo día.
  const fecha = diaSiguiente(clima.fecha);
  const manana = resumirVentana(pronostico, desde, hasta, { fecha });
  if (!manana) return null;

  const { consejos } = compararConManana({ hoy: clima, manana, perfil });
  const { texto, icono } = describirCodigo(manana.codigo, manana.esDeDia);
  const titulo = clima.paraManana ? "Pasado mañana" : "Mañana";

  return (
    <section
      aria-labelledby="titulo-manana"
      className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-5 sm:p-6"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Tené en cuenta
          </p>
          <h2 id="titulo-manana" className="text-xl font-bold">
            {titulo}, {nombreDelDia(fecha)}
          </h2>
        </div>
        <p className="flex items-center gap-2 text-sm text-muted">
          <span aria-hidden="true" className="text-xl">
            {icono}
          </span>
          <span>
            {texto} ·{" "}
            <strong className="font-semibold text-foreground">
              {Math.round(manana.tempMin)}° a {Math.round(manana.tempMax)}°
            </strong>
          </span>
        </p>
      </header>

      {consejos.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {consejos.map((consejo) => (
            <li
              key={consejo.tipo + consejo.texto}
              className="flex items-start gap-3 rounded-xl bg-border/40 px-4 py-3 text-sm"
            >
              <span aria-hidden="true">{ICONOS[consejo.tipo]}</span>
              <span>{consejo.texto}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">
          Parecido a hoy: el mismo outfit te va a servir.
        </p>
      )}

      {hrefManana && (
        <Link
          href={hrefManana}
          scroll={false}
          className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold transition hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          Ver el outfit de mañana <span aria-hidden="true">→</span>
        </Link>
      )}
    </section>
  );
}
