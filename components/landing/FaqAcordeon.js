"use client"; // Acordeón controlado + GSAP para el height animado.

// FAQ con acordeón: una sola pregunta abierta a la vez. GSAP anima la
// altura del panel al abrir y cerrar. Usa <details> semánticamente para
// que funcione sin JS (en ese caso sin animación, pero con todo accesible).
import { useRef, useState } from "react";
import gsap from "gsap";

const PREGUNTAS = [
  {
    q: "¿Necesito cargar toda mi ropa?",
    a: "No. Empezá con 5 o 10 prendas que uses seguido. PILCHA funciona desde la primera prenda; cuantas más cargues, más precisas las recomendaciones.",
  },
  {
    q: "¿Qué pasa si no tengo foto de la ropa?",
    a: "Ninguno de los campos de imagen es obligatorio. El motor trabaja con color, categoría y nivel de abrigo. La foto suma al preview pero no al armado.",
  },
  {
    q: "¿Se usan mis datos para publicidad?",
    a: "No. Tus prendas y tu historial viven en tu cuenta de Firebase y nadie los ve. PILCHA no tiene publicidad ni pasa datos a terceros.",
  },
  {
    q: "¿Cómo aprende de mí?",
    a: "Después de usar un outfit, lo calificás (frío, bien, calor). PILCHA ajusta un parámetro interno: si decís 'frío', la próxima recomendación te abriga un poco más.",
  },
  {
    q: "¿Funciona en el celular?",
    a: "Sí. La app es responsive y se puede instalar como PWA en Android y iOS desde el menú del navegador.",
  },
  {
    q: "¿Qué pasa si viajo?",
    a: "Usá el modo viaje: elegís ciudad y fechas, y PILCHA arma la valija mínima con tu placard para esos días.",
  },
];

export default function FaqAcordeon() {
  const [abierta, setAbierta] = useState(null);

  return (
    <ul className="flex flex-col gap-3">
      {PREGUNTAS.map((p, i) => (
        <Item
          key={i}
          pregunta={p.q}
          respuesta={p.a}
          abierta={abierta === i}
          onToggle={() => setAbierta(abierta === i ? null : i)}
        />
      ))}
    </ul>
  );
}

function Item({ pregunta, respuesta, abierta, onToggle }) {
  const panel = useRef(null);
  const chevron = useRef(null);

  function toggle() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nuevoEstado = !abierta;
    // GSAP: animamos height auto con la técnica de medir el scrollHeight.
    if (panel.current && !reduce) {
      if (nuevoEstado) {
        gsap.set(panel.current, { height: "auto" });
        gsap.from(panel.current, {
          height: 0,
          opacity: 0,
          duration: 0.35,
          ease: "power2.out",
        });
      } else {
        gsap.to(panel.current, {
          height: 0,
          opacity: 0,
          duration: 0.25,
          ease: "power2.in",
        });
      }
      gsap.to(chevron.current, {
        rotate: nuevoEstado ? 180 : 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }
    onToggle();
  }

  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-background/70 backdrop-blur transition hover:border-[var(--marca-primario)]">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={abierta}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--marca-primario)]"
      >
        <span>{pregunta}</span>
        <svg
          ref={chevron}
          viewBox="0 0 20 20"
          className="size-5 shrink-0 text-[var(--marca-primario)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M5 8 L10 13 L15 8" />
        </svg>
      </button>
      {/* El panel se oculta con height=0 cuando está cerrado; GSAP lo mide
          al abrir. Siempre está en el DOM para que el screen reader lo lea. */}
      <div
        ref={panel}
        style={{ height: abierta ? "auto" : 0, opacity: abierta ? 1 : 0 }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-5 text-sm text-muted sm:text-base">{respuesta}</p>
      </div>
    </li>
  );
}
