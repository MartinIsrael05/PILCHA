import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getPrenda } from "@/lib/data/prendas";
import { editarPrenda } from "@/lib/actions/prendas";
import PrendaForm from "@/components/placard/PrendaForm";
import BotonEliminar from "@/components/placard/BotonEliminar";
import PageHeader from "@/components/ui/PageHeader";
import { CATEGORIAS, NIVELES_ABRIGO } from "@/lib/prendas";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const user = await requireUser();
  const prenda = await getPrenda(user.uid, id);
  return { title: prenda ? prenda.nombre : "Prenda no encontrada" };
}

export default async function PrendaPage({ params }) {
  const { id } = await params;
  const user = await requireUser();

  // Se busca bajo users/{uid}: si el id no existe o es de otra persona,
  // da null y mostramos 404.
  const prenda = await getPrenda(user.uid, id);
  if (!prenda) notFound();

  // bind fija el id como primer argumento de la Server Action.
  const accion = editarPrenda.bind(null, prenda.id);

  return (
    <section className="flex flex-col gap-8">
      <PageHeader
        titulo={prenda.nombre}
        descripcion={`${CATEGORIAS[prenda.categoria]} · ${prenda.color.nombre} · Abrigo ${prenda.abrigo} (${NIVELES_ABRIGO[prenda.abrigo].toLowerCase()})`}
        volver={{ href: "/placard", texto: "Volver al placard" }}
      />
      <PrendaForm accion={accion} prenda={prenda} />
      <div className="max-w-xl border-t border-border pt-6">
        <BotonEliminar id={prenda.id} nombre={prenda.nombre} />
      </div>
    </section>
  );
}
