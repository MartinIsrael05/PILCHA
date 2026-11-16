import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { listarOutfits } from "@/lib/data/outfits";
import { listarPrendas } from "@/lib/data/prendas";
import OutfitItem from "@/components/historial/OutfitItem";

export const metadata = {
  title: "Historial",
};

export default async function HistorialPage() {
  const user = await requireUser();
  const [outfits, prendas] = await Promise.all([
    listarOutfits(user.uid),
    listarPrendas(user.uid),
  ]);
  // Para mostrar el nombre y el color de cada prenda del outfit.
  const prendasPorId = new Map(prendas.map((p) => [p.id, p]));
  const sinCalificar = outfits.filter((o) => !o.calificacion).length;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Historial</h1>
        <p className="text-muted">
          Los outfits que usaste. Calificalos y la próxima te recomendamos mejor.
        </p>
      </div>

      {outfits.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border p-8">
          <h2 className="text-xl font-semibold">Todavía no guardaste outfits</h2>
          <p className="text-muted">
            Cuando salgas, tocá “Usé este outfit” en Hoy. A la vuelta lo calificás
            acá.
          </p>
          <Link
            href="/hoy"
            className="rounded-full bg-foreground px-5 py-2.5 font-medium text-background"
          >
            Ir a Hoy
          </Link>
        </div>
      ) : (
        <>
          {sinCalificar > 0 && (
            <p className="text-sm font-medium" aria-live="polite">
              {sinCalificar === 1
                ? "Tenés 1 outfit sin calificar."
                : `Tenés ${sinCalificar} outfits sin calificar.`}
            </p>
          )}
          <ul className="flex flex-col gap-3">
            {outfits.map((outfit) => (
              <OutfitItem key={outfit.id} outfit={outfit} prendasPorId={prendasPorId} />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
