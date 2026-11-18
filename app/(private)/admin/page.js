import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { listarPaletas } from "@/lib/data/paletas";
import { ARMONIAS, CLIMAS } from "@/lib/paletas";
import PaletaSwatch from "@/components/paletas/PaletaSwatch";

export const metadata = {
  title: "Admin",
  robots: { index: false },
};

export default async function AdminPage() {
  // Solo admins: a cualquier otra persona le da 404.
  await requireAdmin();
  const paletas = await listarPaletas();
  const climasSinPaleta = Object.keys(CLIMAS).filter(
    (c) => !paletas.some((p) => p.clima === c),
  );

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Panel de admin</h1>
          <p className="text-muted">
            Las paletas que ve todo el mundo en PILCHA.
          </p>
        </div>
        <Link
          href="/admin/nueva"
          className="rounded-full bg-foreground px-5 py-2.5 font-medium text-background hover:opacity-90"
        >
          Nueva paleta
        </Link>
      </div>

      {climasSinPaleta.length > 0 && (
        <p
          role="status"
          className="rounded-xl border border-red-500 p-4 text-sm"
        >
          Hay climas sin paleta:{" "}
          <strong>
            {climasSinPaleta.map((c) => CLIMAS[c].nombre).join(", ")}
          </strong>
          . Esos días no se va a mostrar paleta.
        </p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        {paletas.map((p) => (
          <li
            key={p.id}
            className="flex flex-col gap-3 rounded-2xl border border-border p-4"
          >
            <PaletaSwatch colores={p.colores} tamaño="chico" conHex={false} />
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="text-sm text-muted">
                  <span aria-hidden="true">{CLIMAS[p.clima]?.icono}</span>{" "}
                  {CLIMAS[p.clima]?.nombre}
                  {" · "}
                  {ARMONIAS[p.armonia]?.nombre}
                </p>
                <h2 className="text-lg font-semibold">{p.nombre}</h2>
              </div>
              <Link
                href={`/admin/${p.id}`}
                className="text-sm font-medium underline"
              >
                Editar
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
