// Un outfit en el listado de /historial.
import Link from "next/link";
import { describirCodigo } from "@/lib/clima";
import { CALIFICACIONES, formatearFecha } from "@/lib/historial";
import PrendasDelOutfit from "@/components/historial/PrendasDelOutfit";

export default function OutfitItem({ outfit, prendasPorId }) {
  const { clima } = outfit;
  const { icono, texto } = describirCodigo(clima.codigo);
  const calificacion = CALIFICACIONES[outfit.calificacion];

  return (
    <li>
      <Link
        href={`/historial/${outfit.id}`}
        className="flex flex-col gap-3 rounded-2xl border border-border p-4 transition hover:border-foreground focus-visible:outline-2 focus-visible:outline-foreground sm:p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-semibold first-letter:uppercase">{formatearFecha(outfit.fecha)}</p>
            <p className="text-sm text-muted">
              <span aria-hidden="true">{icono}</span> {texto} en {clima.ciudad} ·{" "}
              {Math.round(clima.sensacion)}° de sensación
            </p>
          </div>
          {calificacion ? (
            <span className="rounded-full bg-border/60 px-3 py-1 text-sm font-medium">
              <span aria-hidden="true">{calificacion.icono}</span> {calificacion.nombre}
            </span>
          ) : (
            <span className="rounded-full border border-dashed border-foreground px-3 py-1 text-sm font-medium">
              Sin calificar
            </span>
          )}
        </div>
        <PrendasDelOutfit prendaIds={outfit.prendaIds} prendasPorId={prendasPorId} />
      </Link>
    </li>
  );
}
