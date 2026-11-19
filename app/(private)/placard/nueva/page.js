import { crearPrenda } from "@/lib/actions/prendas";
import PrendaForm from "@/components/placard/PrendaForm";
import PageHeader from "@/components/ui/PageHeader";

export const metadata = {
  title: "Nueva prenda",
};

export default function NuevaPrendaPage() {
  return (
    <section className="flex flex-col gap-8">
      <PageHeader
        titulo="Nueva prenda"
        descripcion="Contanos los datos básicos; la foto es opcional."
        volver={{ href: "/placard", texto: "Volver al placard" }}
      />
      <PrendaForm accion={crearPrenda} />
    </section>
  );
}
