"use client"; // Pide confirmación antes de borrar.

import { useState, useTransition } from "react";
import { eliminarViaje } from "@/lib/actions/viajes";
import Button from "@/components/ui/Button";

export default function EliminarViaje({ id }) {
  const [confirmando, setConfirmando] = useState(false);
  const [pendiente, startTransition] = useTransition();

  if (!confirmando) {
    return (
      <Button variante="secundario" onClick={() => setConfirmando(true)}>
        Borrar viaje
      </Button>
    );
  }

  return (
    <div
      role="alertdialog"
      aria-labelledby="borrar-viaje"
      className="flex flex-wrap items-center gap-3"
    >
      <p id="borrar-viaje" className="text-sm">
        ¿Borramos este viaje?
      </p>
      <Button
        onClick={() => startTransition(() => eliminarViaje(id))}
        disabled={pendiente}
        className="bg-red-600! text-white!"
      >
        {pendiente ? "Borrando…" : "Sí, borrar"}
      </Button>
      <Button
        variante="secundario"
        onClick={() => setConfirmando(false)}
        disabled={pendiente}
      >
        Cancelar
      </Button>
    </div>
  );
}
