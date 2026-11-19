"use client";

// Encierra el foco dentro de un elemento (alertdialog o similar). Al abrir,
// pone el foco en el `focoInicial` (si lo pasás) y devuelve el foco al
// botón que abrió cuando se cierra. Escape dispara `onCerrar`.
//
// Uso:
//   const dialogRef = useRef(null);
//   const abridorRef = useRef(null);
//   const cancelarRef = useRef(null);
//   useFocusTrap({
//     activo: abierto,
//     dialogRef,
//     abridorRef,
//     focoInicial: cancelarRef,
//     onCerrar: () => setAbierto(false),
//   });
import { useEffect } from "react";

const SELECTOR_FOCO = 'button:not([disabled]), [href], input:not([disabled])';

export default function useFocusTrap({
  activo,
  dialogRef,
  abridorRef,
  focoInicial,
  onCerrar,
  bloquearCierre = false, // por ejemplo mientras hay un submit en curso
}) {
  // Atrapar Tab y responder a Escape mientras el diálogo esté abierto.
  useEffect(() => {
    if (!activo) return;
    focoInicial?.current?.focus();

    function manejarTeclado(e) {
      if (e.key === "Escape" && !bloquearCierre) {
        e.preventDefault();
        onCerrar?.();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;

      const enfocables = dialogRef.current.querySelectorAll(SELECTOR_FOCO);
      if (enfocables.length === 0) return;
      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
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
  }, [activo, bloquearCierre, dialogRef, focoInicial, onCerrar]);

  // Devolver el foco al botón que abrió el diálogo cuando se cierra.
  useEffect(() => {
    if (!activo) abridorRef?.current?.focus();
  }, [activo, abridorRef]);
}
