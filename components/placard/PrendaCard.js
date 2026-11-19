// Tarjeta de una prenda en el listado. Server Component: solo muestra datos.
import Link from "next/link";
import Image from "next/image";
import { CATEGORIAS, NIVELES_ABRIGO } from "@/lib/prendas";
import { colorDeTexto } from "@/lib/colores";
import IconoCategoria from "@/components/placard/IconoCategoria";

export default function PrendaCard({ prenda }) {
  // Sin foto: el cuadrado de color queda con un ícono de la categoría del
  // color opuesto (blanco o negro), para distinguir remera de pantalón de un
  // vistazo.
  const colorIcono = colorDeTexto(prenda.color.hex);
  return (
    <li data-stagger>
      <Link
        href={`/placard/${prenda.id}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background transition hover:-translate-y-1 hover:border-[var(--marca-primario)] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--marca-primario)]"
      >
        <div
          className="relative flex aspect-square items-center justify-center"
          style={{ backgroundColor: prenda.color.hex }}
        >
          {prenda.imagenUrl ? (
            <Image
              src={prenda.imagenUrl}
              alt={prenda.nombre}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover"
            />
          ) : (
            <IconoCategoria
              categoria={prenda.categoria}
              className="size-16 opacity-80"
              style={{ color: colorIcono }}
            />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3">
          <h2 className="font-semibold leading-tight">{prenda.nombre}</h2>
          <p className="text-sm text-muted">
            {CATEGORIAS[prenda.categoria]} · {prenda.color.nombre}
          </p>
          <p className="text-sm text-muted">
            Abrigo {prenda.abrigo} ({NIVELES_ABRIGO[prenda.abrigo].toLowerCase()})
            {prenda.impermeable && " · Impermeable"}
          </p>
          <p className="mt-auto pt-2 text-xs text-muted">
            {prenda.usos === 0
              ? "Todavía no la usaste"
              : `Usada ${prenda.usos} ${prenda.usos === 1 ? "vez" : "veces"}`}
          </p>
        </div>
      </Link>
    </li>
  );
}
