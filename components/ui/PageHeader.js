// Encabezado consistente para todas las secciones. Server Component.
// Usa `titulo` como h1, `descripcion` como subtítulo y `accion` para un botón
// u otro elemento alineado a la derecha. `volver` imprime un link "←" arriba.
import Link from "next/link";

export default function PageHeader({ titulo, descripcion, accion, volver }) {
  return (
    <header className="flex flex-col gap-3">
      {volver && (
        <Link
          href={volver.href}
          className="w-fit text-sm text-muted hover:underline"
        >
          ← {volver.texto}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            {titulo}
          </h1>
          {descripcion && (
            <p className="mt-1 max-w-2xl text-base text-muted">{descripcion}</p>
          )}
        </div>
        {accion && <div className="shrink-0">{accion}</div>}
      </div>
    </header>
  );
}
