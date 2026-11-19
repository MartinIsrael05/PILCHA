"use client"; // Tiene estado (los tiradores) y cambia la URL al elegir otro horario.

// Selector de "a qué hora salís y a qué hora volvés".
//
// Arriba, atajos para los horarios más comunes. Abajo, la temperatura de cada
// hora del día como barras, con dos tiradores para marcar la salida y la
// vuelta. Mientras arrastrás ves qué parte del día te toca: el fresco de la
// mañana, el calor de la tarde. Ese es justo el problema que resuelve la app.
//
// Los tiradores son dos <input type="range"> nativos superpuestos: andan con
// teclado (flechas) y lectores de pantalla sin sumar librerías.
import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ULTIMA_HORA = 23;
// Cuánto esperar después del último movimiento para pedir el pronóstico.
// Así no se navega una vez por cada hora que pasa el tirador.
const ESPERA_MS = 450;

const ATAJOS = [
  { texto: "A la mañana", desde: 7, hasta: 13 },
  { texto: "A la tarde", desde: 13, hasta: 20 },
  { texto: "Todo el día", desde: 8, hasta: 22 },
  { texto: "A la noche", desde: 19, hasta: 23 },
];

// Medio ancho del tirador en px (los tiradores miden 20 px, ver globals.css).
// El centro del tirador nunca llega al borde del input: queda a esta
// distancia. Las barras usan el mismo margen para quedar alineadas.
const MEDIO_TIRADOR = 10;

