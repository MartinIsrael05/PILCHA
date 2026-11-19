import { Suspense } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { listarViajes } from "@/lib/data/viajes";
import { leerUbicacion } from "@/lib/ubicacion";
import { fechaArgentina, formatearDia, MAX_DIAS_VIAJE } from "@/lib/viajes";
import PlanearViaje from "@/components/viajes/PlanearViaje";
import PlanDeViaje from "@/components/viajes/PlanDeViaje";
import PageHeader from "@/components/ui/PageHeader";
import VacioCard from "@/components/ui/VacioCard";

export const metadata = {
  title: "Modo viaje",
};

// La ciudad y las fechas viajan en la URL (?lat=…&lon=…&ciudad=…&desde=…&hasta=…).
// Si están, mostramos la vista previa de la valija debajo del formulario.
export default async function ViajesPage({ searchParams }) {
  const user = await requireUser();
  const params = await searchParams;

  const ubicacion = params.lat ? leerUbicacion(params) : null;
  const desde = typeof params.desde === "string" ? params.desde : null;
  const hasta = typeof params.hasta === "string" ? params.hasta : null;
  const viajes = await listarViajes(user.uid);

  return (
    <section className="flex flex-col gap-8">
      <PageHeader
        titulo="Modo viaje"
        descripcion="Elegí a dónde vas y cuándo: miramos el pronóstico y te armamos la valija con tu placard, sin llevar de más."
      />

      <PlanearViaje
        inicial={{ ciudad: ubicacion, desde, hasta }}
        minFecha={fechaArgentina(0)}
        maxFecha={fechaArgentina(MAX_DIAS_VIAJE - 1)}
      />

      {ubicacion && desde && hasta && (
        <Suspense
          key={`${ubicacion.lat},${ubicacion.lon},${desde},${hasta}`}
          fallback={
            <div
              aria-busy="true"
              className="h-96 animate-pulse rounded-2xl bg-border"
            >
              <span className="sr-only">Armando tu valija…</span>
            </div>
          }
        >
          <PlanDeViaje
            user={user}
            ubicacion={ubicacion}
            desde={desde}
            hasta={hasta}
          />
        </Suspense>
      )}

      <section aria-labelledby="titulo-viajes" className="flex flex-col gap-3">
        <h2 id="titulo-viajes" className="text-xl font-semibold border-b border-border pb-2">
          Tus viajes
        </h2>
        {viajes.length === 0 ? (
          <VacioCard
            titulo="Todavía no guardaste ningún viaje"
            descripcion="Planeá uno arriba y después guardalo para tenerlo a mano."
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {viajes.map((v) => (
              <li key={v.id}>
                <Link
                  href={`/viajes/${v.id}`}
                  className="flex flex-col gap-1 rounded-2xl border border-border bg-background p-4 hover:border-foreground focus-visible:outline-2 focus-visible:outline-foreground"
                >
                  <span className="font-semibold">{v.ciudad.nombre}</span>
                  <span className="text-sm text-muted">
                    {formatearDia(v.desde)} al {formatearDia(v.hasta)} ·{" "}
                    {Math.round(v.resumen.tempMin)}° a{" "}
                    {Math.round(v.resumen.tempMax)}° · {v.prendaIds.length}{" "}
                    prendas
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
