"use client";

// Elegir la ciudad por defecto. No navega: le avisa al formulario con
// onCambiar y el formulario la manda en campos ocultos.
import BuscadorCiudad from "@/components/clima/BuscadorCiudad";

export default function SelectorCiudad({ ciudad, onCambiar, error }) {
  function elegir(resultado) {
    onCambiar({ nombre: resultado.nombre, lat: resultado.lat, lon: resultado.lon });
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-sm font-medium">Ciudad por defecto</legend>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-border/40 px-3 py-2.5">
        <p className="text-sm">
          {ciudad ? (
            <strong>{ciudad.nombre}</strong>
          ) : (
            <span className="text-muted">Sin elegir</span>
          )}
        </p>
        {ciudad && (
          <button
            type="button"
            onClick={() => onCambiar(null)}
            className="text-sm text-muted underline hover:text-foreground"
          >
            Quitar
          </button>
        )}
      </div>

      <BuscadorCiudad
        id="buscar-ciudad-perfil"
        etiqueta="Buscar otra ciudad"
        placeholder={ciudad ? "Cambiar por otra ciudad" : "Buscá tu ciudad"}
        invalido={Boolean(error)}
        descripcion={error ? "ciudad-error" : undefined}
        onElegir={elegir}
      />

      {error && (
        <p id="ciudad-error" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <p className="text-sm text-muted">
        Es la que usamos en Hoy cuando no elegís otra ubicación.
      </p>
    </fieldset>
  );
}
