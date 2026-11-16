// Tira de colores de una paleta. Cada color muestra su hex con un texto
// negro o blanco, el que tenga más contraste sobre ese fondo.
import { colorDeTexto } from "@/lib/colores";

export default function PaletaSwatch({ colores, tamaño = "normal", conHex = true }) {
  const alto = tamaño === "grande" ? "h-40 sm:h-56" : tamaño === "chico" ? "h-10" : "h-20";

  return (
    <ul className="flex overflow-hidden rounded-xl" aria-label="Colores de la paleta">
      {colores.map((hex) => (
        <li
          key={hex}
          className={`flex flex-1 items-end justify-center pb-2 ${alto}`}
          style={{ backgroundColor: hex, color: colorDeTexto(hex) }}
        >
          {conHex ? (
            <span className="font-mono text-[10px] uppercase sm:text-xs">{hex}</span>
          ) : (
            <span className="sr-only">{hex}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
