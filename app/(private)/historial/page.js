import { requireUser } from "@/lib/auth/session";
import { listarOutfits } from "@/lib/data/outfits";
import { listarPrendas } from "@/lib/data/prendas";
import OutfitItem from "@/components/historial/OutfitItem";
import PageHeader from "@/components/ui/PageHeader";
import VacioCard from "@/components/ui/VacioCard";

export const metadata = {
  title: "Historial",
};

export default async function HistorialPage() {
  const user = await requireUser();
  const [outfits, prendas] = await Promise.all([
    listarOutfits(user.uid),
    listarPrendas(user.uid),
  ]);
  const prendasPorId = new Map(prendas.map((p) => [p.id, p]));
  const sinCalificar = outfits.filter((o) => !o.calificacion).length;

  return (
    <section className="flex flex-col gap-8">
      <PageHeader
        titulo="Historial"
        descripcion="Los outfits que usaste. Calificalos y la próxima te recomendamos mejor."
      />

      {outfits.length === 0 ? (
        <VacioCard
          titulo="Todavía no guardaste outfits"
          descripcion="Cuando salgas, tocá “Usé este outfit” en Hoy. A la vuelta lo calificás acá."
          cta={{ href: "/hoy", texto: "Ir a Hoy" }}
        />
      ) : (
        <>
          {sinCalificar > 0 && (
            <p
              className="rounded-xl border border-foreground/20 bg-border/30 px-4 py-2 text-sm font-medium"
              aria-live="polite"
            >
              {sinCalificar === 1
                ? "Tenés 1 outfit sin calificar."
                : `Tenés ${sinCalificar} outfits sin calificar.`}{" "}
              Decinos cómo te fue y aprendemos.
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
