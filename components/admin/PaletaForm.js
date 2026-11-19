"use client"; // Estado del formulario, colores que se agregan y quitan, vista previa.

// Alta y edición de paletas en el panel de admin.
import { useActionState, useState } from "react";
import Link from "next/link";
import {
  ARMONIAS,
  CLIMAS,
  MAX_COLORES,
  MAX_DESCRIPCION_PALETA,
  MAX_NOMBRE_PALETA,
  MIN_COLORES,
  validarPaleta,
} from "@/lib/paletas";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import PaletaSwatch from "@/components/paletas/PaletaSwatch";

const ESTADO_INICIAL = { errores: {}, mensaje: null };
const COLORES_NUEVA = ["#1d3557", "#457b9d", "#a8dadc", "#f1faee"];

// `accion`: crearPaleta, o editarPaleta con el id ya fijado con bind.
// `climaInicial`: cuando se abre desde "+ Crear paleta para X" en /admin.
export default function PaletaForm({ accion, paleta = null, climaInicial = null }) {
  const [estado, formAction, pendiente] = useActionState(
    accion,
    ESTADO_INICIAL,
  );
  const [valores, setValores] = useState({
    clima: paleta?.clima ?? climaInicial ?? "",
    nombre: paleta?.nombre ?? "",
    armonia: paleta?.armonia ?? "",
    descripcion: paleta?.descripcion ?? "",
  });
  const [colores, setColores] = useState(paleta?.colores ?? COLORES_NUEVA);
  const [erroresLocales, setErroresLocales] = useState({});
  const errores = { ...estado.errores, ...erroresLocales };

  function cambiar(campo) {
    return (e) => setValores((v) => ({ ...v, [campo]: e.target.value }));
  }

  function cambiarColor(i, hex) {
    setColores((cs) => cs.map((c, j) => (j === i ? hex : c)));
  }

  // Misma validación que el servidor, para avisar antes de enviar.
  function handleSubmit(event) {
    const { errores: nuevos } = validarPaleta({ ...valores, colores });
    setErroresLocales(nuevos);
    if (Object.keys(nuevos).length > 0) event.preventDefault();
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="flex max-w-xl flex-col gap-5"
    >
      <Select
        id="clima"
        name="clima"
        label="Clima"
        value={valores.clima}
        onChange={cambiar("clima")}
        error={errores.clima}
      >
        <option value="">Elegí uno…</option>
        {Object.entries(CLIMAS).map(([clave, c]) => (
          <option key={clave} value={clave}>
            {c.icono} {c.nombre}
          </option>
        ))}
      </Select>

      <Input
        id="nombre"
        name="nombre"
        label="Nombre"
        maxLength={MAX_NOMBRE_PALETA}
        value={valores.nombre}
        onChange={cambiar("nombre")}
        error={errores.nombre}
        placeholder="Ej: Piloto amarillo"
      />

      <Select
        id="armonia"
        name="armonia"
        label="Armonía"
        value={valores.armonia}
        onChange={cambiar("armonia")}
        error={errores.armonia}
      >
        <option value="">Elegí una…</option>
        {Object.entries(ARMONIAS).map(([clave, a]) => (
          <option key={clave} value={clave}>
            {a.nombre}
          </option>
        ))}
      </Select>
      {ARMONIAS[valores.armonia] && (
        <p className="-mt-3 text-sm text-muted">
          {ARMONIAS[valores.armonia].explicacion}
        </p>
      )}

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1.5 text-sm font-medium">
          Colores ({MIN_COLORES} a {MAX_COLORES})
        </legend>
        <PaletaSwatch colores={colores} />
        <ul className="flex flex-col gap-2">
          {colores.map((hex, i) => (
            <li key={i} className="flex items-center gap-3">
              <label htmlFor={`color-${i}`} className="sr-only">
                Color {i + 1}
              </label>
              <input
                id={`color-${i}`}
                type="color"
                name="color"
                value={hex}
                onChange={(e) => cambiarColor(i, e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-background"
              />
              <span className="font-mono text-sm uppercase">{hex}</span>
              <button
                type="button"
                onClick={() => setColores((cs) => cs.filter((_, j) => j !== i))}
                disabled={colores.length <= MIN_COLORES}
                className="ml-auto text-sm text-muted underline hover:text-foreground disabled:no-underline disabled:opacity-40"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
        <Button
          variante="secundario"
          onClick={() => setColores((cs) => [...cs, "#9ca3af"])}
          disabled={colores.length >= MAX_COLORES}
          className="self-start px-4 py-2 text-sm"
        >
          Agregar color
        </Button>
        {errores.colores && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errores.colores}
          </p>
        )}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="descripcion" className="text-sm font-medium">
          Descripción
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows={3}
          maxLength={MAX_DESCRIPCION_PALETA}
          value={valores.descripcion}
          onChange={cambiar("descripcion")}
          className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-foreground"
        />
        {errores.descripcion && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errores.descripcion}
          </p>
        )}
      </div>

      {estado.mensaje && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {estado.mensaje}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pendiente}>
          {pendiente
            ? "Guardando…"
            : paleta
              ? "Guardar cambios"
              : "Crear paleta"}
        </Button>
        <Link
          href="/admin"
          className="text-sm text-muted underline hover:text-foreground"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
