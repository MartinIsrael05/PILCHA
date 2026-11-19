"use client"; // Lee y escribe localStorage y data-theme en <html>.

// Botón que alterna claro, oscuro y automático (sistema).
// El tema se aplica antes de React con el script en app/layout.js, así que
// acá solo cambiamos el estado y lo persistimos.
// Usamos useSyncExternalStore para leer localStorage: no genera warnings de
// React 19 y además sincroniza entre pestañas.
//
// Al cambiar el tema, un overlay con los colores de la marca cubre la
// pantalla desde el botón y se abre circular, pisa el tema nuevo entre esos
// dos pasos y después se desvanece. Transición dirigida por GSAP.
import { useRef, useSyncExternalStore } from "react";
import gsap from "gsap";

const CLAVE = "pilcha:tema";
const OPCIONES = [
  { valor: "auto", nombre: "Automático", icono: "🌓" },
  { valor: "light", nombre: "Claro", icono: "☀️" },
  { valor: "dark", nombre: "Oscuro", icono: "🌙" },
];

function esValido(valor) {
  return OPCIONES.some((o) => o.valor === valor);
}

function leerTema() {
  try {
    const v = localStorage.getItem(CLAVE);
    return esValido(v) ? v : "auto";
  } catch {
    return "auto";
  }
}

function suscribir(cb) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

function aplicarTema(valor) {
  const html = document.documentElement;
  if (valor === "auto") html.removeAttribute("data-theme");
  else html.setAttribute("data-theme", valor);
}

// Anima un círculo con los colores de marca que crece desde (x, y) hasta
// cubrir toda la pantalla. En el punto medio, cambia el tema; después, se
// contrae para revelar el tema nuevo. Devuelve una promesa que se resuelve
// cuando termina (para la UI opcional). Respeta prefers-reduced-motion.
function transicionDeTema(x, y, aplicar) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    aplicar();
    return Promise.resolve();
  }

  // Overlay full-screen con un radial-gradient de los 3 colores de marca,
  // recortado a un círculo que empieza en el click. GSAP anima el radio.
  const overlay = document.createElement("div");
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: radial-gradient(circle at ${x}px ${y}px,
      var(--marca-secundario) 0%,
      var(--marca-primario) 45%,
      var(--marca-terciario) 100%);
    pointer-events: none;
    clip-path: circle(0px at ${x}px ${y}px);
  `;
  document.body.appendChild(overlay);

  // El círculo tiene que llegar al pixel más lejano del viewport desde (x,y).
  const w = window.innerWidth;
  const h = window.innerHeight;
  const radio = Math.hypot(Math.max(x, w - x), Math.max(y, h - y));

  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        overlay.remove();
        resolve();
      },
    });
    tl.to(overlay, {
      clipPath: `circle(${radio}px at ${x}px ${y}px)`,
      duration: 0.45,
      ease: "power2.out",
      // A la mitad del recorrido ya está todo tapado: cambiamos el tema.
      onComplete: aplicar,
    })
      .to(overlay, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
      }, "+=0.08");
  });
}

export default function BotonTema() {
  // getSnapshot corre en cliente; el tercer argumento (null) es lo que ve el
  // servidor y la primera pasada del cliente, para que no haya mismatch.
  const tema = useSyncExternalStore(suscribir, leerTema, () => null);
  const boton = useRef(null);

  function cambiar(event) {
    const siguiente =
      OPCIONES[(OPCIONES.findIndex((o) => o.valor === tema) + 1) % OPCIONES.length];
    // Guardamos primero para que otras pestañas se enteren apenas se dispare
    // el storage event. El applyDOM lo hace la transición.
    try {
      localStorage.setItem(CLAVE, siguiente.valor);
    } catch {
      // Storage bloqueado: igual aplicamos sin persistir.
    }

    // Punto de origen de la onda: centro del botón clickeado.
    const rect = (boton.current ?? event.currentTarget).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    transicionDeTema(x, y, () => {
      aplicarTema(siguiente.valor);
      // Forzamos el re-render del botón y de quien escuche el store.
      window.dispatchEvent(new StorageEvent("storage", { key: CLAVE }));
    });
  }

  if (!tema) return <div aria-hidden="true" className="h-9 w-9" />;
  const actual = OPCIONES.find((o) => o.valor === tema);

  return (
    <button
      ref={boton}
      type="button"
      onClick={cambiar}
      aria-label={`Tema: ${actual.nombre}. Cambiar.`}
      title={`Tema: ${actual.nombre}`}
      className="flex size-9 items-center justify-center rounded-full border border-border text-base transition hover:bg-border/40 hover:border-[var(--marca-primario)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--marca-primario)]"
    >
      <span aria-hidden="true">{actual.icono}</span>
    </button>
  );
}