export default function SelectorHorario({ desde, hasta, horas, paraManana, horaActual }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pendiente, startTransition] = useTransition();

  // Estado local: se mueve al instante mientras arrastrás. La URL se
  // actualiza recién cuando soltás (o dejás de tocar las flechas).
  const [rango, setRango] = useState({ desde, hasta });
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  function aplicar(nuevo) {
    clearTimeout(timer.current);
    const params = new URLSearchParams(searchParams);
    params.set("desde", nuevo.desde);
    params.set("hasta", nuevo.hasta);
    startTransition(() => {
      router.push(`${pathname}?${params}`, { scroll: false });
    });
  }

  function mover(campo, valor) {
    const v = Number(valor);
    // La salida siempre antes que la vuelta, con al menos una hora entre medio.
    const nuevo =
      campo === "desde"
        ? { desde: Math.min(v, rango.hasta - 1), hasta: rango.hasta }
        : { desde: rango.desde, hasta: Math.max(v, rango.desde + 1) };
    setRango(nuevo);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => aplicar(nuevo), ESPERA_MS);
  }

  function elegirAtajo(atajo) {
    const nuevo = { desde: atajo.desde, hasta: atajo.hasta };
    setRango(nuevo);
    aplicar(nuevo);
  }

  const duracion = rango.hasta - rango.desde;
  const cambiando = pendiente || rango.desde !== desde || rango.hasta !== hasta;

  return (
    <section
      aria-labelledby="titulo-horario"
      className="flex flex-col gap-5 rounded-2xl border border-border bg-background p-5 sm:p-6"
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h2 id="titulo-horario" className="text-sm text-muted">
            Tu horario afuera {paraManana ? "mañana" : "hoy"}
          </h2>
          <p className="text-2xl font-bold tracking-tight" aria-live="polite">
            {rango.desde}:00 a {rango.hasta}:00
            <span className="ml-2 text-base font-medium text-muted">
              {duracion} {duracion === 1 ? "hora" : "horas"}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Horarios rápidos">
          {ATAJOS.map((atajo) => {
            const activo = rango.desde === atajo.desde && rango.hasta === atajo.hasta;
            return (
              <button
                key={atajo.texto}
                type="button"
                aria-pressed={activo}
                onClick={() => elegirAtajo(atajo)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
                  activo
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background hover:border-foreground"
                }`}
              >
                {atajo.texto}
              </button>
            );
          })}
        </div>
      </header>

      <div className={`flex flex-col gap-2 transition-opacity ${cambiando ? "opacity-70" : ""}`}>
        {horas?.length > 0 && (
          <CurvaDelDia horas={horas} rango={rango} />
        )}

        {/* Los dos tiradores sobre una misma pista. */}
        <div className="relative h-6">
          <div
            className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-border"
            style={{ left: MEDIO_TIRADOR, right: MEDIO_TIRADOR }}
          />
          <div
            className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[var(--marca-primario)]"
            style={{
              left: posicion(rango.desde),
              width: `calc(${(duracion / ULTIMA_HORA) * 100}% - ${(duracion / ULTIMA_HORA) * MEDIO_TIRADOR * 2}px)`,
            }}
          />
          <input
            type="range"
            min={0}
            max={ULTIMA_HORA}
            step={1}
            value={rango.desde}
            onChange={(e) => mover("desde", e.target.value)}
            aria-label="Hora de salida"
            aria-valuetext={`${rango.desde}:00`}
            className="rango-hora absolute inset-0 z-10"
          />
          <input
            type="range"
            min={0}
            max={ULTIMA_HORA}
            step={1}
            value={rango.hasta}
            onChange={(e) => mover("hasta", e.target.value)}
            aria-label="Hora de vuelta"
            aria-valuetext={`${rango.hasta}:00`}
            className="rango-hora absolute inset-0 z-20"
          />
        </div>

        {/* Eje con algunas horas de referencia y la marca de "ahora". Las
            horas que quedan muy cerca de "ahora" se ocultan para no pisarse. */}
        <div className="relative h-5 text-xs text-muted" aria-hidden="true">
          {[0, 6, 12, 18, 23]
            .filter((h) => horaActual == null || Math.abs(h - horaActual) > 1)
            .map((h) => (
              <span
                key={h}
                className="absolute -translate-x-1/2"
                style={{ left: posicion(h) }}
              >
                {h}h
              </span>
            ))}
          {horaActual != null && (
            <span
              className="absolute -translate-x-1/2 rounded-full bg-foreground px-1.5 py-0.5 text-[11px] font-semibold leading-none text-background"
              style={{ left: posicion(horaActual) }}
            >
              ahora
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

// Barras con la temperatura de cada hora. Las que caen dentro de tu horario
// van en color; el resto, en gris. Arriba se marcan la mínima y la máxima
// de tu horario, y una gota en las horas con chance de lluvia.
function CurvaDelDia({ horas, rango }) {
  const temps = horas.map((h) => h.temp);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const alto = (temp) => 25 + ((temp - min) / (max - min || 1)) * 75; // % de 25 a 100

  const enRango = horas.filter((h) => h.hora >= rango.desde && h.hora <= rango.hasta);
  const masFria = enRango.reduce((a, b) => (b.temp < a.temp ? b : a), enRango[0]);
  const masCalida = enRango.reduce((a, b) => (b.temp > a.temp ? b : a), enRango[0]);

  return (
    <div
      className="relative h-28"
      role="img"
      aria-label={
        masFria
          ? `Entre las ${rango.desde} y las ${rango.hasta}: mínima ${Math.round(masFria.temp)}° a las ${masFria.hora}, máxima ${Math.round(masCalida.temp)}° a las ${masCalida.hora}.`
          : "Temperatura por hora"
      }
    >
      {horas.map((h) => {
        const dentro = h.hora >= rango.desde && h.hora <= rango.hasta;
        const marcar = dentro && (h === masFria || h === masCalida);
        return (
          <div
            key={h.hora}
            className="absolute bottom-0 flex -translate-x-1/2 flex-col items-center justify-end"
            style={{ left: posicion(h.hora), width: `calc(${100 / 24}% - 3px)`, height: "100%" }}
          >
            {marcar && (
              <span className="mb-1 text-[11px] font-semibold leading-none">{Math.round(h.temp)}°</span>
            )}
            {h.lluviaProb >= 40 && (
              <span className="mb-1 text-[10px] leading-none" title={`${h.lluviaProb}% de lluvia`}>
                💧
              </span>
            )}
            <div
              className={`w-full rounded-t-md transition-colors duration-200 ${
                dentro ? "bg-[var(--marca-primario)]" : "bg-border"
              }`}
              style={{ height: `${alto(h.temp) * 0.7}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

// Dónde cae una hora sobre la pista, en el mismo lugar que el centro del
// tirador nativo: medio tirador + proporción del resto del ancho.
function posicion(hora) {
  const p = hora / ULTIMA_HORA;
  return `calc(${MEDIO_TIRADOR}px + ${p} * (100% - ${MEDIO_TIRADOR * 2}px))`;
}
