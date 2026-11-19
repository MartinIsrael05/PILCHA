"use client"; // Tiene estado (los tiradores) y cambia la URL al elegir otro horario.

// Selector de "a qué hora salís y a qué hora volvés".
//
// Arriba, atajos para los horarios más comunes. Abajo, la temperatura de cada
// hora del día como barras, con dos tiradores para marcar la salida y la
// vuelta. Mientras arrastrás ves qué parte del día te toca: el fresco de la
// mañana, el calor de la tarde. Ese es justo el problema que resuelve la app.
//
// Cómo funciona el arrastre: toda la zona (barras + pista) escucha los
// eventos de puntero (mouse, dedo o lápiz). Al tocar, se elige el tirador
// más cercano y se lo mueve mientras dure el arrastre. Los tiradores son
// <div role="slider">: se enfocan con Tab y se mueven con las flechas.
// No usamos <input type="range"> superpuestos porque ese truco depende de
// CSS frágil y falla en algunos navegadores (por ejemplo Safari en iPhone).
import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ULTIMA_HORA = 23;
// Con el teclado, esperamos un poco después de la última flecha antes de
// pedir el pronóstico, así no se navega una vez por cada hora.
const ESPERA_MS = 450;

const ATAJOS = [
  { texto: "A la mañana", desde: 7, hasta: 13 },
  { texto: "A la tarde", desde: 13, hasta: 20 },
  { texto: "Todo el día", desde: 8, hasta: 22 },
  { texto: "A la noche", desde: 19, hasta: 23 },
];

// Margen a cada lado de la pista, en px: la hora 0 y la 23 quedan a esta
// distancia del borde para que el tirador (20 px) no se salga.
const MARGEN = 10;

