"use client"; // Alertdialog con focus trap.

import { useRef, useState, useTransition } from "react";
import { eliminarPaleta } from "@/lib/actions/paletas";
import Button from "@/components/ui/Button";
import useFocusTrap from "@/hooks/useFocusTrap";

export default function EliminarPaleta({ id, nombre, esLaUnica }) {
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
        Eliminar paleta
      </Button>
    );
  }

  return (
    <div
      ref={dialogRef}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="borrar-paleta"
      className="flex flex-col gap-3 rounded-2xl border border-red-500 p-4"
    >
      <p id="borrar-paleta" className="text-sm">
        ¿Eliminamos <strong>{nombre}</strong>?
        {esLaUnica &&
          " Es la única paleta de este clima: hasta que cargues otra, ese día no se va a mostrar paleta."}
      </p>
      <div className="flex gap-3">
        <Button
          onClick={() => startTransition(() => eliminarPaleta(id))}
          disabled={pendiente}
          className="bg-red-600! text-white!"
        >
          {pendiente ? "Eliminando…" : "Sí, eliminar"}
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
