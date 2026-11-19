"use client"; // Necesita saber si renderiza en el servidor o en el navegador.

// Script inline que corre una sola vez, mientras el navegador lee el HTML.
// React avisa en desarrollo cuando un componente renderiza un <script> en el
// cliente ("Encountered a script tag..."), porque ahí nunca se ejecuta.
// Para evitarlo, en el servidor sale como text/javascript (se ejecuta al
// cargar la página) y en el cliente como text/plain (React no lo toma como
// script). suppressHydrationWarning acepta esa diferencia de "type".
// Es el patrón que recomienda la guía de Next.js "Preventing flash before
// hydration".
export default function InlineScript({ html }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
