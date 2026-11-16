import Link from "next/link";
import { listarPaletas } from "@/lib/data/paletas";
import PaletaCard from "@/components/paletas/PaletaCard";

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
      <div className="flex max-w-2xl flex-col gap-3">
        <h1 className="text-4xl font-black tracking-tight">Paletas para cada clima</h1>
        <p className="text-lg text-muted">
          Cada día tiene su paleta. Cuando armamos tu outfit, priorizamos las
          prendas que combinan con la del día y entre sí.
        </p>
      </div>

      {paletas.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-muted">
          Todavía no hay paletas cargadas.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paletas.map((paleta) => (
            <PaletaCard key={paleta.id} paleta={paleta} />
          ))}
        </ul>
      )}

      <p className="text-muted">
        ¿Querés saber cuál te toca hoy?{" "}
        <Link href="/" className="font-semibold text-foreground underline">
          Mirá el clima de tu día
        </Link>
      </p>
    </section>
  );
}
