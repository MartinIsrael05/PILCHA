import Link from "next/link";
import { notFound } from "next/navigation";
import { getPaletasDeClima } from "@/lib/data/paletas";
import { ARMONIAS, CLIMAS } from "@/lib/paletas";
import PaletaSwatch from "@/components/paletas/PaletaSwatch";

export const revalidate = 3600;

// Los climas son fijos (los que devuelve condicionPaleta), así que generamos
// las 6 páginas en el build. Cualquier otro valor en la URL da 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(CLIMAS).map((clima) => ({ clima }));
}

// Título, descripción y Open Graph distintos para cada paleta. La imagen de
// Open Graph la genera opengraph-image.js en esta misma carpeta.
export async function generateMetadata({ params }) {
  const { clima } = await params;
  const [paleta] = await getPaletasDeClima(clima);
  if (!paleta) return { title: "Paleta no encontrada" };

  // Por ejemplo: "Piloto amarillo: paleta para días de lluvia"
  const titulo = `${paleta.nombre}: paleta ${CLIMAS[clima].frase}`;
  return {
    title: titulo,
    description: paleta.descripcion,
    openGraph: {
      title: `${titulo} | PILCHA`,
      description: paleta.descripcion,
      type: "article",
    },
  };
}

export default async function PaletaClimaPage({ params }) {
  const { clima } = await params;
  const paletas = await getPaletasDeClima(clima);
  if (paletas.length === 0) notFound();

  const info = CLIMAS[clima];

  return (
    <article className="flex flex-col gap-10">
      <Link href="/paletas" className="text-sm text-muted hover:underline">
        ← Todas las paletas
      </Link>

      {paletas.map((paleta) => {
        const armonia = ARMONIAS[paleta.armonia];
        return (
          <section key={paleta.id} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium uppercase tracking-widest text-muted">
                <span aria-hidden="true">{info.icono}</span> {info.nombre}
              </p>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                {paleta.nombre}
              </h1>
              <p className="max-w-2xl text-lg text-muted">{paleta.descripcion}</p>
            </div>

            <PaletaSwatch colores={paleta.colores} tamaño="grande" />

            {armonia && (
              <div className="max-w-2xl rounded-2xl border border-border bg-background p-5">
                <h2 className="font-semibold">Armonía {armonia.nombre.toLowerCase()}</h2>
                <p className="text-muted">{armonia.explicacion}</p>
              </div>
            )}
          </section>
        );
      })}

      <p className="text-muted">
        <Link href="/" className="font-semibold text-foreground underline">
          Mirá qué te toca ponerte hoy
        </Link>{" "}
        y si tu placard combina con esta paleta.
      </p>
    </article>
  );
}
