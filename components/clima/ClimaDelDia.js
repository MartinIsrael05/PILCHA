// Pide el pronóstico en el servidor, arma la recomendación y muestra las dos.
// Va envuelto en <Suspense>, así el resto de la página no espera a Open-Meteo.
import { getPronostico, resumirVentana, condicionPaleta } from "@/lib/clima";
import { recomendar } from "@/lib/recomendar";
import { getPaletaDelDia } from "@/lib/data/paletas";
import { variablesDeTema } from "@/lib/paletas";
import LogoDelDia from "@/components/ui/LogoDelDia";
import ClimaResumen from "@/components/clima/ClimaResumen";
import RecomendacionGenerica from "@/components/outfit/RecomendacionGenerica";
import PaletaDelDia from "@/components/paletas/PaletaDelDia";

export default async function ClimaDelDia({ ubicacion, desde, hasta, perfil, logueado }) {
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
  if (!clima) {
    return <Aviso>No hay datos del clima para ese horario.</Aviso>;
  }

  // Sin placard: el motor devuelve la recomendación genérica.
  const recomendacion = recomendar({ clima, perfil });
  const paleta = await getPaletaDelDia(condicionPaleta(clima));

  return (
    // Igual que en /hoy, la interfaz toma colores de la paleta del día.
    <div className="flex flex-col gap-4" style={variablesDeTema(paleta)}>
      {/* El isotipo del logo toma el color de la paleta del día. */}
      <LogoDelDia colores={paleta?.colores} />
      <RecomendacionGenerica recomendacion={recomendacion} logueado={logueado} />
      <PaletaDelDia paleta={paleta} />
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
    <p role="status" className="rounded-2xl border border-border bg-background p-5 text-muted">
      {children}
    </p>
  );
}
