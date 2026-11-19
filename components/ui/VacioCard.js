// Estado vacío consistente. Server Component: solo muestra texto + CTA opcional.
import Link from "next/link";

export default function VacioCard({ titulo, descripcion, cta }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border bg-border/20 p-8 text-center sm:text-left">
      <h2 className="text-xl font-semibold">{titulo}</h2>
      {descripcion && <p className="text-muted">{descripcion}</p>}
      {cta && (
        <Link
          href={cta.href}
          className="mt-1 rounded-full bg-foreground px-5 py-2.5 font-medium text-background hover:opacity-90"
        >
          {cta.texto}
        </Link>
      )}
    </div>
  );
}
