"use client"; // GSAP anima la entrada de las prendas; el SVG se renderiza igual.

// Preview visual del outfit sobre una silueta humana. Cada prenda se dibuja
// como una silueta SVG distinta según su categoría y nivel de abrigo. Si la
// prenda tiene foto, la foto se recorta a la silueta con un <clipPath>.
//
// El orden del z-index está pensado para que un abrigo vaya SOBRE el superior
// y los accesorios SOBRE todo.
import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { CATEGORIAS } from "@/lib/prendas";
import { colorDeTexto } from "@/lib/colores";
import { siluetaPrenda } from "@/components/outfit/siluetasPrendas";

// Orden de dibujo (los primeros van atrás, los últimos adelante).
const ORDEN = ["superior", "inferior", "calzado", "abrigo", "accesorio"];

export default function ManiquiOutfit({ recomendacion }) {
  const contenedor = useRef(null);
  const porCategoria = Object.fromEntries(
    recomendacion.outfit.map((item) => [item.categoria, item]),
  );

  // Entrada escalonada de las prendas con GSAP: cada <g data-prenda> aparece
  // con un fade + scale sutil. Si el usuario pide reducir movimiento, GSAP
  // deja todo en el estado final sin animar.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      const prendas = gsap.utils.toArray("[data-prenda]");
      gsap.fromTo(
        prendas,
        { opacity: 0, scale: 0.9, transformOrigin: "50% 50%" },
        {
          opacity: 1,
          scale: 1,
          duration: reduce ? 0 : 0.6,
          ease: "power2.out",
          stagger: reduce ? 0 : 0.08,
        },
      );
    }, contenedor);
    return () => ctx.revert();
    // Si cambia el outfit (misma vista, distinta recomendación), re-animamos.
  }, [recomendacion]);

  return (
    <div ref={contenedor} className="flex flex-col gap-4">
      <div className="relative mx-auto flex w-full max-w-sm items-center justify-center rounded-2xl bg-background p-3">
        <svg
          viewBox="0 0 240 480"
          role="img"
          aria-label="Previsualización del outfit sobre una silueta"
          className="h-auto w-full"
        >
          <defs>
            {/* Un clipPath por cada prenda con foto. Dentro del clip vive la
                imagen. Solo armamos los clips que vamos a usar. */}
            {ORDEN.map((categoria) => {
              const item = porCategoria[categoria];
              const silueta = item?.prenda && siluetaPrenda(categoria, item.prenda.abrigo);
              if (!silueta || !item.prenda.imagenUrl) return null;
              return (
                <clipPath key={`clip-${categoria}`} id={`clip-${categoria}`}>
                  <path d={silueta.d} />
                </clipPath>
              );
            })}
          </defs>

          <Silueta />

          {ORDEN.map((categoria) => {
            const item = porCategoria[categoria];
            if (!item?.prenda) return null;
            return <PrendaSVG key={categoria} categoria={categoria} prenda={item.prenda} />;
          })}
        </svg>
      </div>

      {/* Leyenda: lista accesible con nombre y link a cada prenda. */}
      <ul className="flex flex-col gap-1.5 text-sm">
        {recomendacion.outfit.map((item) => (
          <li key={item.categoria} className="flex items-center gap-2 text-foreground/90">
            <span
              aria-hidden="true"
              className="inline-flex size-4 shrink-0 items-center justify-center rounded-sm border"
              style={{
                backgroundColor: item.prenda?.color.hex ?? "transparent",
                borderColor: item.prenda ? "transparent" : "currentColor",
              }}
            />
            <span className="w-20 shrink-0 text-xs uppercase tracking-wide opacity-70">
              {CATEGORIAS[item.categoria]}
            </span>
            {item.prenda ? (
              <Link
                href={`/placard/${item.prenda.id}`}
                className="font-medium hover:underline"
              >
                {item.prenda.nombre}
              </Link>
            ) : (
              <span className="text-foreground/70">
                {item.opcional ? "Opcional" : item.texto}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Silueta humana base: queda atrás de todas las prendas.
function Silueta() {
  return (
    <g
      fill="#f4e7d8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeOpacity="0.2"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Cabeza */}
      <circle cx="120" cy="52" r="28" />
      {/* Cuello */}
      <path d="M108 78 L108 96 L132 96 L132 78 Z" />
      {/* Torso + brazos */}
      <path d="M72 100 Q96 94 120 96 Q144 94 168 100 L178 240 L156 242 L152 112 L88 112 L84 242 L62 240 Z" />
      {/* Piernas */}
      <path d="M84 242 L74 412 L112 412 L120 258 L128 412 L166 412 L156 242 Z" />
      {/* Pies (los tapa el calzado si hay) */}
      <path d="M74 412 Q70 428 92 428 L112 428 L112 412 Z" />
      <path d="M166 412 Q170 428 148 428 L128 428 L128 412 Z" />
    </g>
  );
}

// Dibuja una prenda: si tiene foto, la foto va dentro del clip de la silueta;
// si no, un path relleno con el color. Si la silueta define `linea` (abrigos),
// la dibuja encima para marcar el cierre central. Si define `pompon`
// (gorro), dibuja el circulito.
function PrendaSVG({ categoria, prenda }) {
  const silueta = siluetaPrenda(categoria, prenda.abrigo);
  if (!silueta) return null;

  const colorIcono = colorDeTexto(prenda.color.hex);

  return (
    <g data-prenda data-categoria={categoria}>
      {prenda.imagenUrl ? (
        <>
          {/* La imagen se recorta al contorno de la silueta con el clipPath. */}
          <image
            href={prenda.imagenUrl}
            x={silueta.x}
            y={silueta.y}
            width={silueta.w}
            height={silueta.h}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#clip-${categoria})`}
          />
          <path
            d={silueta.d}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.15"
            strokeWidth="1"
          />
        </>
      ) : (
        <path d={silueta.d} fill={prenda.color.hex} stroke="currentColor" strokeOpacity="0.15" />
      )}

      {silueta.linea && (
        <path d={silueta.linea} fill="none" stroke={colorIcono} strokeOpacity="0.35" strokeWidth="1" />
      )}
      {silueta.pompon && (
        <circle
          cx={silueta.pompon.cx}
          cy={silueta.pompon.cy}
          r={silueta.pompon.r}
          fill={prenda.color.hex}
          stroke="currentColor"
          strokeOpacity="0.2"
        />
      )}

      {/* Título accesible para hover/screen reader. */}
      <title>{`${CATEGORIAS[categoria]}: ${prenda.nombre}`}</title>
    </g>
  );
}
