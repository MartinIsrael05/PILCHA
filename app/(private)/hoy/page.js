import { Suspense } from "react";
import { requireUser } from "@/lib/auth/session";
import { leerHorario, leerUbicacion } from "@/lib/ubicacion";
import SelectorUbicacion from "@/components/clima/SelectorUbicacion";
import SelectorHorario from "@/components/clima/SelectorHorario";
import ClimaSkeleton from "@/components/clima/ClimaSkeleton";
import OutfitDelDia from "@/components/outfit/OutfitDelDia";
import PageHeader from "@/components/ui/PageHeader";

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

  return (
    <section className="flex flex-col gap-8">
      <PageHeader
        titulo={saludo}
        descripcion="Te armamos el outfit del día con tu placard y el clima."
      />

      <div className="flex flex-col gap-3">
        <SelectorUbicacion ubicacionActual={ubicacion} />
        {ubicacion && <SelectorHorario desde={desde} hasta={hasta} />}
      </div>

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
