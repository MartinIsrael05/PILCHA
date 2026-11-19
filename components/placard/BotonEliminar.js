"use client"; // Alertdialog con focus trap y atajo de teclado.

import { useRef, useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import useFocusTrap from "@/hooks/useFocusTrap";
import { eliminarPrenda } from "@/lib/actions/prendas";

export default function BotonEliminar({ id, nombre }) {
  const [confirmando, setConfirmando] = useState(false);
  const [pendiente, startTransition] = useTransition();
  const dialogRef = useRef(null);
  const cancelarRef = useRef(null);
  const abridorRef = useRef(null);

  // Trampa de foco + Escape + devolución del foco al cerrar (WAI-ARIA).
  useFocusTrap({
    activo: confirmando,
    dialogRef,
    abridorRef,
    focoInicial: cancelarRef,
    bloquearCierre: pendiente,
    onCerrar: () => setConfirmando(false),
  });

  function eliminar() {
    startTransition(async () => {
      await eliminarPrenda(id);
    });
  }

  if (!confirmando) {
    return (
      <Button ref={abridorRef} variante="secundario" onClick={() => setConfirmando(true)}>
        Eliminar prenda
      </Button>
    );
  }

  return (
    <div
      ref={dialogRef}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="eliminar-titulo"
      className="flex flex-col gap-3 rounded-2xl border border-red-500 p-4"
    >
      <p id="eliminar-titulo" className="text-sm">
        ¿Seguro que querés eliminar <strong>{nombre}</strong>? No se puede
        deshacer.
      </p>
      <div className="flex gap-3">
        <Button
          onClick={eliminar}
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
