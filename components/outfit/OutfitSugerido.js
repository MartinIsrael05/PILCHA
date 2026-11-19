// Outfit armado con prendas del placard. Server Component: dibuja el
// resultado de recomendar() con un maniquí visual + lista textual + alertas.
// En escritorio queda a 2 columnas: maniquí a la izquierda, resto a la derecha.
import Link from "next/link";
import Alertas from "@/components/clima/Alertas";
import { CLIMAS } from "@/lib/paletas";
import ManiquiOutfit from "@/components/outfit/ManiquiOutfit";

// children: acciones que van al pie de la tarjeta (por ejemplo "Usé este outfit").
// paleta (opcional): se muestra como chip arriba a la derecha.
export default function OutfitSugerido({ recomendacion, paleta, children }) {
  const { tempEfectiva, nivel, outfit, alertas } = recomendacion;
  const faltan = outfit.filter((item) => !item.prenda && !item.opcional);
  const climaPaleta = paleta ? CLIMAS[paleta.clima] : null;

  // Fondo con el acento de la paleta del día (variables CSS que define
  // OutfitDelDia). Si no hay paleta, vuelve a los colores de siempre.
  return (
    <article className="flex flex-col gap-5 rounded-2xl bg-[var(--tema-acento,var(--foreground))] p-5 text-[var(--tema-acento-texto,var(--background))] sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium opacity-80">
            Para vos se siente como {Math.round(tempEfectiva)}° · {nivel.nombre}
          </p>
          <h2 className="text-sm font-semibold uppercase tracking-widest opacity-80">
            Tu outfit de hoy
          </h2>
        </div>
        {paleta && (
          <Link
            href={`/paletas/${paleta.clima}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs font-medium text-foreground hover:underline"
          >
            <span aria-hidden="true">{climaPaleta?.icono}</span>
            Paleta: {paleta.nombre}
          </Link>
        )}
      </header>

      {/* Dos columnas en escritorio: maniquí visual + lista textual. En
          mobile se apilan. */}
      <div className="grid gap-5 sm:grid-cols-[minmax(0,18rem)_1fr]">
        <div className="rounded-xl bg-background p-3 text-foreground">
          <ManiquiOutfit recomendacion={recomendacion} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-background p-1 text-foreground empty:hidden">
            <Alertas alertas={alertas} />
          </div>

          {faltan.length > 0 && (
            <p className="text-sm opacity-90">
              Te faltan prendas para completar el outfit.{" "}
              <Link href="/placard/nueva" className="font-semibold underline">
                Cargá más ropa
              </Link>
              .
            </p>
          )}

          {children}
        </div>
      </div>
    </article>
  );
}
