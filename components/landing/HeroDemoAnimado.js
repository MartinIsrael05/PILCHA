"use client"; // GSAP corre en el navegador.

// Demo animada que vive en el hero: cada 4 segundos cambia de clima y de
// outfit, con un cross-fade suave. Muestra "lo que hace PILCHA" sin
// decirlo con palabras.
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CLIMAS } from "@/lib/paletas";

// Outfits de muestra: 1 por cada clima clave. Colores coherentes con la
// paleta de ese clima. No usan fotos; son rects simples.
const DEMOS = [
  {
    clima: "soleado-calido",
    superior: "#e07a5f",
    inferior: "#4a6fa5",
    calzado: "#5b3a29",
    accento: "#f2a65a",
  },
  {
    clima: "lluvia",
    superior: "#1d3557",
    inferior: "#1f3250",
    calzado: "#111111",
    abrigo: "#e9c46a",
    accento: "#457b9d",
  },
  {
    clima: "frio",
    superior: "#8b5e3c",
    inferior: "#3d2b1f",
    calzado: "#111111",
    abrigo: "#9b2335",
    accesorio: "#d6c6b0",
    accento: "#9b2335",
  },
  {
    clima: "nublado",
    superior: "#adb5bd",
    inferior: "#343a40",
    calzado: "#111111",
    accento: "#4f7cac",
  },
];

export default function HeroDemoAnimado() {
  const [idx, setIdx] = useState(0);
  const contenedor = useRef(null);
  const demo = DEMOS[idx];
  const clima = CLIMAS[demo.clima];

  // Avanza al siguiente outfit cada 4.5s.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const timer = setInterval(() => {
      setIdx((i) => (i + 1) % DEMOS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Cross-fade de las prendas y el chip del clima al cambiar el outfit.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-demo-item]",
        { opacity: 0, y: 12, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.08,
        },
      );
      gsap.fromTo(
        "[data-demo-chip]",
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
      );
    }, contenedor);
    return () => ctx.revert();
  }, [idx]);

  return (
    <div
      ref={contenedor}
      className="relative mx-auto flex max-w-sm flex-col gap-4 rounded-2xl bg-background/80 p-5 shadow-xl ring-1 ring-border backdrop-blur"
    >
      <div className="flex items-center justify-between">
        <span
          data-demo-chip
          className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            backgroundColor: `${demo.accento}22`,
            color: "var(--foreground)",
          }}
        >
          <span aria-hidden="true">{clima.icono}</span>
          {clima.nombre}
        </span>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted">
          Demo
        </span>
      </div>

      <svg viewBox="0 0 240 420" className="h-72 w-auto mx-auto">
        {/* Silueta base */}
        <g fill="#f4e7d8" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.2">
          <circle cx="120" cy="50" r="28" />
          <path d="M108 76 L108 94 L132 94 L132 76 Z" />
          <path d="M72 98 Q96 92 120 94 Q144 92 168 98 L178 236 L156 238 L152 110 L88 110 L84 238 L62 236 Z" />
          <path d="M84 238 L74 400 L112 400 L120 254 L128 400 L166 400 L156 238 Z" />
        </g>
        {/* Prendas con data-demo-item para el stagger */}
        {demo.superior && (
          <path
            data-demo-item
            d="M72 110 L88 104 L104 108 L120 102 L136 108 L152 104 L168 110 L186 236 L160 238 L158 148 L155 230 L85 230 L82 148 L80 238 L54 236 Z"
            fill={demo.superior}
            opacity="0.95"
          />
        )}
        {demo.inferior && (
          <path
            data-demo-item
            d="M78 230 L162 230 L158 380 L128 380 L121 258 L119 258 L112 380 L82 380 Z"
            fill={demo.inferior}
            opacity="0.95"
          />
        )}
        {demo.calzado && (
          <path
            data-demo-item
            d="M70 358 L115 358 Q116 400 108 410 L92 410 Q68 408 72 386 Z M125 358 L170 358 Q174 408 148 410 L132 410 Q124 400 125 386 Z"
            fill={demo.calzado}
          />
        )}
        {demo.abrigo && (
          <path
            data-demo-item
            d="M60 108 L88 100 Q90 104 100 106 L116 110 L120 108 L124 110 L140 106 Q150 104 152 100 L180 108 L196 238 L166 242 L160 148 L155 234 L120 234 L85 234 L80 148 L74 242 L44 238 Z"
            fill={demo.abrigo}
            opacity="0.9"
          />
        )}
        {demo.accesorio && (
          <path
            data-demo-item
            d="M88 42 Q86 10 120 10 Q154 10 152 42 L152 50 L88 50 Z"
            fill={demo.accesorio}
          />
        )}
      </svg>

      <div className="flex flex-col gap-1 border-t border-border pt-3">
        <p className="text-xs uppercase tracking-wide text-muted">
          Outfit para hoy
        </p>
        <p
          data-demo-item
          className="text-sm font-semibold"
          style={{ color: demo.accento }}
        >
          Armado con 3 prendas de tu placard
        </p>
      </div>

      {/* Indicador de qué outfit vemos. Click para forzar. */}
      <div className="flex items-center justify-center gap-1.5">
        {DEMOS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            aria-label={`Ver outfit ${i + 1} de ${DEMOS.length}`}
            className={`h-1.5 rounded-full transition-all ${
              i === idx
                ? "w-6 bg-[var(--marca-primario)]"
                : "w-1.5 bg-border hover:bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
