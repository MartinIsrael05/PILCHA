// Pide el pronóstico, el placard y la paleta del día en el servidor, corre el
// motor y muestra el outfit. Va envuelto en <Suspense> en /hoy, así la página
// no espera a Open-Meteo.
import Link from "next/link";
import { getPronostico, resumirVentana, condicionPaleta } from "@/lib/clima";
import { recomendar } from "@/lib/recomendar";
import { listarPrendas } from "@/lib/data/prendas";
import { getPaletaDelDia } from "@/lib/data/paletas";
import { variablesDeTema } from "@/lib/paletas";
import ClimaResumen from "@/components/clima/ClimaResumen";
import OutfitSugerido from "@/components/outfit/OutfitSugerido";
import RecomendacionGenerica from "@/components/outfit/RecomendacionGenerica";
import UsarOutfit from "@/components/outfit/UsarOutfit";

export default async function OutfitDelDia({ user, ubicacion, desde, hasta }) {
  let pronostico;
  try {
    pronostico = await getPronostico(ubicacion.lat, ubicacion.lon);
  } catch {
    return (
      <Aviso>
        No pudimos traer el pronóstico en este momento. Probá de nuevo en un
        rato.
      </Aviso>
    );
  }

  const clima = resumirVentana(pronostico, desde, hasta);
  if (!clima) return <Aviso>No hay datos del clima para ese horario.</Aviso>;

  // El placard y la paleta no dependen uno del otro: los pedimos en paralelo.
  const [prendas, paleta] = await Promise.all([
    listarPrendas(user.uid),
    getPaletaDelDia(condicionPaleta(clima)),
  ]);

  const perfil = { sensibilidad: user.sensibilidad, ajusteTermico: user.ajusteTermico };
  // Con la paleta, el motor prioriza las prendas que combinan con el día.
  const recomendacion = recomendar({ clima, perfil, prendas, paleta });
  // Las prendas que eligió el motor (las categorías sin prenda no cuentan).
  const prendaIds = recomendacion.outfit.filter((x) => x.prenda).map((x) => x.prenda.id);

  return (
    // La interfaz toma colores de la paleta del día con variables CSS. Las
    // definimos acá (y no en el layout) porque la paleta depende del clima,
    // y el clima depende de la ubicación que viene en la URL.
    <div className="flex flex-col gap-4" style={variablesDeTema(paleta)}>
      {prendas.length === 0 ? (
        <>
          <RecomendacionGenerica recomendacion={recomendacion} logueado conInvitacion={false} />
          <p className="rounded-2xl border border-dashed border-border p-5 text-muted">
            Todavía no cargaste ropa.{" "}
            <Link href="/placard/nueva" className="font-semibold text-foreground underline">
              Cargá tu primera prenda
            </Link>{" "}
            y el outfit va a salir de tu placard.
          </p>
        </>
      ) : (
        <OutfitSugerido recomendacion={recomendacion} paleta={paleta}>
          {prendaIds.length > 0 && (
            <UsarOutfit
              prendaIds={prendaIds}
              ubicacion={ubicacion}
              desde={desde}
              hasta={hasta}
            />
          )}
        </OutfitSugerido>
      )}
      <ClimaResumen
        clima={clima}
        actual={pronostico.current}
        desde={desde}
        hasta={hasta}
      />
    </div>
  );
}

function Aviso({ children }) {
  return (
    <p role="status" className="rounded-2xl border border-border p-5 text-muted">
      {children}
    </p>
  );
}
