"use client"; // Estado del formulario, useActionState y validación en el navegador.

import { useActionState, useState } from "react";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/context/AuthContext";
import { actualizarPerfil } from "@/lib/actions/perfil";
import { MAX_NOMBRE, SENSIBILIDADES, validarPerfil } from "@/lib/perfil";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import SelectorCiudad from "@/components/perfil/SelectorCiudad";

const ESTADO_INICIAL = { ok: false, errores: {}, mensaje: null };
const HORAS = Array.from({ length: 24 }, (_, i) => i);

export default function PerfilForm({ perfil }) {
  const { refrescarUsuario } = useAuth();

  // Llamamos a la Server Action y, si guardó bien, actualizamos el nombre que
  // muestra el header (vive en Firebase Auth, del lado del cliente).
  async function guardar(estadoPrevio, formData) {
    const resultado = await actualizarPerfil(estadoPrevio, formData);
    if (resultado.ok && auth.currentUser) {
      await auth.currentUser.reload();
      refrescarUsuario();
    }
    return resultado;
  }

  const [estado, formAction, pendiente] = useActionState(guardar, ESTADO_INICIAL);

  const [valores, setValores] = useState({
    nombre: perfil.nombre,
    horaSalida: String(perfil.horaSalida),
    horaVuelta: String(perfil.horaVuelta),
    sensibilidad: perfil.sensibilidad,
  });
  const [ciudad, setCiudad] = useState(perfil.ciudad);
  const [erroresLocales, setErroresLocales] = useState({});

  const errores = { ...estado.errores, ...erroresLocales };

  function cambiar(campo) {
    return (event) => setValores((previos) => ({ ...previos, [campo]: event.target.value }));
  }

  // Misma validación que el servidor, para avisar antes de enviar.
  function handleSubmit(event) {
    const { errores: nuevos } = validarPerfil({
      ...valores,
      ciudadNombre: ciudad?.nombre ?? "",
      ciudadLat: ciudad ? String(ciudad.lat) : "",
      ciudadLon: ciudad ? String(ciudad.lon) : "",
    });
    setErroresLocales(nuevos);
    if (Object.keys(nuevos).length > 0) event.preventDefault();
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="flex max-w-xl flex-col gap-6"
    >
      <Input
        id="nombre"
        name="nombre"
        label="Nombre"
        maxLength={MAX_NOMBRE}
        value={valores.nombre}
        onChange={cambiar("nombre")}
        error={errores.nombre}
        autoComplete="given-name"
      />

      <SelectorCiudad ciudad={ciudad} onCambiar={setCiudad} error={errores.ciudad} />
      {/* La ciudad elegida viaja al servidor en campos ocultos */}
      <input type="hidden" name="ciudadNombre" value={ciudad?.nombre ?? ""} />
      <input type="hidden" name="ciudadLat" value={ciudad?.lat ?? ""} />
      <input type="hidden" name="ciudadLon" value={ciudad?.lon ?? ""} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          id="horaSalida"
          name="horaSalida"
          label="Salgo a las"
          value={valores.horaSalida}
          onChange={cambiar("horaSalida")}
          error={errores.horaSalida}
        >
          {HORAS.map((h) => (
            <option key={h} value={h}>
              {h}:00
            </option>
          ))}
        </Select>
        <Select
          id="horaVuelta"
          name="horaVuelta"
          label="Vuelvo a las"
          value={valores.horaVuelta}
          onChange={cambiar("horaVuelta")}
          error={errores.horaVuelta}
        >
          {HORAS.map((h) => (
            <option key={h} value={h}>
              {h}:00
            </option>
          ))}
        </Select>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-medium">¿Cómo sentís la temperatura?</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {Object.entries(SENSIBILIDADES).map(([clave, s]) => (
            <label
              key={clave}
              className="flex cursor-pointer flex-col gap-0.5 rounded-xl border border-border p-3 has-checked:border-foreground has-checked:bg-border/40 has-focus-visible:outline-2 has-focus-visible:outline-foreground"
            >
              <span className="flex items-center gap-2 font-medium">
                <input
                  type="radio"
                  name="sensibilidad"
                  value={clave}
                  checked={valores.sensibilidad === clave}
                  onChange={cambiar("sensibilidad")}
                  className="size-4"
                />
                {s.nombre}
              </span>
              <span className="text-sm text-muted">{s.detalle}</span>
            </label>
          ))}
        </div>
        {errores.sensibilidad && (
          <p className="text-sm text-red-600 dark:text-red-400">{errores.sensibilidad}</p>
        )}
      </fieldset>

      {estado.mensaje && (
        <p
          role={estado.ok ? "status" : "alert"}
          className={estado.ok ? "text-sm text-green-700 dark:text-green-400" : "text-sm text-red-600 dark:text-red-400"}
        >
          {estado.mensaje}
        </p>
      )}

      <Button type="submit" disabled={pendiente} className="self-start">
        {pendiente ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
