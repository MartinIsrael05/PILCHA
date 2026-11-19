import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { crearPaleta } from "@/lib/actions/paletas";
import { esClimaValido } from "@/lib/paletas";
import PaletaForm from "@/components/admin/PaletaForm";

export const metadata = {
  title: "Nueva paleta",
  robots: { index: false },
};

export default async function NuevaPaletaPage({ searchParams }) {
  await requireAdmin();
  const params = await searchParams;
  // Desde el panel se puede llegar con ?clima=xxx para preseleccionarlo.
  const climaInicial = esClimaValido(params.clima) ? params.clima : null;

  return (
    <section className="flex flex-col gap-6">
      <Link href="/admin" className="text-sm text-muted hover:underline">
        ← Volver al panel
      </Link>
      <h1 className="text-3xl font-bold">Nueva paleta</h1>
      <PaletaForm accion={crearPaleta} climaInicial={climaInicial} />
    </section>
  );
}
