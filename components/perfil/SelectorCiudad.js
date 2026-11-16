"use client"; // Buscador con estado y debounce.

// Elegir la ciudad por defecto. No navega: le avisa al formulario con
// onCambiar y el formulario la manda en campos ocultos.
import useBuscarCiudad from "@/hooks/useBuscarCiudad";

export default function SelectorCiudad({ ciudad, onCambiar, error }) {
  const { texto, resultados, buscando, mensaje, cambiarTexto, limpiar } = useBuscarCiudad();

  function elegir(resultado) {
    onCambiar({ nombre: resultado.nombre, lat: resultado.lat, lon: resultado.lon });
    limpiar();
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-sm font-medium">Ciudad por defecto</legend>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-border/40 px-3 py-2.5">
        <p className="text-sm">
          {ciudad ? <strong>{ciudad.nombre}</strong> : <span className="text-muted">Sin elegir</span>}
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

      <div className="relative">
        <label htmlFor="buscar-ciudad-perfil" className="sr-only">
          Buscar otra ciudad
        </label>
        <input
          id="buscar-ciudad-perfil"
          type="search"
          value={texto}
          onChange={(e) => cambiarTexto(e.target.value)}
          placeholder={ciudad ? "Cambiar por otra ciudad" : "Buscá tu ciudad"}
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "ciudad-error" : undefined}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-foreground aria-invalid:border-red-500"
        />

        {resultados.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-background shadow-lg">
            {resultados.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => elegir(r)}
                  className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-border/50 focus-visible:bg-border/50 focus-visible:outline-none"
                >
                  <span className="font-medium">{r.nombre}</span>
                  <span className="text-xs text-muted">{r.detalle}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p aria-live="polite" className="min-h-5 text-sm text-muted">
        {buscando ? "Buscando…" : mensaje}
      </p>
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
