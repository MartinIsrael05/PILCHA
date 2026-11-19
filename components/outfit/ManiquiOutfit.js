"use client";

// Preview del outfit sobre una silueta humana. Cada prenda se dibuja como
// una silueta SVG distinta según su categoría y nivel de abrigo. Si la prenda
// tiene foto, se recorta a la silueta con un <clipPath>.
//
// Interacciones:
// - Entrada escalonada de las prendas con GSAP (fade + scale).
// - Hover sobre una prenda: aparece un panel con la foto grande, el color y
//   los datos. En mobile se toca una vez para "fijarla" (toggle).
// - El panel usa GSAP para entrar/salir con transición suave.
//
// Z-index de capas: superior → inferior → calzado → abrigo (encima del
// superior) → accesorio.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { CATEGORIAS, NIVELES_ABRIGO } from "@/lib/prendas";
import { colorDeTexto } from "@/lib/colores";
import { siluetaPrenda } from "@/components/outfit/siluetasPrendas";

const ORDEN = ["superior", "inferior", "calzado", "abrigo", "accesorio"];

export default function ManiquiOutfit({ recomendacion }) {
  const contenedor = useRef(null);
  const [activa, setActiva] = useState(null);
  const porCategoria = Object.fromEntries(
    recomendacion.outfit.map((item) => [item.categoria, item]),
  );
  const itemActivo = activa ? porCategoria[activa] : null;

  // Entrada escalonada al montar o cambiar la recomendación.
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
  }, [recomendacion]);

  return (
    <div
      ref={contenedor}
      className="relative flex flex-col gap-4"
      onPointerLeave={() => setActiva(null)}
    >
      <div className="relative mx-auto flex w-full max-w-sm items-center justify-center rounded-2xl bg-background p-3">
        <svg
          viewBox="0 0 240 480"
          role="img"
          aria-label="Previsualización del outfit sobre una silueta"
          className="h-auto w-full"
        >
          <defs>
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
            return (
              <PrendaSVG
                key={categoria}
                categoria={categoria}
                prenda={item.prenda}
                activa={activa === categoria}
                onActivar={() => setActiva(categoria)}
              />
            );
          })}
        </svg>

        {/* Panel de preview que aparece al hover/tap. */}
        {itemActivo?.prenda && (
          <PreviewPrenda prenda={itemActivo.prenda} categoria={itemActivo.categoria} />
        )}
      </div>

      {/* Leyenda abajo: lista textual accesible con link a cada prenda. */}
      <ul className="flex flex-col gap-1.5 text-sm">
        {recomendacion.outfit.map((item) => (
          <li
            key={item.categoria}
            className={`flex items-center gap-2 rounded-md px-1 text-foreground/90 transition ${
              activa === item.categoria && item.prenda ? "bg-[var(--marca-secundario)]/10" : ""
            }`}
            onPointerEnter={() => item.prenda && setActiva(item.categoria)}
          >
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

      <p className="text-center text-xs text-foreground/60">
        Pasá el mouse o tocá una prenda del maniquí para verla.
      </p>
    </div>
  );
}

// Silueta humana base.
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
      <circle cx="120" cy="52" r="28" />
      <path d="M108 78 L108 96 L132 96 L132 78 Z" />
      <path d="M72 100 Q96 94 120 96 Q144 94 168 100 L178 240 L156 242 L152 112 L88 112 L84 242 L62 240 Z" />
      <path d="M84 242 L74 412 L112 412 L120 258 L128 412 L166 412 L156 242 Z" />
      <path d="M74 412 Q70 428 92 428 L112 428 L112 412 Z" />
      <path d="M166 412 Q170 428 148 428 L128 428 L128 412 Z" />
    </g>
  );
}

// Una prenda dibujada sobre el maniquí. Capta pointer-events para activar
// el preview al hover. En hover, se agranda sutilmente con GSAP.
function PrendaSVG({ categoria, prenda, activa, onActivar }) {
  const ref = useRef(null);
  const silueta = siluetaPrenda(categoria, prenda.abrigo);
  const colorIcono = colorDeTexto(prenda.color.hex);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    // Scale al activarse: el contorno se "resalta".
    gsap.to(el, {
      scale: activa ? 1.04 : 1,
      duration: 0.3,
      ease: "power2.out",
      transformOrigin: "50% 50%",
    });
  }, [activa]);

  if (!silueta) return null;

  return (
    <g
      ref={ref}
      data-prenda
      data-categoria={categoria}
      onPointerEnter={onActivar}
      onFocus={onActivar}
      tabIndex={0}
      role="button"
      aria-label={`${CATEGORIAS[categoria]}: ${prenda.nombre}`}
      style={{ cursor: "pointer", outline: "none" }}
    >
      {/* Hit area (invisible pero recibe pointer-events): solo el rect del
          bounding box de la silueta responde al hover. */}
      <rect
        x={silueta.x - 2}
        y={silueta.y - 2}
        width={silueta.w + 4}
        height={silueta.h + 4}
        fill="transparent"
      />
      {prenda.imagenUrl ? (
        <>
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
            stroke={activa ? "var(--marca-primario)" : "currentColor"}
            strokeOpacity={activa ? "0.9" : "0.15"}
            strokeWidth={activa ? "2" : "1"}
          />
        </>
      ) : (
        <path
          d={silueta.d}
          fill={prenda.color.hex}
          stroke={activa ? "var(--marca-primario)" : "currentColor"}
          strokeOpacity={activa ? "0.9" : "0.15"}
          strokeWidth={activa ? "2" : "1"}
        />
      )}

      {silueta.linea && (
        <path
          d={silueta.linea}
          fill="none"
          stroke={colorIcono}
          strokeOpacity="0.35"
          strokeWidth="1"
        />
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

      <title>{`${CATEGORIAS[categoria]}: ${prenda.nombre}`}</title>
    </g>
  );
}

// Panel flotante con la foto grande y los datos. Entra con GSAP.
function PreviewPrenda({ prenda, categoria }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.fromTo(
      el,
      { opacity: 0, y: 8, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: reduce ? 0 : 0.28,
        ease: "power3.out",
      },
    );
  }, [prenda.id]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={`Preview de ${prenda.nombre}`}
      className="pointer-events-none absolute right-2 top-2 flex w-44 flex-col gap-2 rounded-xl border border-border bg-background p-2 shadow-xl sm:w-52"
    >
      <div
        className="relative aspect-square w-full overflow-hidden rounded-lg"
        style={{ backgroundColor: prenda.color.hex }}
      >
        {prenda.imagenUrl ? (
          <Image
            src={prenda.imagenUrl}
            alt={prenda.nombre}
            fill
            sizes="200px"
            className="object-cover"
          />
        ) : (
          <span
            className="flex size-full items-center justify-center text-sm font-semibold"
            style={{ color: colorDeTexto(prenda.color.hex) }}
          >
            {CATEGORIAS[categoria]}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 text-foreground">
        <p className="truncate text-sm font-semibold">{prenda.nombre}</p>
        <p className="text-xs text-muted">
          {CATEGORIAS[categoria]} · {prenda.color.nombre}
        </p>
        <p className="text-xs text-muted">
          Abrigo {prenda.abrigo} ({NIVELES_ABRIGO[prenda.abrigo].toLowerCase()})
          {prenda.impermeable && " · Impermeable"}
        </p>
      </div>
    </div>
  );
}
