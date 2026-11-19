"use client"; // GSAP corre en el navegador.

// Anima el hero de la landing con GSAP: entrada escalonada de los elementos
// (eyebrow → título → párrafo → botones → demo) y un leve "shimmer" del
// gradient al cargar. Sin ScrollTrigger: la animación corre una vez al montar.
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function HeroAnimado({ children }) {
  const contenedor = useRef(null);

  useEffect(() => {
    // Respeta prefers-reduced-motion: si el usuario pidió menos animación,
    // GSAP solo coloca los estados finales.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const elementos = gsap.utils.toArray("[data-hero-item]");
      // Estado inicial (invisible y levemente abajo) y animación de entrada
      // en cascada. Usamos set + to para no depender del estado CSS inicial.
      gsap.set(elementos, { opacity: 0, y: 24 });
      gsap.to(elementos, {
        opacity: 1,
        y: 0,
        duration: reduce ? 0 : 0.8,
        ease: "power3.out",
        stagger: reduce ? 0 : 0.12,
      });
    }, contenedor);

    // Cleanup: si el componente se desmonta, cancela animaciones pendientes.
    return () => ctx.revert();
  }, []);

  return <div ref={contenedor}>{children}</div>;
}
