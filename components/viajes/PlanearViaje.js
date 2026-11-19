"use client"; // Guarda la ciudad elegida en el buscador (estado) antes de enviar.

// Formulario para planear un viaje. Es un <form method="get"> común: manda
// la ciudad y las fechas en la URL de /viajes, y la página (servidor) arma
// la vista previa de la valija.
import { useState } from "react";
import BuscadorCiudad from "@/components/clima/BuscadorCiudad";
import Button from "@/components/ui/Button";

export default function PlanearViaje({ inicial, minFecha, maxFecha }) {
  const [ciudad, setCiudad] = useState(inicial.ciudad);
  const [desde, setDesde] = useState(inicial.desde ?? minFecha);
  const [hasta, setHasta] = useState(inicial.hasta ?? "");

  const claseFecha =
    "rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-foreground";

  return (
    <form
      method="get"
      action="/viajes"
      className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-5"
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-medium">¿A dónde vas?</legend>
        {ciudad && (
          <p className="rounded-lg bg-border/40 px-3 py-2.5 text-sm">
            <strong>{ciudad.nombre}</strong>
          </p>
        )}
        <BuscadorCiudad
          id="buscar-ciudad-viaje"
          etiqueta="Buscar ciudad de destino"
          placeholder={ciudad ? "Cambiar de destino" : "Ej: Bariloche"}
          onElegir={(r) =>
            setCiudad({ nombre: r.nombre, lat: r.lat, lon: r.lon })
          }
        />
        {/* La ciudad viaja en la URL como en la portada */}
        <input type="hidden" name="ciudad" value={ciudad?.nombre ?? ""} />
        <input type="hidden" name="lat" value={ciudad?.lat ?? ""} />
        <input type="hidden" name="lon" value={ciudad?.lon ?? ""} />
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="desde" className="text-sm font-medium">
            Ida
          </label>
          <input
            id="desde"
            name="desde"
            type="date"
            required
            min={minFecha}
            max={maxFecha}
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className={claseFecha}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="hasta" className="text-sm font-medium">
            Vuelta
          </label>
          <input
            id="hasta"
            name="hasta"
            type="date"
            required
            min={desde || minFecha}
            max={maxFecha}
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className={claseFecha}
          />
        </div>
      </div>
      <p className="text-sm text-muted">
        Hasta 14 días desde hoy: es lo que cubre el pronóstico.
      </p>

      <Button
        type="submit"
        disabled={!ciudad || !desde || !hasta}
        className="self-start"
      >
        Armar la valija
      </Button>
    </form>
  );
}
