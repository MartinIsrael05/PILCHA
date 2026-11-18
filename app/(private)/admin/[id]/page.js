import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getPaleta, getPaletasDeClima } from "@/lib/data/paletas";
import { editarPaleta } from "@/lib/actions/paletas";
import PaletaForm from "@/components/admin/PaletaForm";
import EliminarPaleta from "@/components/admin/EliminarPaleta";

export async function generateMetadata({ params }) {
  const { id } = await params;
  await requireAdmin();
  const paleta = await getPaleta(id);
  return {
    title: paleta ? `Editar ${paleta.nombre}` : "Paleta no encontrada",
    robots: { index: false },
  };
}

export default async function EditarPaletaPage({ params }) {
  const { id } = await params;
  await requireAdmin();

  const paleta = await getPaleta(id);
  if (!paleta) notFound();
  const delMismoClima = await getPaletasDeClima(paleta.clima);

  // bind fija el id como primer argumento de la Server Action.
  const accion = editarPaleta.bind(null, paleta.id);

  return (
    <section className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Editar {paleta.nombre}</h1>
      <PaletaForm accion={accion} paleta={paleta} />
      <div className="max-w-xl border-t border-border pt-6">
        <EliminarPaleta
          id={paleta.id}
          nombre={paleta.nombre}
          esLaUnica={delMismoClima.length === 1}
        />
      </div>
    </section>
  );
}
