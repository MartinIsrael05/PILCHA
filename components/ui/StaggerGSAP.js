"use client"; // GSAP corre en el navegador.

// Wrapper que anima a los hijos [data-stagger] con entrada en cascada al
// montar. Útil para listas (tarjetas del placard, tabs de hora por hora,
// filas de stats). Si el user prefiere menos movimiento, pone todo en
// estado final sin animar.
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function StaggerGSAP({
  children,
  selector = "[data-stagger]",
  y = 16,
  stagger = 0.05,
  duration = 0.45,
  as: As = "div",
  className = "",
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray(selector);
      gsap.fromTo(
        items,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: reduce ? 0 : duration,
          ease: "power2.out",
          stagger: reduce ? 0 : stagger,
        },
      );
    }, ref);
    return () => ctx.revert();
    // Observamos children.key via length para re-disparar si cambian.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <As ref={ref} className={className}>
      {children}
    </As>
  );
}
