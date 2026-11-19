"use client"; // Lee el tema desde el DOM (data-theme + matchMedia).

// Fondo decorativo global. En la landing: un sol tibio en modo claro y un
// cielo nocturno con estrellas en modo oscuro. En el resto: un degradé suave.
// Fixed, detrás de todo, pointer-events:none.
// Usa GSAP para animar el sol (rayos pulsando) y las estrellas (titilando).
// Respeta prefers-reduced-motion.
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

// --- Suscripción al tema (claro/oscuro) --------------------------------------
// Observa data-theme en <html> y el prefers-color-scheme del sistema. La UI
// pone data-theme="light|dark" cuando el user elige manual; sin eso, cae en
// el sistema.
function suscribirTema(cb) {
  const html = document.documentElement;
  const mo = new MutationObserver(cb);
  mo.observe(html, { attributes: true, attributeFilter: ["data-theme"] });
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", cb);
  return () => {
    mo.disconnect();
    mq.removeEventListener("change", cb);
  };
}

function leerTema() {
  const forzado = document.documentElement.getAttribute("data-theme");
  if (forzado === "dark") return "dark";
  if (forzado === "light") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function FondoDecorativo() {
  // useSyncExternalStore evita warnings de React 19 de set-state-in-effect.
  // El tercer parámetro (fallback del servidor) es null: el fondo no aparece
  // en SSR. Evita mismatch de hidratación.
  const tema = useSyncExternalStore(suscribirTema, leerTema, () => null);
  const pathname = usePathname();

  if (!tema) return null;

  // El sol y el cielo con estrellas son para la landing, donde suman a la
  // estética. En las pantallas de uso (/hoy, placard, etc.) quedarían detrás
  // de botones y selectores, así que ahí va solo un degradé muy suave.
  const esLanding = pathname === "/";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {!esLanding ? (
        <DegradeSuave tema={tema} />
      ) : tema === "dark" ? (
        <CieloNocturno />
      ) : (
        <SolDiurno />
      )}
    </div>
  );
}

// --- Degradé suave -----------------------------------------------------------
// Para las pantallas de uso: un brillo tenue en una esquina, sin formas ni
// animación. Le da calidez al fondo sin competir con el contenido.
function DegradeSuave({ tema }) {
  const color = tema === "dark" ? "var(--marca-terciario)" : "var(--marca-secundario)";
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `radial-gradient(ellipse 60% 45% at 100% 0%, color-mix(in srgb, ${color} 12%, transparent), transparent 70%)`,
      }}
    />
  );
}

// --- Sol diurno --------------------------------------------------------------
// Un disco grande arriba a la derecha con rayos que respiran, un halo suave
// y un gradiente cálido al fondo. GSAP anima la rotación de los rayos y el
// pulso del halo.
function SolDiurno() {
  const ref = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const ctx = gsap.context(() => {
      gsap.to(".sol-rayos", {
        rotate: 360,
        duration: 120,
        ease: "none",
        repeat: -1,
        transformOrigin: "50% 50%",
      });
      gsap.to(".sol-halo", {
        scale: 1.08,
        opacity: 0.6,
        duration: 6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        transformOrigin: "50% 50%",
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <svg
      ref={ref}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMaxYMin slice"
      className="absolute inset-0 h-full w-full"
    >
      {/* Gradiente cálido general */}
      <defs>
        <radialGradient id="sol-fondo" cx="85%" cy="18%" r="60%">
          <stop offset="0%" stopColor="var(--marca-secundario)" stopOpacity="0.18" />
          <stop offset="50%" stopColor="var(--marca-primario)" stopOpacity="0.07" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="sol-disco" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--marca-secundario)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--marca-primario)" stopOpacity="0.9" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#sol-fondo)" />

      {/* Halo que respira */}
      <circle
        className="sol-halo"
        cx="86"
        cy="16"
        r="18"
        fill="var(--marca-secundario)"
        opacity="0.3"
      />
      {/* Rayos rotando lentamente */}
      <g className="sol-rayos" style={{ transformOrigin: "86px 16px" }}>
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={i}
            x1="86"
            y1="16"
            x2="86"
            y2="2"
            stroke="var(--marca-secundario)"
            strokeWidth="0.4"
            strokeLinecap="round"
            opacity="0.5"
            transform={`rotate(${(360 / 12) * i} 86 16)`}
          />
        ))}
      </g>
      {/* Disco sólido */}
      <circle cx="86" cy="16" r="9" fill="url(#sol-disco)" />
    </svg>
  );
}

// --- Cielo nocturno ----------------------------------------------------------
// Un degradé azul profundo + estrellas tituleando + luna en una esquina.
function CieloNocturno() {
  const ref = useRef(null);
  // Generamos las estrellas una sola vez. Cada estrella tiene cx, cy, r y
  // delay de titilación random.
  const [estrellas] = useState(() =>
    Array.from({ length: 70 }, (_, i) => ({
      id: i,
      cx: Math.random() * 100,
      cy: Math.random() * 100,
      r: Math.random() * 0.4 + 0.15,
      delay: Math.random() * 4,
      dur: 2 + Math.random() * 3,
    })),
  );

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".estrella").forEach((el, i) => {
        const data = estrellas[i];
        gsap.to(el, {
          opacity: 0.2,
          duration: data.dur,
          delay: data.delay,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });
      gsap.to(".luna-halo", {
        scale: 1.1,
        opacity: 0.5,
        duration: 8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        transformOrigin: "50% 50%",
      });
    }, ref);
    return () => ctx.revert();
  }, [estrellas]);

  return (
    <svg
      ref={ref}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <radialGradient id="cielo-fondo" cx="20%" cy="18%" r="80%">
          <stop offset="0%" stopColor="var(--marca-terciario)" stopOpacity="0.18" />
          <stop offset="40%" stopColor="#1a2a4a" stopOpacity="0.14" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="luna-brillo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="80%" stopColor="#e6e8ff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#cielo-fondo)" />

      {/* Estrellas (opacity base alta; GSAP las titila) */}
      {estrellas.map((e) => (
        <circle
          key={e.id}
          className="estrella"
          cx={e.cx}
          cy={e.cy}
          r={e.r}
          fill="#ffffff"
          opacity="0.9"
        />
      ))}

      {/* Luna arriba a la izquierda con halo */}
      <circle className="luna-halo" cx="18" cy="16" r="8" fill="#e6e8ff" opacity="0.3" />
      <circle cx="18" cy="16" r="5" fill="url(#luna-brillo)" />
      {/* Cráter pequeño para que la luna no sea un disco plano */}
      <circle cx="19.5" cy="17" r="1" fill="#cfd1e8" opacity="0.6" />
      <circle cx="16.5" cy="15.5" r="0.6" fill="#cfd1e8" opacity="0.5" />
    </svg>
  );
}
