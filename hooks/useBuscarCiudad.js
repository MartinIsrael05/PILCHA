"use client"; // Hook con estado y temporizadores: solo funciona en el navegador.

// Buscador de ciudades con debounce: espera 300 ms desde la última tecla
// antes de pedirle a Open-Meteo, para no hacer un pedido por cada letra.
// Lo usan el selector de ubicación de la portada y el del perfil.
import { useRef, useState } from "react";
import { buscarCiudad } from "@/lib/clima";

export default function useBuscarCiudad() {
  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const temporizador = useRef(null);
  const ultimaBusqueda = useRef(0);

  function cambiarTexto(valor) {
    setTexto(valor);
    clearTimeout(temporizador.current);

    if (valor.trim().length < 2) {
      setResultados([]);
      setBuscando(false);
      setMensaje(null);
      return;
    }

    setBuscando(true);
    temporizador.current = setTimeout(async () => {
      // Si llega tarde la respuesta de una búsqueda vieja, la ignoramos.
      const numero = ++ultimaBusqueda.current;
      try {
        const encontradas = await buscarCiudad(valor);
        if (numero !== ultimaBusqueda.current) return;
        setResultados(encontradas);
        setMensaje(encontradas.length ? null : "No encontramos ninguna ciudad con ese nombre.");
      } catch {
        if (numero !== ultimaBusqueda.current) return;
        setMensaje("No pudimos buscar la ciudad. Probá de nuevo.");
      } finally {
        if (numero === ultimaBusqueda.current) setBuscando(false);
      }
    }, 300);
  }

  // Después de elegir una ciudad: vacía el buscador.
  function limpiar() {
    clearTimeout(temporizador.current);
    ultimaBusqueda.current++;
    setTexto("");
    setResultados([]);
    setBuscando(false);
    setMensaje(null);
  }

  return { texto, resultados, buscando, mensaje, setMensaje, cambiarTexto, limpiar };
}
