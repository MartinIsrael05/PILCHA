"use client"; // useActionState + useTransition para enviar sin recargar.

// Botones rápidos para calificar un outfit desde el listado del historial.
// 1 click = termina. Si el usuario quiere agregar una nota, va a la página
// del outfit.
import { useActionState } from "react";
import { CALIFICACIONES } from "@/lib/historial";
import { calificarOutfit } from "@/lib/actions/outfits";

const ESTADO_INICIAL = { ok: false, errores: {}, mensaje: null };

export default function CalificarInline({ outfitId }) {
  // bind fija el id en la Server Action, igual que en la página del outfit.
  const accion = calificarOutfit.bind(null, outfitId);
  const [estado, formAction, pendiente] = useActionState(accion, ESTADO_INICIAL);

  if (estado.ok) {
    return (
      <p role="status" className="text-sm text-muted">
        {estado.mensaje}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <p className="text-sm font-medium">¿Cómo te fue?</p>
      <div className="flex flex-wrap gap-2">
        {Object.entries(CALIFICACIONES).map(([clave, c]) => (
          <button
            key={clave}
            type="submit"
            name="calificacion"
            value={clave}
            disabled={pendiente}
            className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium transition hover:border-foreground disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            <span aria-hidden="true">{c.icono}</span>
            {c.nombre}
          </button>
        ))}
      </div>
      {estado.mensaje && !estado.ok && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {estado.mensaje}
        </p>
      )}
    </form>
  );
}
