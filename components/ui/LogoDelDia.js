"use client"; // Escribe variables CSS en <html> con un efecto.

// Pinta el isotipo del logo con el color de la paleta del día. El logo vive
// en el header (layout raíz), fuera de la página, así que no le llegan las
// variables que pone cada página: por eso las escribimos en <html>.
// Al salir de la página se borran y el logo vuelve a los colores de marca.
import { useEffect } from "react";
import { colorAcento, colorDeTexto } from "@/lib/colores";

export default function LogoDelDia({ colores }) {
  // El color más vivo de la paleta, y blanco o negro para la percha encima.
  const color = colorAcento(colores ?? []);
  const colorTrazo = color ? colorDeTexto(color) : null;

  useEffect(() => {
    if (!color) return;
    const estilo = document.documentElement.style;
    estilo.setProperty("--logo-fondo-1", color);
    estilo.setProperty("--logo-fondo-2", color);
    if (colorTrazo) estilo.setProperty("--logo-trazo", colorTrazo);
    return () => {
      estilo.removeProperty("--logo-fondo-1");
      estilo.removeProperty("--logo-fondo-2");
      estilo.removeProperty("--logo-trazo");
    };
  }, [color, colorTrazo]);

  return null;
}
