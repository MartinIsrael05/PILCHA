"use client"; // Escribe una variable CSS en <html> con un efecto.

// Pinta el gancho del logo con el color de la paleta del día. El logo vive
// en el header (layout raíz), fuera de la página, así que no le llegan las
// variables que pone cada página: por eso la escribimos en <html>.
// Al salir de la página se borra y el gancho vuelve al turquesa de marca.
import { useEffect } from "react";

export default function LogoDelDia({ color }) {
  useEffect(() => {
    if (!color) return;
    const html = document.documentElement;
    html.style.setProperty("--logo-gancho", color);
    return () => html.style.removeProperty("--logo-gancho");
  }, [color]);

  return null;
}
