// Muestra un viaje: el clima, la valija y el plan de cada día. Lo usan la
// vista previa de /viajes y el detalle /viajes/[id]. Server Component.
import { describirCodigo } from "@/lib/clima";
import { colorDeTexto } from "@/lib/colores";
import { CATEGORIAS } from "@/lib/prendas";
import { contarDias, formatearDia, valijaDesdeDias } from "@/lib/viajes";
import IconoCategoria from "@/components/placard/IconoCategoria";

const ORDEN = Object.keys(CATEGORIAS);

export default function ResumenViaje({ viaje, prendasPorId }) {
  const { ciudad, desde, hasta, resumen, dias, faltantes } = viaje;
  const totalDias = contarDias(desde, hasta);

  // La valija se arma a partir de los días, agrupada por categoría.
  // Prendas sin categoría (eliminadas del placard) van al final: ORDEN.indexOf
  // sin match devuelve -1, lo pasamos a Infinity para que no quede primero.
  const posicion = (p) => {
    const i = ORDEN.indexOf(p?.categoria);
    return i === -1 ? Infinity : i;
  };
  const valija = valijaDesdeDias(dias)
    .map((v) => ({ ...v, prenda: prendasPorId.get(v.prendaId) ?? null }))
    .sort((a, b) => posicion(a.prenda) - posicion(b.prenda));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold">{ciudad.nombre}</h2>
        <p className="text-muted">
          Del {formatearDia(desde)} al {formatearDia(hasta)} ·{" "}
          {totalDias === 1 ? "1 día" : `${totalDias} días`}
        </p>
      </header>

      <dl className="grid grid-cols-3 gap-3 text-center">
        <Dato titulo="Mínima" valor={`${Math.round(resumen.tempMin)}°`} />
        <Dato titulo="Máxima" valor={`${Math.round(resumen.tempMax)}°`} />
        <Dato
          titulo="Días con lluvia"
          valor={resumen.diasLluvia}
          detalle={resumen.diasLluvia ? "llevá paraguas" : null}
        />
      </dl>

      <section aria-labelledby="titulo-valija" className="flex flex-col gap-3">
        <h3 id="titulo-valija" className="text-lg font-semibold">
          Qué llevar ({valija.length}{" "}
          {valija.length === 1 ? "prenda" : "prendas"})
        </h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {valija.map(({ prendaId, prenda, fechas }) => (
            <li
              key={prendaId}
              className="flex items-center gap-3 rounded-xl border border-border p-3"
            >
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border"
                style={{ backgroundColor: prenda?.color.hex }}
              >
                {prenda && (
                  // Igual que en la tarjeta del placard: el ícono en blanco o
                  // negro, el que se lea mejor sobre el color de la prenda.
                  <IconoCategoria
                    categoria={prenda.categoria}
                    className="size-6 opacity-80"
                    style={{ color: colorDeTexto(prenda.color.hex) }}
                  />
                )}
              </span>
              <div className="min-w-0">
                <p className="font-medium">
                  {prenda ? (
                    prenda.nombre
                  ) : (
                    <span className="text-muted">Prenda eliminada</span>
                  )}
                </p>
                <p className="text-sm text-muted">
                  {prenda && `${CATEGORIAS[prenda.categoria]} · `}
                  {fechas.length === totalDias
                    ? "todo el viaje"
                    : fechas.length === 1
                      ? `el ${formatearDia(fechas[0])}`
                      : `${fechas.length} días`}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {faltantes.length > 0 && (
          <div className="rounded-xl bg-border/40 p-4 text-sm">
            <p className="font-medium">Te falta en el placard:</p>
            <ul className="mt-1 list-disc pl-5">
              {faltantes.map((f) => (
                <li key={f.categoria}>
                  {f.texto} (
                  {f.fechas.length === 1 ? "1 día" : `${f.fechas.length} días`})
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section aria-labelledby="titulo-dias" className="flex flex-col gap-3">
        <h3 id="titulo-dias" className="text-lg font-semibold">
          Día por día
        </h3>
        <ol className="flex flex-col gap-2">
          {dias.map((d) => {
            const { icono, texto } = describirCodigo(d.codigo);
            return (
              <li
                key={d.fecha}
                className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="sm:w-48 sm:shrink-0">
                  <p className="font-medium first-letter:uppercase">
                    {formatearDia(d.fecha)}
                  </p>
                  <p className="text-sm text-muted">
                    <span aria-hidden="true">{icono}</span> {texto} ·{" "}
                    {Math.round(d.tempMin)}° a {Math.round(d.tempMax)}°
                    {d.lluviaProb >= 40 && ` · ${d.lluviaProb}% lluvia`}
                  </p>
                </div>
                <p className="text-sm">
                  {d.prendaIds
                    .map(
                      (id) =>
                        prendasPorId.get(id)?.nombre ?? "Prenda eliminada",
                    )
                    .join(" · ") || (
                    <span className="text-muted">Sin prendas del placard</span>
                  )}
                </p>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

function Dato({ titulo, valor, detalle }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-border/40 px-2 py-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">
        {titulo}
      </dt>
      <dd className="text-2xl font-bold">{valor}</dd>
      {detalle && <dd className="text-xs text-muted">{detalle}</dd>}
    </div>
  );
}
