// Un outfit en el listado de /historial.
// Las cards SIN calificar muestran los botones frío/bien/calor directamente:
// 1 click resuelve el flujo sin tener que entrar al detalle.
import Link from "next/link";
import { describirCodigo } from "@/lib/clima";
import { CALIFICACIONES, formatearFecha } from "@/lib/historial";
import PrendasDelOutfit from "@/components/historial/PrendasDelOutfit";
import CalificarInline from "@/components/historial/CalificarInline";

export default function OutfitItem({ outfit, prendasPorId }) {
  const { clima } = outfit;
  const { icono, texto } = describirCodigo(clima.codigo);
  const calificacion = CALIFICACIONES[outfit.calificacion];

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-border p-4 transition sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Link
            href={`/historial/${outfit.id}`}
            className="font-semibold hover:underline first-letter:uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            {formatearFecha(outfit.fecha)}
          </Link>
          <p className="text-sm text-muted">
            <span aria-hidden="true">{icono}</span> {texto} en {clima.ciudad} ·{" "}
            {Math.round(clima.sensacion)}° de sensación
          </p>
        </div>
        {calificacion && (
          <span className="rounded-full bg-border/60 px-3 py-1 text-sm font-medium">
            <span aria-hidden="true">{calificacion.icono}</span> {calificacion.nombre}
          </span>
        )}
      </div>

      <PrendasDelOutfit prendaIds={outfit.prendaIds} prendasPorId={prendasPorId} />

      {!calificacion && <CalificarInline outfitId={outfit.id} />}
    </li>
  );
}
