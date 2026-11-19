import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { listarPrendas } from "@/lib/data/prendas";
import { filtrarPrendas } from "@/lib/prendas";
import FiltrosPlacard from "@/components/placard/FiltrosPlacard";
import PrendaCard from "@/components/placard/PrendaCard";
import PageHeader from "@/components/ui/PageHeader";
import VacioCard from "@/components/ui/VacioCard";
import StaggerGSAP from "@/components/ui/StaggerGSAP";

export const metadata = {
  title: "Mi placard",
};

// En Next.js 16 searchParams es una Promise. Los filtros viven en la URL.
export default async function PlacardPage({ searchParams }) {
  const user = await requireUser();
  const params = await searchParams;

  const prendas = await listarPrendas(user.uid);
  const visibles = filtrarPrendas(prendas, params);
  const colores = [...new Set(prendas.map((p) => p.color.nombre))].sort();

  const accion = prendas.length > 0 && (
    <Link
      href="/placard/nueva"
      className="inline-flex items-center gap-1 rounded-full bg-[var(--marca-primario)] px-5 py-2.5 font-medium text-white shadow-sm transition hover:brightness-110 hover:shadow-md"
    >
      <span aria-hidden="true">+</span> Agregar prenda
    </Link>
  );

  return (
    <section className="flex flex-col gap-8">
      <PageHeader
        titulo="Mi placard"
        descripcion={
          prendas.length === 0
            ? "Cargá tu ropa y armamos los outfits con lo que tenés."
            : `${prendas.length} ${prendas.length === 1 ? "prenda" : "prendas"} guardadas.`
        }
        accion={accion}
      />

      {prendas.length === 0 ? (
        <VacioCard
          titulo="Tu placard está vacío"
          descripcion="Empezá cargando tu primera prenda: una remera, un pantalón o lo que uses más seguido."
          cta={{ href: "/placard/nueva", texto: "Cargar la primera prenda" }}
        />
      ) : (
        <>
          <FiltrosPlacard params={params} colores={colores} />

          <p className="text-sm text-muted" aria-live="polite">
            Mostrando {visibles.length} de {prendas.length}{" "}
            {prendas.length === 1 ? "prenda" : "prendas"}
          </p>

          {visibles.length === 0 ? (
            <VacioCard
              titulo="Sin resultados"
              descripcion="Ninguna prenda coincide con esos filtros. Probá sacar alguno."
            />
          ) : (
            <StaggerGSAP
              as="ul"
              selector="li[data-stagger]"
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
            >
              {visibles.map((prenda) => (
                <PrendaCard key={prenda.id} prenda={prenda} />
              ))}
            </StaggerGSAP>
          )}
        </>
      )}
    </section>
  );
}
