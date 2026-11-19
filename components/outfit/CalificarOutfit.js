"use client"; // Estado del formulario y useActionState.

// Formulario para calificar un outfit: frío, bien o calor, más una nota.
import { useActionState, useState } from "react";
import { CALIFICACIONES, MAX_NOTA } from "@/lib/historial";
import Button from "@/components/ui/Button";

export default function CalificarOutfit({ accion, calificacion, nota }) {
  const [estado, formAction, pendiente] = useActionState(accion, {
    ok: false,
    errores: {},
    mensaje: null,
  });
  const [elegida, setElegida] = useState(calificacion ?? "");

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 font-semibold">¿Cómo te fue con este outfit?</legend>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(CALIFICACIONES).map(([clave, c]) => (
            <label
              key={clave}
              className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-border bg-background p-3 text-center has-checked:border-foreground has-checked:bg-border/40 has-focus-visible:outline-2 has-focus-visible:outline-foreground"
            >
              <input
                type="radio"
                name="calificacion"
                value={clave}
                checked={elegida === clave}
                onChange={() => setElegida(clave)}
                className="sr-only"
              />
              <span aria-hidden="true" className="text-3xl">
                {c.icono}
              </span>
              <span className="text-sm font-medium">{c.nombre}</span>
            </label>
          ))}
        </div>
        {estado.errores?.calificacion && (
          <p className="text-sm text-red-600 dark:text-red-400">{estado.errores.calificacion}</p>
        )}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nota" className="text-sm font-medium">
          Nota (opcional)
        </label>
        <textarea
          id="nota"
          name="nota"
          rows={3}
          maxLength={MAX_NOTA}
          defaultValue={nota}
          placeholder="Ej: a la noche refrescó más de lo que pensaba"
          className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-foreground"
        />
        {estado.errores?.nota && (
          <p className="text-sm text-red-600 dark:text-red-400">{estado.errores.nota}</p>
        )}
      </div>

      {estado.mensaje && (
        <p
          role={estado.ok ? "status" : "alert"}
          className={
            estado.ok
              ? "text-sm text-green-700 dark:text-green-400"
              : "text-sm text-red-600 dark:text-red-400"
          }
        >
          {estado.mensaje}
        </p>
      )}

      <Button type="submit" disabled={pendiente || !elegida} className="self-start">
        {pendiente ? "Guardando…" : calificacion ? "Actualizar calificación" : "Guardar calificación"}
      </Button>
    </form>
  );
}
