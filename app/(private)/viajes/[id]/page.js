import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getViaje } from "@/lib/data/viajes";
import { listarPrendas } from "@/lib/data/prendas";
import ResumenViaje from "@/components/viajes/ResumenViaje";
import EliminarViaje from "@/components/viajes/EliminarViaje";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const user = await requireUser();
  const viaje = await getViaje(user.uid, id);
  return {
    title: viaje ? `Viaje a ${viaje.ciudad.nombre}` : "Viaje no encontrado",
  };
}

export default async function ViajePage({ params }) {
  const { id } = await params;
  const user = await requireUser();

  // Se busca bajo users/{uid}: si no existe o es de otra persona, 404.
  const [viaje, prendas] = await Promise.all([
    getViaje(user.uid, id),
    listarPrendas(user.uid),
  ]);
  if (!viaje) notFound();

  const prendasPorId = new Map(prendas.map((p) => [p.id, p]));

  return (
    <article className="flex flex-col gap-8">
      <Link href="/viajes" className="text-sm text-muted hover:underline">
        ← Volver a tus viajes
      </Link>
      {/* Es lo que se guardó ese día: el pronóstico puede haber cambiado. */}
      <ResumenViaje viaje={viaje} prendasPorId={prendasPorId} />
      <p className="text-sm text-muted">
        Este es el plan con el pronóstico del día en que lo guardaste. Para
        actualizarlo, armalo de nuevo desde{" "}
        <Link
          href={`/viajes?lat=${viaje.ciudad.lat}&lon=${viaje.ciudad.lon}&ciudad=${encodeURIComponent(viaje.ciudad.nombre)}&desde=${viaje.desde}&hasta=${viaje.hasta}`}
          className="underline"
        >
          Modo viaje
        </Link>
        .
      </p>
      <div className="border-t border-border pt-6">
        <EliminarViaje id={viaje.id} />
      </div>
    </article>
  );
}
