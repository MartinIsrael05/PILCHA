import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getOutfit } from "@/lib/data/outfits";
import { listarPrendas } from "@/lib/data/prendas";
import { calificarOutfit } from "@/lib/actions/outfits";
import { describirCodigo, nivelUV } from "@/lib/clima";
import { formatearFecha } from "@/lib/historial";
import PrendasDelOutfit from "@/components/historial/PrendasDelOutfit";
import CalificarOutfit from "@/components/outfit/CalificarOutfit";

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
      <Link href="/historial" className="text-sm text-muted hover:underline">
        ← Volver al historial
      </Link>

      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold first-letter:uppercase">
          {formatearFecha(outfit.fecha, { conAnio: true })}
        </h1>
        <p className="text-muted">
          <span aria-hidden="true">{icono}</span> {texto} en {clima.ciudad}
        </p>
      </header>

      <section aria-labelledby="titulo-prendas" className="flex flex-col gap-3">
        <h2 id="titulo-prendas" className="font-semibold">
          Lo que te pusiste
        </h2>
        <PrendasDelOutfit prendaIds={outfit.prendaIds} prendasPorId={prendasPorId} grande />
      </section>

      <section aria-labelledby="titulo-clima" className="flex flex-col gap-3">
        <h2 id="titulo-clima" className="font-semibold">
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

      <CalificarOutfit accion={accion} calificacion={outfit.calificacion} nota={outfit.nota} />
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
