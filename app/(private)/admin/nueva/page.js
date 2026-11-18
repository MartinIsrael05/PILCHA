import { requireAdmin } from "@/lib/auth/session";
import { crearPaleta } from "@/lib/actions/paletas";
import PaletaForm from "@/components/admin/PaletaForm";

export const metadata = {
  title: "Nueva paleta",
  robots: { index: false },
};

export default async function NuevaPaletaPage() {
  await requireAdmin();
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Nueva paleta</h1>
      <PaletaForm accion={crearPaleta} />
    </section>
  );
}
