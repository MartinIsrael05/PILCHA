"use client"; // Lee y escribe localStorage y data-theme en <html>.

// Botón que alterna claro, oscuro y automático (sistema).
// El tema se aplica antes de React con el script en app/layout.js, así que
// acá solo cambiamos el estado y lo persistimos.
// Usamos useSyncExternalStore para leer localStorage: no genera warnings de
// React 19 y además sincroniza entre pestañas.
import { useSyncExternalStore } from "react";

const CLAVE = "pilcha:tema";
const OPCIONES = [
  { valor: "auto", nombre: "Automático", icono: "🌓" },
  { valor: "light", nombre: "Claro", icono: "☀️" },
  { valor: "dark", nombre: "Oscuro", icono: "🌙" },
];

function esValido(valor) {
  return OPCIONES.some((o) => o.valor === valor);
}

function leerTema() {
  try {
    const v = localStorage.getItem(CLAVE);
    return esValido(v) ? v : "auto";
  } catch {
    return "auto";
  }
}

function suscribir(cb) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

function aplicarTema(valor) {
  const html = document.documentElement;
  if (valor === "auto") html.removeAttribute("data-theme");
  else html.setAttribute("data-theme", valor);
}

export default function BotonTema() {
  // getSnapshot corre en cliente; el tercer argumento (null) es lo que ve el
  // servidor y la primera pasada del cliente, para que no haya mismatch.
  const tema = useSyncExternalStore(suscribir, leerTema, () => null);

  function cambiar() {
    const siguiente =
      OPCIONES[(OPCIONES.findIndex((o) => o.valor === tema) + 1) % OPCIONES.length];
    try {
      localStorage.setItem(CLAVE, siguiente.valor);
    } catch {
      // Storage bloqueado: aplicamos igual pero no se recuerda.
    }
    aplicarTema(siguiente.valor);
    // Forzamos el re-render notificando al store.
    window.dispatchEvent(new StorageEvent("storage", { key: CLAVE }));
  }

  if (!tema) return <div aria-hidden="true" className="h-9 w-9" />;
  const actual = OPCIONES.find((o) => o.valor === tema);

  return (
    <button
      type="button"
      onClick={cambiar}
      aria-label={`Tema: ${actual.nombre}. Cambiar.`}
      title={`Tema: ${actual.nombre}`}
      className="flex size-9 items-center justify-center rounded-full border border-border text-base transition hover:bg-border/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
    >
      <span aria-hidden="true">{actual.icono}</span>
    </button>
  );
}
