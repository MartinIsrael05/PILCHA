// Bloque "Paleta del día": muestra la paleta que corresponde al clima y
// lleva a su página.
import Link from "next/link";
import { CLIMAS } from "@/lib/paletas";
import PaletaSwatch from "@/components/paletas/PaletaSwatch";

export default function PaletaDelDia({ paleta }) {
  if (!paleta) return null;
  const clima = CLIMAS[paleta.clima];

  return (
    <section
      aria-labelledby="titulo-paleta-dia"
      className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-sm text-muted">
            <span aria-hidden="true">{clima?.icono}</span> Paleta del día
          </p>
          <h2 id="titulo-paleta-dia" className="text-xl font-semibold">
            {paleta.nombre}
          </h2>
        </div>
        <Link href={`/paletas/${paleta.clima}`} className="text-sm font-medium underline">
          Ver la paleta
        </Link>
      </div>
      <PaletaSwatch colores={paleta.colores} tamaño="chico" conHex={false} />
      <p className="text-sm text-muted">{paleta.descripcion}</p>
    </section>
  );
}