export default function SelectorHorario({ desde, hasta, horas, paraManana, horaActual }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pendiente, startTransition] = useTransition();

  // Estado local: se mueve al instante mientras arrastrás. La URL se
  // actualiza recién al soltar. rangoRef tiene siempre el último valor para
  // leerlo dentro de los eventos sin esperar al próximo render.
  const [rango, setRango] = useState({ desde, hasta });
  const rangoRef = useRef(rango);
  const timer = useRef(null);
  const zona = useRef(null);
  const arrastrando = useRef(null); // "desde", "hasta" o null
  const tiradorDesde = useRef(null);
  const tiradorHasta = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  function aplicar(nuevo) {
    clearTimeout(timer.current);
    if (nuevo.desde === desde && nuevo.hasta === hasta) return; // nada cambió
    const params = new URLSearchParams(searchParams);
    params.set("desde", nuevo.desde);
    params.set("hasta", nuevo.hasta);
    startTransition(() => {
      router.push(`${pathname}?${params}`, { scroll: false });
    });
  }

  // Mueve un tirador a una hora. La salida siempre queda antes que la
  // vuelta, con al menos una hora entre medio.
  function mover(campo, hora) {
    const actual = rangoRef.current;
    const h = Math.min(Math.max(hora, 0), ULTIMA_HORA);
    const nuevo =
      campo === "desde"
        ? { desde: Math.min(h, actual.hasta - 1), hasta: actual.hasta }
        : { desde: actual.desde, hasta: Math.max(h, actual.desde + 1) };
    rangoRef.current = nuevo;
    setRango(nuevo);
    return nuevo;
  }

  // Qué hora corresponde a una posición horizontal del puntero.
  function horaEn(clientX) {
    const r = zona.current.getBoundingClientRect();
    const proporcion = (clientX - r.left - MARGEN) / (r.width - MARGEN * 2);
    return Math.round(proporcion * ULTIMA_HORA);
  }

  // --- Puntero (mouse, dedo o lápiz) ---------------------------------------
  function alApretar(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const h = horaEn(e.clientX);
    const { desde: d, hasta: v } = rangoRef.current;
    // El tirador más cercano. Si tocás afuera del rango, el del lado que tocaste.
    const campo = h <= d ? "desde" : h >= v ? "hasta" : h - d <= v - h ? "desde" : "hasta";
    arrastrando.current = campo;
    // Capturamos el puntero: seguimos recibiendo los movimientos aunque el
    // dedo o el mouse se salgan de la zona.
    e.currentTarget.setPointerCapture(e.pointerId);
    const tirador = campo === "desde" ? tiradorDesde : tiradorHasta;
    tirador.current?.focus({ preventScroll: true });
    clearTimeout(timer.current);
    mover(campo, h);
  }

  function alMover(e) {
    if (!arrastrando.current) return;
    mover(arrastrando.current, horaEn(e.clientX));
  }

  function alSoltar() {
    if (!arrastrando.current) return;
    arrastrando.current = null;
    aplicar(rangoRef.current);
  }

  // --- Teclado --------------------------------------------------------------
  function alTeclear(campo, e) {
    const pasos = {
      ArrowLeft: -1,
      ArrowDown: -1,
      ArrowRight: 1,
      ArrowUp: 1,
      PageDown: -3,
      PageUp: 3,
    };
    let hora;
    if (e.key in pasos) hora = rangoRef.current[campo] + pasos[e.key];
    else if (e.key === "Home") hora = 0;
    else if (e.key === "End") hora = ULTIMA_HORA;
    else return;
    e.preventDefault();
    const nuevo = mover(campo, hora);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => aplicar(nuevo), ESPERA_MS);
  }

  function elegirAtajo(atajo) {
    const nuevo = { desde: atajo.desde, hasta: atajo.hasta };
    rangoRef.current = nuevo;
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
            {`${rango.desde}:00 a ${rango.hasta}:00`}
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

      <div className={`flex flex-col gap-2 transition-opacity ${cambiando ? "opacity-80" : ""}`}>
        {/* Zona de arrastre: barras + pista. touch-action pan-y deja
            scrollear la página en vertical con el dedo, pero los arrastres
            horizontales son nuestros. select-none evita seleccionar texto. */}
        <div
          ref={zona}
          data-pista
          onPointerDown={alApretar}
          onPointerMove={alMover}
          onPointerUp={alSoltar}
          onPointerCancel={alSoltar}
          className="flex cursor-pointer select-none flex-col gap-2"
          style={{ touchAction: "pan-y" }}
        >
          {horas?.length > 0 && <CurvaDelDia horas={horas} rango={rango} />}

          <div className="relative h-6">
            {/* Pista gris y tramo elegido en color. */}
            <div
              className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-border"
              style={{ left: MARGEN, right: MARGEN }}
            />
            <div
              className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[var(--marca-primario)]"
              style={{ left: posicion(rango.desde), right: `calc(100% - ${posicion(rango.hasta)})` }}
            />
            <Tirador
              ref={tiradorDesde}
              etiqueta="Hora de salida"
              valor={rango.desde}
              onKeyDown={(e) => alTeclear("desde", e)}
            />
            <Tirador
              ref={tiradorHasta}
              etiqueta="Hora de vuelta"
              valor={rango.hasta}
              onKeyDown={(e) => alTeclear("hasta", e)}
            />
          </div>
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

// Un tirador: círculo blanco con borde de color. role="slider" y los
// aria-value* le dicen al lector de pantalla qué es y cuánto vale.
function Tirador({ ref, etiqueta, valor, onKeyDown }) {
  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={etiqueta}
      aria-valuemin={0}
      aria-valuemax={ULTIMA_HORA}
      aria-valuenow={valor}
      aria-valuetext={`${valor}:00`}
      aria-orientation="horizontal"
      onKeyDown={onKeyDown}
      className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[var(--marca-primario)] bg-background shadow-md transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground active:scale-110"
      style={{ left: posicion(valor) }}
    />
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
              className={`w-full rounded-t-md transition-colors duration-150 ${
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

// Dónde cae una hora sobre la pista: el margen más la proporción del resto
// del ancho. Lo usan las barras, los tiradores y el eje, así quedan alineados.
function posicion(hora) {
  const p = hora / ULTIMA_HORA;
  return `calc(${MARGEN}px + ${p} * (100% - ${MARGEN * 2}px))`;
}
