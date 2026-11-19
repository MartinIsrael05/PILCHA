"use client"; // useTransition para mostrar "Activando…" mientras guarda.

// Botón para marcar una paleta como activa de su clima. Es lo que la app
// muestra en /hoy cuando hay más de una paleta para el mismo clima.
import { useTransition } from "react";
import { activarPaleta } from "@/lib/actions/paletas";

export default function BotonActivar({ id, activa }) {
  const [pendiente, startTransition] = useTransition();

  if (activa) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background">
        <span aria-hidden="true">✓</span>
        Activa
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => startTransition(() => activarPaleta(id))}
      disabled={pendiente}
      className="rounded-full border border-border px-3 py-1 text-xs font-medium transition hover:border-foreground hover:bg-border/40 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
    >
      {pendiente ? "Activando…" : "Usar esta"}
    </button>
  );
}
