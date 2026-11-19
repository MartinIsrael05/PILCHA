import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { listarPaletas } from "@/lib/data/paletas";
import { ARMONIAS, CLIMAS } from "@/lib/paletas";
import PaletaSwatch from "@/components/paletas/PaletaSwatch";
import BotonActivar from "@/components/admin/BotonActivar";

export const metadata = {
  title: "Admin",
  robots: { index: false },
};

export default async function AdminPage() {
  // Solo admins: a cualquier otra persona le da 404.
  await requireAdmin();
  const paletas = await listarPaletas();

  // Agrupamos por clima para que la pantalla sea un resumen rápido del
  // estado del sistema: qué clima tiene paleta, cuál está activa y qué
  // alternativas hay.
  const porClima = Object.keys(CLIMAS).map((clave) => ({
    clave,
    clima: CLIMAS[clave],
    paletas: paletas.filter((p) => p.clima === clave),
  }));
  const climasSinPaleta = porClima.filter((c) => c.paletas.length === 0);

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de admin</h1>
          <p className="text-muted">
            Las paletas que ve todo el mundo en PILCHA, agrupadas por clima.
          </p>
        </div>
        <Link
          href="/admin/nueva"
          className="rounded-full bg-foreground px-5 py-2.5 font-medium text-background hover:opacity-90"
        >
          + Nueva paleta
        </Link>
      </header>

      {climasSinPaleta.length > 0 && (
        <p
          role="status"
          className="rounded-xl border border-red-500 p-4 text-sm"
        >
          <strong>Atención:</strong> no hay paleta para{" "}
          {climasSinPaleta.map((c) => c.clima.nombre).join(", ")}. Esos días no
          se va a mostrar paleta.
        </p>
      )}

      <div className="flex flex-col gap-8">
        {porClima.map(({ clave, clima, paletas: paletasClima }) => (
          <section key={clave} aria-labelledby={`clima-${clave}`} className="flex flex-col gap-3">
            <header className="flex items-baseline justify-between gap-3 border-b border-border pb-2">
              <h2 id={`clima-${clave}`} className="flex items-center gap-2 text-xl font-semibold">
                <span aria-hidden="true">{clima.icono}</span>
                {clima.nombre}
              </h2>
              <p className="text-xs text-muted">
                {paletasClima.length === 0
                  ? "sin paletas"
                  : paletasClima.length === 1
                    ? "1 paleta"
                    : `${paletasClima.length} paletas`}
              </p>
            </header>

            {paletasClima.length === 0 ? (
              <Link
                href={`/admin/nueva?clima=${clave}`}
                className="rounded-2xl border border-dashed border-border bg-background p-5 text-sm text-muted hover:border-foreground hover:text-foreground"
              >
                + Crear paleta para {clima.nombre}
              </Link>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {paletasClima.map((p) => (
                  <li
                    key={p.id}
                    className={`flex flex-col gap-3 rounded-2xl border p-4 ${
                      p.activa ? "border-foreground" : "border-border"
                    }`}
                  >
                    <PaletaSwatch colores={p.colores} tamaño="chico" conHex={false} />
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold leading-tight">{p.nombre}</h3>
                        <p className="text-sm text-muted">
                          {ARMONIAS[p.armonia]?.nombre}
                        </p>
                      </div>
                      <BotonActivar id={p.id} activa={p.activa} />
                    </div>
                    <Link
                      href={`/admin/${p.id}`}
                      className="self-start text-sm font-medium text-muted underline hover:text-foreground"
                    >
                      Editar paleta
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </section>
  );
}
