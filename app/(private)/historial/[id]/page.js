import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getOutfit } from "@/lib/data/outfits";
import { listarPrendas } from "@/lib/data/prendas";
import { calificarOutfit } from "@/lib/actions/outfits";
import { describirCodigo, nivelUV } from "@/lib/clima";
import { formatearFecha } from "@/lib/historial";
import PrendasDelOutfit from "@/components/historial/PrendasDelOutfit";
import CalificarOutfit from "@/components/outfit/CalificarOutfit";
import PageHeader from "@/components/ui/PageHeader";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const user = await requireUser();
  const outfit = await getOutfit(user.uid, id);
  return { title: outfit ? `Outfit del ${formatearFecha(outfit.fecha)}` : "Outfit no encontrado" };
}

export default async function OutfitPage({ params }) {
  const { id } = await params;
  const user = await requireUser();

  // Se busca bajo users/{uid}: si no existe o es de otra persona, 404.
  const [outfit, prendas] = await Promise.all([getOutfit(user.uid, id), listarPrendas(user.uid)]);
  if (!outfit) notFound();

  const prendasPorId = new Map(prendas.map((p) => [p.id, p]));
  const { clima } = outfit;
  const { icono, texto } = describirCodigo(clima.codigo);
  // bind fija el id como primer argumento de la Server Action.
  const accion = calificarOutfit.bind(null, outfit.id);

  return (
    <article className="flex flex-col gap-8">
      <PageHeader
        titulo={formatearFecha(outfit.fecha, { conAnio: true })}
        descripcion={`${icono} ${texto} en ${clima.ciudad}`}
        volver={{ href: "/historial", texto: "Volver al historial" }}
      />

      <section aria-labelledby="titulo-prendas" className="flex flex-col gap-3">
        <h2 id="titulo-prendas" className="text-lg font-semibold border-b border-border pb-2">
          Lo que te pusiste
        </h2>
        <PrendasDelOutfit prendaIds={outfit.prendaIds} prendasPorId={prendasPorId} grande />
      </section>

      <section aria-labelledby="titulo-clima" className="flex flex-col gap-3">
        <h2 id="titulo-clima" className="text-lg font-semibold border-b border-border pb-2">
          El clima de ese día
        </h2>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Dato titulo="Sensación" valor={`${Math.round(clima.sensacion)}°`} />
          <Dato
            titulo="Mín · máx"
            valor={`${Math.round(clima.tempMin)}° · ${Math.round(clima.tempMax)}°`}
          />
          <Dato titulo="Lluvia" valor={`${clima.lluviaProb}%`} />
          <Dato titulo="UV" valor={`${Math.round(clima.uv)} (${nivelUV(clima.uv)})`} />
        </dl>
      </section>

      <section aria-labelledby="titulo-calificar" className="flex flex-col gap-3">
        <h2 id="titulo-calificar" className="text-lg font-semibold border-b border-border pb-2">
          ¿Cómo te fue?
        </h2>
        <CalificarOutfit accion={accion} calificacion={outfit.calificacion} nota={outfit.nota} />
      </section>
    </article>
  );
}

function Dato({ titulo, valor }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-border/40 px-3 py-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">{titulo}</dt>
      <dd className="text-lg font-bold">{valor}</dd>
    </div>
  );
}
