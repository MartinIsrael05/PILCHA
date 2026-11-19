import { Suspense } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { leerHorario, leerUbicacion } from "@/lib/ubicacion";
import SelectorUbicacion from "@/components/clima/SelectorUbicacion";
import SelectorHorario from "@/components/clima/SelectorHorario";
import ClimaDelDia from "@/components/clima/ClimaDelDia";
import ClimaSkeleton from "@/components/clima/ClimaSkeleton";

export const metadata = {
  // absolute evita que el template del layout agregue " | PILCHA" otra vez
  title: { absolute: "PILCHA | Qué ponerte hoy según el clima" },
};

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const user = await getCurrentUser();

  // Prioridad: la ubicación de la URL; si no hay, la ciudad del perfil.
  const ubicacion = leerUbicacion(params) ?? user?.ciudad ?? null;
  const horarioPerfil = user
    ? { desde: user.horaSalida, hasta: user.horaVuelta }
    : undefined;
  const { desde, hasta } = leerHorario(params, horarioPerfil);
  // Solo lo que el motor necesita para ajustar la temperatura a la persona.
  const perfil = user
    ? { sensibilidad: user.sensibilidad, ajusteTermico: user.ajusteTermico }
    : null;

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-5 pt-4 sm:pt-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
          Clima + placard + paletas
        </p>
        <h1 className="text-5xl font-black tracking-tight leading-[1.05] sm:text-7xl">
          ¿Qué me pongo hoy?
        </h1>
        <p className="max-w-2xl text-lg text-muted sm:text-xl">
          PILCHA mira el pronóstico entre la hora en que salís y la hora en que
          volvés, y te arma el outfit del día con la ropa de tu propio placard.
        </p>
        {!user && (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/registro"
              className="rounded-full bg-foreground px-6 py-3 font-medium text-background hover:opacity-90"
            >
              Crear cuenta gratis
            </Link>
            <Link
              href="/paletas"
              className="rounded-full border border-border px-6 py-3 font-medium hover:bg-border/40"
            >
              Ver paletas
            </Link>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="titulo-clima">
        <h2 id="titulo-clima" className="text-xl font-bold border-b border-border pb-2">
          El clima de tu día
        </h2>

        <SelectorUbicacion ubicacionActual={ubicacion} />

        {ubicacion && (
          <>
            <SelectorHorario desde={desde} hasta={hasta} />
            {/* key: al cambiar la ubicación o el horario se vuelve a mostrar
                el skeleton mientras llega el nuevo pronóstico */}
            <Suspense
              key={`${ubicacion.lat},${ubicacion.lon},${desde},${hasta}`}
              fallback={<ClimaSkeleton />}
            >
              <ClimaDelDia
                ubicacion={ubicacion}
                desde={desde}
                hasta={hasta}
                perfil={perfil}
                logueado={Boolean(user)}
              />
            </Suspense>
          </>
        )}
      </section>
    </div>
  );
}
