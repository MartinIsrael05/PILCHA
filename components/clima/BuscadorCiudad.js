"use client"; // Maneja el estado del dropdown y el teclado.

// Buscador de ciudades con autocomplete accesible (patrón combobox/listbox):
// flechas arriba/abajo recorren, Enter elige, Escape cierra. Lo usan el
// selector de ubicación de la portada y el del perfil.
import { useEffect, useId, useRef, useState } from "react";
import useBuscarCiudad from "@/hooks/useBuscarCiudad";

export default function BuscadorCiudad({
  id,
  etiqueta,
  placeholder,
  invalido,
  descripcion,
  onElegir,
  setMensajeExterno, // la portada avisa errores de geolocalización por acá
}) {
  const reactId = useId();
  const inputId = id ?? `buscador-ciudad-${reactId}`;
  const listboxId = `${inputId}-listbox`;

  const { texto, resultados, buscando, mensaje, setMensaje, cambiarTexto, limpiar } =
    useBuscarCiudad();
  const [resaltado, setResaltado] = useState(-1);
  const listaRef = useRef(null);

  // Si quien nos usa quiere empujar mensajes (por ejemplo "no diste permiso
  // de ubicación"), le damos el setter del hook. setMensaje es estable
  // (viene de useState), así que el efecto corre una sola vez.
  useEffect(() => {
    setMensajeExterno?.(setMensaje);
  }, [setMensajeExterno, setMensaje]);

  function elegir(resultado) {
    onElegir(resultado);
    setResaltado(-1);
    limpiar();
  }

  function manejarTeclado(event) {
    if (!resultados.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setResaltado((r) => (r + 1) % resultados.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setResaltado((r) => (r <= 0 ? resultados.length - 1 : r - 1));
    } else if (event.key === "Enter") {
      // Elegir solo si hay algo resaltado: Enter sin flechas no "elige" la
      // primera opción porque sería menos predecible.
      if (resaltado >= 0) {
        event.preventDefault();
        elegir(resultados[resaltado]);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      limpiar();
      setResaltado(-1);
    }
  }

  const hayResultados = resultados.length > 0;
  const idOpcionActiva = resaltado >= 0 ? `${listboxId}-${resaltado}` : undefined;

  return (
    <>
      <label htmlFor={inputId} className="sr-only">
        {etiqueta}
      </label>
      {/* Contenedor relativo para posicionar la lista flotante */}
      <div className="relative">
        <input
          id={inputId}
          type="search"
          value={texto}
          onChange={(e) => {
            cambiarTexto(e.target.value);
            setResaltado(-1);
          }}
          onKeyDown={manejarTeclado}
          placeholder={placeholder}
          autoComplete="off"
          aria-invalid={invalido ? true : undefined}
          aria-describedby={descripcion || undefined}
          // Patrón combobox del WAI-ARIA Authoring Practices.
          role="combobox"
          aria-expanded={hayResultados}
          aria-controls={hayResultados ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={idOpcionActiva}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-foreground aria-invalid:border-red-500"
        />

        {hayResultados && (
          <ul
            ref={listaRef}
            id={listboxId}
            role="listbox"
            className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-background shadow-lg"
          >
            {resultados.map((r, i) => (
              <li
                key={r.id}
                id={`${listboxId}-${i}`}
                role="option"
                aria-selected={i === resaltado}
                // onMouseDown en vez de onClick: el click deshace el focus del
                // input y en algunos navegadores oculta la lista antes del click.
                onMouseDown={(e) => {
                  e.preventDefault();
                  elegir(r);
                }}
                onMouseEnter={() => setResaltado(i)}
                className={`flex cursor-pointer flex-col items-start px-3 py-2 ${
                  i === resaltado ? "bg-border/60" : "hover:bg-border/40"
                }`}
              >
                <span className="font-medium">{r.nombre}</span>
                <span className="text-xs text-muted">{r.detalle}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* aria-live: lectores de pantalla anuncian "buscando" y los errores */}
      <p aria-live="polite" className="min-h-5 text-sm text-muted">
        {buscando ? "Buscando…" : mensaje}
      </p>
    </>
  );
}
