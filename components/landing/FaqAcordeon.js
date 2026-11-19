"use client"; // Acordeón con animación de altura por GSAP.

// Patrón: el estado abierta/cerrada vive en React, pero el style (height,
// opacity) lo escribe EXCLUSIVAMENTE GSAP. Si React también lo seteara con
// style inline, cada re-render pisaría lo que escribe GSAP durante la
// animación, y el panel se quedaría sin la altura final (o sin opacity).
//
// <details> no se usa como contenedor porque GSAP no se lleva bien con el
// toggle nativo; sí se mantiene la semántica con role="region" y aria-expanded.
import { useEffect, useRef, useState } from "react";
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
          id={`faq-${i}`}
          pregunta={p.q}
          respuesta={p.a}
          abierta={abierta === i}
          onToggle={() => setAbierta(abierta === i ? null : i)}
        />
      ))}
    </ul>
  );
}

function Item({ id, pregunta, respuesta, abierta, onToggle }) {
  const panel = useRef(null);
  const chevron = useRef(null);
  // En el primer render no queremos animar (el panel ya arranca cerrado).
  const primero = useRef(true);

  // Sincroniza el DOM con el estado "abierta". GSAP mide la altura real y
  // anima; React nunca toca el style inline del panel.
  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Primer render: dejamos el panel en estado inicial sin animar.
    if (primero.current) {
      primero.current = false;
      gsap.set(el, { height: abierta ? "auto" : 0, opacity: abierta ? 1 : 0 });
      if (chevron.current) gsap.set(chevron.current, { rotate: abierta ? 180 : 0 });
      return;
    }

    if (reduce) {
      gsap.set(el, { height: abierta ? "auto" : 0, opacity: abierta ? 1 : 0 });
      if (chevron.current) gsap.set(chevron.current, { rotate: abierta ? 180 : 0 });
      return;
    }

    // Abrir: medimos la altura final (height: auto) y animamos desde 0.
    // Cerrar: animamos desde el height actual a 0. GSAP se encarga de medir.
    if (abierta) {
      gsap.to(el, {
        height: "auto",
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
      });
    } else {
      gsap.to(el, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      });
    }
    if (chevron.current) {
      gsap.to(chevron.current, {
        rotate: abierta ? 180 : 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [abierta]);

  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-background/70 backdrop-blur transition hover:border-[var(--marca-primario)]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierta}
        aria-controls={id}
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
          aria-hidden="true"
        >
          <path d="M5 8 L10 13 L15 8" />
        </svg>
      </button>
      {/* El panel SIEMPRE está en el DOM para que los lectores de pantalla
          puedan leerlo. GSAP controla height y opacity; no hay style inline
          desde React que lo pise. El ref arranca con height: 0 vía gsap.set. */}
      <div
        ref={panel}
        id={id}
        role="region"
        aria-hidden={!abierta}
        className="overflow-hidden"
      >
        <p className="px-5 pb-5 text-sm text-muted sm:text-base">{respuesta}</p>
      </div>
    </li>
  );
}
