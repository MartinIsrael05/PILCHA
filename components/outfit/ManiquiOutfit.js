// Preview visual del outfit sobre una silueta humana simple.
// Server Component: solo dibuja el resultado de recomendar().
//
// Cómo funciona: un SVG con la silueta hace de fondo y cada prenda del outfit
// se posiciona encima en el "slot" de su categoría (torso, piernas, pies…).
// Si la prenda tiene foto, se usa como <image href>; si no, un rect con el
// color de la prenda. Simple, explicable y sin librerías extra.
import Link from "next/link";
import Image from "next/image";
import { CATEGORIAS } from "@/lib/prendas";
import { colorDeTexto } from "@/lib/colores";
import IconoCategoria from "@/components/placard/IconoCategoria";

// Slots del maniquí, en coordenadas del viewBox 240x480.
// Cada categoría tiene uno. El abrigo va arriba del superior (al frente).
const SLOTS = {
  superior: { x: 60, y: 120, w: 120, h: 110, zIndex: 2 },
  inferior: { x: 70, y: 220, w: 100, h: 160, zIndex: 2 },
  calzado: { x: 70, y: 380, w: 100, h: 40, zIndex: 3 },
  abrigo: { x: 48, y: 115, w: 144, h: 140, zIndex: 4 },
  accesorio: { x: 95, y: 20, w: 50, h: 55, zIndex: 5 },
};

// Orden en que se dibujan las prendas: primero las de atrás (z bajo).
const ORDEN = Object.entries(SLOTS)
  .sort((a, b) => a[1].zIndex - b[1].zIndex)
  .map(([k]) => k);

export default function ManiquiOutfit({ recomendacion }) {
  const porCategoria = Object.fromEntries(
    recomendacion.outfit.map((item) => [item.categoria, item]),
  );

  return (
    <div className="flex flex-col gap-4">
      {/* El SVG ocupa el ancho disponible y mantiene proporción. */}
      <div className="relative mx-auto flex w-full max-w-sm items-center justify-center rounded-2xl bg-background p-3">
        <svg
          viewBox="0 0 240 480"
          role="img"
          aria-label="Previsualización del outfit sobre una silueta"
          className="h-auto w-full"
        >
          <Silueta />
          {ORDEN.map((categoria) => {
            const item = porCategoria[categoria];
            if (!item?.prenda) return null;
            return <PrendaEnSlot key={categoria} item={item} slot={SLOTS[categoria]} />;
          })}
        </svg>
      </div>

      {/* Leyenda abajo: lista textual para accesibilidad y para dar el link
          a cada prenda. */}
      <ul className="flex flex-col gap-1.5 text-sm">
        {recomendacion.outfit.map((item) => (
          <li key={item.categoria} className="flex items-center gap-2 text-foreground/90">
            <span
              aria-hidden="true"
              className="inline-flex size-4 shrink-0 items-center justify-center rounded-sm"
              style={{ backgroundColor: item.prenda?.color.hex ?? "transparent", color: item.prenda ? colorDeTexto(item.prenda.color.hex) : undefined, border: item.prenda ? "none" : "1px dashed currentColor" }}
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

// Silueta humana simple. Cabeza, cuello, torso trapezoidal, brazos, piernas.
// Trazo con currentColor para que respete el color del container.
function Silueta() {
  return (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.22"
      aria-hidden="true"
    >
      {/* Cabeza */}
      <circle cx="120" cy="50" r="30" />
      {/* Cuello */}
      <path d="M108 78 v14" />
      <path d="M132 78 v14" />
      {/* Torso y brazos */}
      <path d="M70 100 Q100 90 120 92 Q140 90 170 100 L180 240 L155 240 L150 110 L90 110 L85 240 L60 240 Z" />
      {/* Caderas y piernas */}
      <path d="M85 240 L72 420 L105 420 L118 260 L122 260 L135 420 L168 420 L155 240" />
      {/* Pies */}
      <path d="M72 420 Q68 440 90 440 L108 440 L105 420" />
      <path d="M168 420 Q172 440 150 440 L132 440 L135 420" />
    </g>
  );
}

// Una prenda dibujada dentro de su slot. Si hay foto, va como imagen
// recortada a los bordes del slot. Si no, un rect redondeado con el color
// de la prenda y el ícono de la categoría encima.
function PrendaEnSlot({ item, slot }) {
  const { prenda, categoria } = item;
  const { x, y, w, h } = slot;
  const colorIcono = colorDeTexto(prenda.color.hex);

  if (prenda.imagenUrl) {
    // foreignObject nos deja meter next/image, que optimiza el recorte
    // mejor que <image href=""> del SVG.
    return (
      <foreignObject x={x} y={y} width={w} height={h}>
        <div
          className="relative size-full overflow-hidden rounded-lg border border-foreground/10 shadow-sm"
          title={prenda.nombre}
        >
          <Image
            src={prenda.imagenUrl}
            alt=""
            fill
            sizes="240px"
            className="object-cover"
          />
        </div>
      </foreignObject>
    );
  }

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={10}
        fill={prenda.color.hex}
        stroke="currentColor"
        strokeOpacity="0.15"
      />
      {/* Ícono de la categoría dentro del rect: se ve si la prenda no tiene foto. */}
      <foreignObject x={x + w / 2 - 20} y={y + h / 2 - 20} width={40} height={40}>
        <div className="flex size-full items-center justify-center" style={{ color: colorIcono }}>
          <IconoCategoria categoria={categoria} className="size-10 opacity-80" />
        </div>
      </foreignObject>
    </g>
  );
}
