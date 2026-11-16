"use client"; // useActionState para mostrar "Guardando…" y el resultado.

// Botón "Usé este outfit". Manda la ubicación, el horario y las prendas; el
// servidor recalcula el clima y lo guarda en el historial.
import Link from "next/link";
import { useActionState } from "react";
import { guardarOutfit } from "@/lib/actions/outfits";
import Button from "@/components/ui/Button";

const ESTADO_INICIAL = { ok: false, id: null, mensaje: null };

export default function UsarOutfit({ prendaIds, ubicacion, desde, hasta }) {
  const [estado, formAction, pendiente] = useActionState(guardarOutfit, ESTADO_INICIAL);

  if (estado.ok) {
    return (
      <p role="status" className="rounded-xl bg-background p-4 text-sm text-foreground">
        <strong>Guardado en tu historial.</strong> A la vuelta contanos cómo te fue:{" "}
        <Link href={`/historial/${estado.id}`} className="font-semibold underline">
          calificar este outfit
        </Link>
        .
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <input type="hidden" name="lat" value={ubicacion.lat} />
      <input type="hidden" name="lon" value={ubicacion.lon} />
      <input type="hidden" name="ciudad" value={ubicacion.nombre} />
      <input type="hidden" name="desde" value={desde} />
      <input type="hidden" name="hasta" value={hasta} />
      {prendaIds.map((id) => (
        <input key={id} type="hidden" name="prendaId" value={id} />
      ))}

      <Button type="submit" variante="secundario" disabled={pendiente}>
        {pendiente ? "Guardando…" : "Usé este outfit"}
      </Button>
      {estado.mensaje && (
        <p role="alert" className="rounded-lg bg-background px-3 py-2 text-sm text-red-700">
          {estado.mensaje}
        </p>
      )}
    </form>
  );
}
