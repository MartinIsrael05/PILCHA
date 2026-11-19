import Link from "next/link";
import { listarPaletas } from "@/lib/data/paletas";
import PaletaCard from "@/components/paletas/PaletaCard";
import PageHeader from "@/components/ui/PageHeader";
import VacioCard from "@/components/ui/VacioCard";

// Las paletas casi no cambian: la página se genera una vez y se renueva cada
// hora (o antes, cuando el admin edita una paleta y llama a revalidatePath).
export const revalidate = 3600;

export const metadata = {
  title: "Paletas",
  description:
    "Paletas de colores para cada clima: qué colores combinan con un día de sol, de lluvia o de frío.",
  openGraph: {
    title: "Paletas de colores para cada clima | PILCHA",
    description: "Qué colores combinan con un día de sol, de lluvia o de frío.",
  },
};

export default async function PaletasPage() {
  const paletas = await listarPaletas();

  return (
    <section className="flex flex-col gap-8">
      <PageHeader
        titulo="Paletas para cada clima"
        descripcion="Cada día tiene su paleta. Cuando armamos tu outfit, priorizamos las prendas que combinan con la del día y entre sí."
      />

      {paletas.length === 0 ? (
        <VacioCard
          titulo="Todavía no hay paletas cargadas"
          descripcion="Pronto vas a ver acá las paletas de PILCHA."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paletas.map((paleta) => (
            <PaletaCard key={paleta.id} paleta={paleta} />
          ))}
        </ul>
      )}

      <p className="text-sm text-muted">
        ¿Querés saber cuál te toca hoy?{" "}
        <Link href="/" className="font-semibold text-foreground underline">
          Mirá el clima de tu día
        </Link>
      </p>
    </section>
  );
}
