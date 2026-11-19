"use client"; // Scroll-based + GSAP.

// Instrucciones de uso: 4 pasos con una ilustración animada que se dispara
// cuando el paso entra al viewport. Cada paso cuenta una parte del flujo
// de PILCHA con una mini-animación propia.
import { useEffect, useRef } from "react";
import gsap from "gsap";

const PASOS = [
  {
    numero: "01",
    titulo: "Creá tu cuenta",
    descripcion:
      "Email y contraseña (o Google). Sin tarjeta, sin letra chica. En 30 segundos estás adentro.",
    color: "var(--marca-primario)",
    tipo: "cuenta",
  },
  {
    numero: "02",
    titulo: "Cargá tu ropa",
    descripcion:
      "Nombre, categoría, color y nivel de abrigo. La foto es opcional. Repetí por cada prenda: buzo, jean, zapatillas, etc.",
    color: "var(--marca-secundario)",
    tipo: "prendas",
  },
  {
    numero: "03",
    titulo: "Decile a PILCHA dónde estás",
    descripcion:
      "Buscamos tu ciudad o usamos tu ubicación. Elegí la hora en que salís y la hora en que volvés.",
    color: "var(--marca-terciario)",
    tipo: "ubicacion",
  },
  {
    numero: "04",
    titulo: "Recibí tu outfit",
    descripcion:
      "Cada mañana en /hoy aparece el outfit del día armado con tu placard. Lo usás, decís cómo te fue, y la próxima recomendación corrige.",
    color: "var(--marca-primario)",
    tipo: "outfit",
  },
];

export default function InstruccionesInteractivas() {
  const contenedor = useRef(null);

  // Entrada secuencial al scroll: cada paso aparece cuando se acerca al
  // centro del viewport. Usamos IntersectionObserver en cada [data-paso].
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pasos = contenedor.current?.querySelectorAll("[data-paso]") ?? [];

    if (reduce) {
      pasos.forEach((p) => gsap.set(p, { opacity: 1, x: 0 }));
      return;
    }

    gsap.set(pasos, { opacity: 0 });
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            // Entrada lateral alternada: pares desde izquierda, impares desde derecha.
            const i = Number(e.target.dataset.paso);
            const desdeDer = i % 2 === 1;
            gsap.fromTo(
              e.target,
              { opacity: 0, x: desdeDer ? 60 : -60 },
              { opacity: 1, x: 0, duration: 0.7, ease: "power3.out" },
            );
            // Animamos la ilustración interna también.
            const ilustracion = e.target.querySelector("[data-ilustra]");
            if (ilustracion) {
              gsap.fromTo(
                ilustracion.children,
                { opacity: 0, scale: 0.85 },
                {
                  opacity: 1,
                  scale: 1,
                  duration: 0.5,
                  ease: "back.out(1.4)",
                  stagger: 0.1,
                  delay: 0.3,
                },
              );
            }
            obs.unobserve(e.target);
          }
        }
      },
      { threshold: 0.3 },
    );
    pasos.forEach((p) => obs.observe(p));
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={contenedor} className="flex flex-col gap-12 sm:gap-16">
      {PASOS.map((paso, i) => (
        <article
          key={paso.numero}
          data-paso={i}
          className={`grid items-center gap-6 sm:gap-10 lg:grid-cols-2 ${
            i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
          }`}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex size-12 items-center justify-center rounded-full font-mono text-base font-bold text-white shadow-md"
                style={{ backgroundColor: paso.color }}
              >
                {paso.numero}
              </span>
              <h3 className="text-2xl font-black tracking-tight sm:text-3xl">
                {paso.titulo}
              </h3>
            </div>
            <p className="max-w-md text-base text-muted sm:text-lg">
              {paso.descripcion}
            </p>
          </div>

          <div
            className="flex aspect-[4/3] items-center justify-center rounded-2xl p-6"
            style={{ backgroundColor: `${paso.color}15` }}
          >
            <IlustracionPaso tipo={paso.tipo} color={paso.color} />
          </div>
        </article>
      ))}
    </div>
  );
}

// Una ilustración SVG distinta por paso. children = elementos que se animan
// con stagger desde el padre.
function IlustracionPaso({ tipo, color }) {
  const props = {
    "data-ilustra": true,
    viewBox: "0 0 200 150",
    className: "h-full w-full max-h-48",
  };

  if (tipo === "cuenta") {
    return (
      <svg {...props}>
        {/* Formulario estilizado */}
        <rect x="20" y="20" width="160" height="110" rx="10" fill="#ffffff" stroke={color} strokeWidth="2" />
        <circle cx="100" cy="50" r="15" fill={color} opacity="0.3" />
        <circle cx="100" cy="50" r="8" fill={color} />
        <rect x="40" y="80" width="120" height="8" rx="4" fill={color} opacity="0.3" />
        <rect x="40" y="95" width="80" height="8" rx="4" fill={color} opacity="0.3" />
        <rect x="40" y="110" width="40" height="12" rx="6" fill={color} />
      </svg>
    );
  }
  if (tipo === "prendas") {
    return (
      <svg {...props}>
        {/* Percha + 3 prendas colgadas */}
        <path d="M100 20 A6 6 0 1 1 106 20" fill="none" stroke={color} strokeWidth="2" />
        <path d="M100 26 L100 32 L30 60 L170 60 L100 32" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <rect x="40" y="65" width="35" height="60" rx="6" fill={color} opacity="0.8" />
        <rect x="82" y="65" width="35" height="60" rx="6" fill={color} opacity="0.5" />
        <rect x="124" y="65" width="35" height="60" rx="6" fill={color} opacity="0.3" />
      </svg>
    );
  }
  if (tipo === "ubicacion") {
    return (
      <svg {...props}>
        {/* Mapa estilizado con pin */}
        <rect x="20" y="20" width="160" height="110" rx="10" fill="#ffffff" stroke={color} strokeWidth="2" />
        <path d="M20 90 L60 70 L110 95 L160 70 L180 85" stroke={color} strokeWidth="1.5" fill="none" opacity="0.4" />
        <path d="M20 110 L50 100 L90 115 L140 95 L180 110" stroke={color} strokeWidth="1.5" fill="none" opacity="0.4" />
        <circle cx="100" cy="60" r="20" fill={color} opacity="0.2" />
        <path d="M100 42 Q115 42 115 57 Q115 72 100 90 Q85 72 85 57 Q85 42 100 42 Z" fill={color} />
        <circle cx="100" cy="57" r="5" fill="#ffffff" />
      </svg>
    );
  }
  // outfit
  return (
    <svg {...props}>
      {/* Silueta con outfit completo */}
      <g fill={color} opacity="0.2">
        <circle cx="100" cy="35" r="12" />
        <path d="M78 55 L122 55 L128 110 L72 110 Z" />
        <rect x="82" y="110" width="36" height="25" rx="3" />
      </g>
      <path d="M80 55 Q90 50 100 51 Q110 50 120 55 L125 85 L75 85 Z" fill={color} />
      <rect x="82" y="88" width="36" height="35" rx="3" fill={color} opacity="0.7" />
      <rect x="80" y="125" width="40" height="10" rx="2" fill={color} opacity="0.5" />
    </svg>
  );
}
