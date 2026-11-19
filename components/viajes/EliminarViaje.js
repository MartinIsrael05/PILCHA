"use client"; // Alertdialog con focus trap.

import { useRef, useState, useTransition } from "react";
import { eliminarViaje } from "@/lib/actions/viajes";
import Button from "@/components/ui/Button";
import useFocusTrap from "@/hooks/useFocusTrap";

export default function EliminarViaje({ id }) {
  const [confirmando, setConfirmando] = useState(false);
  const [pendiente, startTransition] = useTransition();
  const dialogRef = useRef(null);
  const cancelarRef = useRef(null);
  const abridorRef = useRef(null);

  useFocusTrap({
    activo: confirmando,
    dialogRef,
    abridorRef,
    focoInicial: cancelarRef,
    bloquearCierre: pendiente,
    onCerrar: () => setConfirmando(false),
  });

  if (!confirmando) {
    return (
      <Button ref={abridorRef} variante="secundario" onClick={() => setConfirmando(true)}>
        Borrar viaje
      </Button>
    );
  }

  return (
    <div
      ref={dialogRef}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="borrar-viaje"
      className="flex flex-col gap-3 rounded-2xl border border-red-500 p-4"
    >
      <p id="borrar-viaje" className="text-sm">
        ¿Borramos este viaje?
      </p>
      <div className="flex gap-3">
        <Button
          onClick={() => startTransition(() => eliminarViaje(id))}
          disabled={pendiente}
          className="bg-red-600! text-white!"
        >
          {pendiente ? "Borrando…" : "Sí, borrar"}
        </Button>
        <Button
          ref={cancelarRef}
          variante="secundario"
          onClick={() => setConfirmando(false)}
          disabled={pendiente}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
