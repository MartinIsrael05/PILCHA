"use client"; // Pide confirmación antes de borrar.

import { useState, useTransition } from "react";
import { eliminarPaleta } from "@/lib/actions/paletas";
import Button from "@/components/ui/Button";

export default function EliminarPaleta({ id, nombre, esLaUnica }) {
  const [confirmando, setConfirmando] = useState(false);
  const [pendiente, startTransition] = useTransition();

  if (!confirmando) {
    return (
      <Button variante="secundario" onClick={() => setConfirmando(true)}>
        Eliminar paleta
      </Button>
    );
  }

  return (
    <div
      role="alertdialog"
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
