"use client"; // Pide confirmación y muestra el estado del botón.

// Muestra lo que PILCHA aprendió de tus calificaciones y permite reiniciarlo.
import { useState, useTransition } from "react";
import { reiniciarAjuste } from "@/lib/actions/perfil";
import Button from "@/components/ui/Button";

export default function AjusteTermico({ ajuste }) {
  const [confirmando, setConfirmando] = useState(false);
  const [pendiente, startTransition] = useTransition();

  function reiniciar() {
    startTransition(async () => {
      await reiniciarAjuste();
      setConfirmando(false);
    });
  }

  return (
    <section
      aria-labelledby="titulo-ajuste"
      className="flex max-w-xl flex-col gap-3 rounded-2xl border border-border bg-background p-5"
    >
      <h2 id="titulo-ajuste" className="font-semibold">
        Lo que aprendimos de vos
      </h2>
      <p className="text-muted">{explicar(ajuste)}</p>

      {ajuste !== 0 &&
        (confirmando ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm">¿Volvemos a cero?</p>
            <Button variante="secundario" onClick={reiniciar} disabled={pendiente}>
              {pendiente ? "Reiniciando…" : "Sí, reiniciar"}
            </Button>
            <Button variante="secundario" onClick={() => setConfirmando(false)}>
              Cancelar
            </Button>
          </div>
        ) : (
          <Button variante="secundario" onClick={() => setConfirmando(true)} className="self-start">
            Reiniciar aprendizaje
          </Button>
        ))}
    </section>
  );
}

function explicar(ajuste) {
  if (ajuste === 0) {
    return "Todavía no ajustamos nada. Cuando califiques tus outfits en el historial, vamos a aprender si te abrigamos de más o de menos.";
  }
  const grados = Math.abs(ajuste).toLocaleString("es-AR");
  return ajuste < 0
    ? `Por tus calificaciones, sentís el día ${grados}° más frío de lo que dice el pronóstico. Te recomendamos un poco más de abrigo.`
    : `Por tus calificaciones, sentís el día ${grados}° más cálido de lo que dice el pronóstico. Te recomendamos ropa un poco más liviana.`;
}
