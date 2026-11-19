// Indicador de carga con la percha del logo balanceándose. Server Component:
// la animación es CSS pura (clase .percha-balanceo en globals.css), que se
// apaga si el usuario pidió menos movimiento.
import { GROSOR_PERCHA, PERCHA, VIEWBOX_PERCHA } from "@/lib/logo";

export default function CargandoPercha({ texto = "Cargando…" }) {
  return (
    <div role="status" className="flex items-center gap-3 text-sm text-muted">
      <svg
        viewBox={VIEWBOX_PERCHA}
        className="percha-balanceo h-6 w-auto overflow-visible text-[var(--marca-primario)]"
        aria-hidden="true"
      >
        <path
          d={PERCHA}
          fill="none"
          stroke="currentColor"
          strokeWidth={GROSOR_PERCHA}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{texto}</span>
    </div>
  );
}
