import { Suspense } from "react";
import { requireUser } from "@/lib/auth/session";
import { hrefConDia, leerDia, leerHorario, leerUbicacion } from "@/lib/ubicacion";
import SelectorUbicacion from "@/components/clima/SelectorUbicacion";
import HorarioDelDia, { HorarioSkeleton } from "@/components/clima/HorarioDelDia";
import SelectorDia, { SelectorDiaSkeleton } from "@/components/clima/SelectorDia";
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

  // "hoy", "manana" o null (automático). Lo cambian las pestañas.
  const dia = leerDia(params);
  const perfil = { sensibilidad: user.sensibilidad, ajusteTermico: user.ajusteTermico };

  const saludo = user.nombre ? `Hola, ${user.nombre.split(" ")[0]}` : "Hola";

  // Header compacto con el saludo. Debajo: pestañas del día, ubicación,
  // horario y outfit.
  return (
    <section className="flex flex-col gap-6">
      <header className="border-b border-border pb-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Hoy
          </p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            {saludo}
          </h1>
        </div>
      </header>

      {/* Pestañas Hoy | Mañana: cambian toda la pantalla. Sin key, para que
          sigan a la vista mientras carga el otro día. */}
      {ubicacion && (
        <Suspense fallback={<SelectorDiaSkeleton />}>
          <SelectorDia
            ubicacion={ubicacion}
            desde={desde}
            hasta={hasta}
            dia={dia}
            params={params}
            perfil={perfil}
          />
        </Suspense>
      )}

      <SelectorUbicacion ubicacionActual={ubicacion} />

      {/* Sin key: al cambiar el horario, Next mantiene el selector a la vista
          mientras carga el nuevo pronóstico (el outfit sí muestra skeleton). */}
      {ubicacion && (
        <Suspense fallback={<HorarioSkeleton />}>
          <HorarioDelDia ubicacion={ubicacion} desde={desde} hasta={hasta} dia={dia} />
        </Suspense>
      )}

      {ubicacion && (
        <Suspense
          key={`${ubicacion.lat},${ubicacion.lon},${desde},${hasta},${dia}`}
          fallback={<ClimaSkeleton />}
        >
          <OutfitDelDia
            user={user}
            ubicacion={ubicacion}
            desde={desde}
            hasta={hasta}
            dia={dia}
            hrefManana={hrefConDia(params, "manana")}
          />
        </Suspense>
      )}
    </section>
  );
}
