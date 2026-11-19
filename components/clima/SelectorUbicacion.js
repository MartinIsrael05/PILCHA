"use client"; // Usa la geolocalización del navegador, localStorage y navegación.

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { redondearCoordenada } from "@/lib/ubicacion";
import { reverseGeocode } from "@/lib/clima";
import Button from "@/components/ui/Button";
import BuscadorCiudad from "@/components/clima/BuscadorCiudad";

// Recordamos la última ubicación elegida en este navegador para no tener
// que pedirla cada vez que alguien entra sin estar logueado.
const CLAVE_STORAGE = "pilcha:ubicacion";

export default function SelectorUbicacion({ ubicacionActual }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [localizando, setLocalizando] = useState(false);
  // El BuscadorCiudad nos presta su setter de mensaje para avisar errores
  // de geolocalización ("no diste permiso", etc.) en el mismo lugar.
  const setMensajeRef = useRef(null);
  function setMensaje(m) {
    setMensajeRef.current?.(m);
  }

  // Cambia la URL con la nueva ubicación. La página (Server Component) lee
  // la URL y pide el clima en el servidor.
  function irA(ubicacion, { reemplazar = false } = {}) {
    const params = new URLSearchParams(searchParams);
    params.set("lat", redondearCoordenada(ubicacion.lat));
    params.set("lon", redondearCoordenada(ubicacion.lon));
    params.set("ciudad", ubicacion.nombre);
    guardarUbicacion(ubicacion);
    const url = `${pathname}?${params}`;
    if (reemplazar) router.replace(url, { scroll: false });
    else router.push(url, { scroll: false });
  }

  // Si no hay ubicación en la URL, recuperamos la última que se usó.
  useEffect(() => {
    if (ubicacionActual) return;
    const guardada = leerUbicacionGuardada();
    if (!guardada) return;
    const params = new URLSearchParams(searchParams);
    params.set("lat", guardada.lat);
    params.set("lon", guardada.lon);
    params.set("ciudad", guardada.nombre);
    router.replace(`${pathname}?${params}`, { scroll: false });
  }, [ubicacionActual, pathname, router, searchParams]);

  function usarMiUbicacion() {
    if (!("geolocation" in navigator)) {
      setMensaje("Tu navegador no permite compartir la ubicación. Buscá tu ciudad.");
      return;
    }
    setLocalizando(true);
    setMensaje(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Pedimos el nombre real de la ciudad (reverse geocoding). Si falla,
        // usamos "Tu ubicación" como antes.
        const nombre = (await reverseGeocode(latitude, longitude)) ?? "Tu ubicación";
        setLocalizando(false);
        irA({ nombre, lat: latitude, lon: longitude });
      },
      (error) => {
        setLocalizando(false);
        setMensaje(
          error.code === error.PERMISSION_DENIED
            ? "No nos diste permiso para ver tu ubicación. Buscá tu ciudad acá abajo."
            : "No pudimos encontrar tu ubicación. Buscá tu ciudad acá abajo."
        );
      },
      // Aceptamos una posición de hasta 10 minutos atrás: el clima no cambia por eso.
      { timeout: 10000, maximumAge: 10 * 60 * 1000 }
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {ubicacionActual ? (
            <>
              Mostrando el clima en{" "}
              <strong className="text-foreground">{ubicacionActual.nombre}</strong>
            </>
          ) : (
            "¿Dónde estás hoy?"
          )}
        </p>
        <Button
          variante="secundario"
          onClick={usarMiUbicacion}
          disabled={localizando}
          className="px-4 py-2 text-sm"
        >
          <span aria-hidden="true">📍</span>
          {localizando ? "Buscando…" : "Usar mi ubicación"}
        </Button>
      </div>

      <BuscadorCiudad
        id="buscar-ciudad"
        etiqueta="Buscar ciudad"
        placeholder="O buscá una ciudad, por ejemplo Rosario"
        onElegir={irA}
        setMensajeExterno={(fn) => (setMensajeRef.current = fn)}
      />
    </div>
  );
}

function guardarUbicacion(ubicacion) {
  try {
    localStorage.setItem(
      CLAVE_STORAGE,
      JSON.stringify({
        nombre: ubicacion.nombre,
        lat: redondearCoordenada(ubicacion.lat),
        lon: redondearCoordenada(ubicacion.lon),
      })
    );
  } catch {
    // Navegación privada o storage bloqueado: no pasa nada, solo no se recuerda.
  }
}

function leerUbicacionGuardada() {
  try {
    const guardada = JSON.parse(localStorage.getItem(CLAVE_STORAGE));
    if (guardada && Number.isFinite(guardada.lat) && Number.isFinite(guardada.lon)) {
      return guardada;
    }
  } catch {
    // JSON roto o storage bloqueado.
  }
  return null;
}
