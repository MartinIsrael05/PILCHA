// Prepara los datos del selector de horario: la temperatura de cada hora del
// día que se está mostrando. Server Component.
//
// Usa el mismo getPronostico que el outfit: Next deduplica los fetch iguales
// dentro de un mismo request, así que no es una llamada extra a Open-Meteo.
import { getPronostico, horasDelDia, resumirVentana } from "@/lib/clima";
import SelectorHorario from "./SelectorHorario";

export default async function HorarioDelDia({ ubicacion, desde, hasta }) {
  let horas = null;
  let paraManana = false;
  let horaActual = null;

  try {
    const pronostico = await getPronostico(ubicacion.lat, ubicacion.lon);
    const ventana = resumirVentana(pronostico, desde, hasta);
    if (ventana) {
      horas = horasDelDia(pronostico, ventana.fecha);
      paraManana = ventana.paraManana;
      // La marca de "ahora" solo tiene sentido si mostramos el día de hoy.
      if (!paraManana && pronostico.current?.time) {
        horaActual = Number(pronostico.current.time.slice(11, 13));
      }
    }
  } catch {
    // Sin pronóstico, el selector funciona igual pero sin la curva.
  }

  return (
    <SelectorHorario
      // La key reinicia el estado local cuando cambia el horario de la URL
      // (por ejemplo, al volver atrás en el navegador).
      key={`${desde}-${hasta}`}
      desde={desde}
      hasta={hasta}
      horas={horas}
      paraManana={paraManana}
      horaActual={horaActual}
    />
  );
}

// Lo que se ve mientras llega el pronóstico: la tarjeta con el mismo alto.
export function HorarioSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-[15.5rem] animate-pulse rounded-2xl border border-border bg-border/40"
    />
  );
}
