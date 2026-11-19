import { Suspense } from "react";
import { requireUser } from "@/lib/auth/session";
import { leerHorario, leerUbicacion } from "@/lib/ubicacion";
import SelectorUbicacion from "@/components/clima/SelectorUbicacion";
import SelectorHorario from "@/components/clima/SelectorHorario";
import ClimaSkeleton from "@/components/clima/ClimaSkeleton";
import OutfitDelDia from "@/components/outfit/OutfitDelDia";

export const metadata = {
  title: "Hoy",
};

// Igual que la portada: la ubicación y el horario viajan en la URL. Si no
// hay, se usan la ciudad y el horario del perfil.
export default async function HoyPage({ searchParams }) {
  const user = await requireUser();
  const params = await searchParams;

  const ubicacion = leerUbicacion(params) ?? user.ciudad ?? null;
  const { desde, hasta } = leerHorario(params, {
    desde: user.horaSalida,
    hasta: user.horaVuelta,
  });

  const saludo = user.nombre ? `Hola, ${user.nombre.split(" ")[0]}` : "Hola";

  // Header compacto en una sola fila: saludo a la izquierda, selectores a
  // la derecha. Sin descripción larga: la ocupa el outfit abajo.
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Hoy
          </p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            {saludo}
          </h1>
        </div>
        {ubicacion && (
          <div className="flex shrink-0 items-center">
            <SelectorHorario desde={desde} hasta={hasta} />
          </div>
        )}
      </header>

      <SelectorUbicacion ubicacionActual={ubicacion} />

      {ubicacion && (
        <Suspense
          key={`${ubicacion.lat},${ubicacion.lon},${desde},${hasta}`}
          fallback={<ClimaSkeleton />}
        >
          <OutfitDelDia
            user={user}
            ubicacion={ubicacion}
            desde={desde}
            hasta={hasta}
          />
        </Suspense>
      )}
    </section>
  );
}
