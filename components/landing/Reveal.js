"use client"; // IntersectionObserver vive en el navegador.

// Envuelve un bloque con una animación de entrada (opacidad + leve subida)
// que se dispara cuando entra en viewport. Sin librerías: Observer nativo
// + CSS en globals.css. Respeta prefers-reduced-motion automáticamente
// (porque la transición ya está reducida globalmente).
import { useEffect, useRef, useState } from "react";

export default function Reveal({ children, delay = 0, as: As = "div", className = "" }) {
  const ref = useRef(null);
  // Si el navegador no tiene IntersectionObserver (muy viejos), arrancamos
  // ya visibles. Lazy initializer: corre solo en el cliente.
  const [visible, setVisible] = useState(() =>
    typeof window !== "undefined" && typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visible]);

  return (
    <As
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      className={`reveal ${visible ? "reveal-on" : ""} ${className}`}
    >
      {children}
    </As>
  );
}
