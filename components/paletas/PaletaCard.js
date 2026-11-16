// Tarjeta de una paleta en el listado de /paletas.
import Link from "next/link";
import { ARMONIAS, CLIMAS } from "@/lib/paletas";
import PaletaSwatch from "@/components/paletas/PaletaSwatch";

export default function PaletaCard({ paleta }) {
  const clima = CLIMAS[paleta.clima];

  return (
    <li>
      <Link
        href={`/paletas/${paleta.clima}`}
        className="group flex h-full flex-col gap-3 rounded-2xl border border-border p-4 transition hover:border-foreground focus-visible:outline-2 focus-visible:outline-foreground"
      >
        <PaletaSwatch colores={paleta.colores} conHex={false} />
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted">
            <span aria-hidden="true">{clima?.icono}</span> {clima?.nombre ?? paleta.clima}
          </p>
          <h2 className="text-lg font-semibold group-hover:underline">{paleta.nombre}</h2>
          <p className="text-sm text-muted">{ARMONIAS[paleta.armonia]?.nombre}</p>
        </div>
      </Link>
    </li>
  );
}
