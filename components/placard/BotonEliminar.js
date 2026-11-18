"use client"; // Alertdialog con focus trap y atajo de teclado.

import { useEffect, useRef, useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import { eliminarPrenda } from "@/lib/actions/prendas";

export default function BotonEliminar({ id, nombre }) {
  const [confirmando, setConfirmando] = useState(false);
  const [pendiente, startTransition] = useTransition();
  const dialogRef = useRef(null);
  const cancelarRef = useRef(null);
  const abridorRef = useRef(null);

  // Al abrir: mover el foco al botón "Cancelar" (acción segura por defecto),
  // atrapar el Tab dentro del diálogo y devolver el foco al botón de abrir
  // al cerrar. Es lo que WAI-ARIA Authoring Practices pide para alertdialog.
  useEffect(() => {
    if (!confirmando) return;
    cancelarRef.current?.focus();

    function manejarTeclado(e) {
      if (e.key === "Escape" && !pendiente) {
        e.preventDefault();
        setConfirmando(false);
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      // Elementos enfocables visibles dentro del diálogo.
      const foco = dialogRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled])'
      );
      if (foco.length === 0) return;
      const primero = foco[0];
      const ultimo = foco[foco.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    }

    document.addEventListener("keydown", manejarTeclado);
    return () => document.removeEventListener("keydown", manejarTeclado);
  }, [confirmando, pendiente]);

  // Al cerrar, devolvemos el foco al botón que abrió el diálogo.
  useEffect(() => {
    if (!confirmando) abridorRef.current?.focus();
  }, [confirmando]);

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
