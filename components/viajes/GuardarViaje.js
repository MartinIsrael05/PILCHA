"use client"; // useActionState para mostrar "Guardando…" y los errores.

// Botón para guardar el viaje de la vista previa. Manda solo la ciudad y
// las fechas: el servidor recalcula el plan antes de guardarlo.
import { useActionState } from "react";
import { guardarViaje } from "@/lib/actions/viajes";
import Button from "@/components/ui/Button";

export default function GuardarViaje({ ciudad, desde, hasta }) {
  const [estado, formAction, pendiente] = useActionState(guardarViaje, {
    mensaje: null,
  });

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <input type="hidden" name="ciudad" value={ciudad.nombre} />
      <input type="hidden" name="lat" value={ciudad.lat} />
      <input type="hidden" name="lon" value={ciudad.lon} />
      <input type="hidden" name="desde" value={desde} />
      <input type="hidden" name="hasta" value={hasta} />
      <Button type="submit" disabled={pendiente}>
        {pendiente ? "Guardando…" : "Guardar este viaje"}
      </Button>
      {estado.mensaje && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {estado.mensaje}
        </p>
      )}
    </form>
  );
}
