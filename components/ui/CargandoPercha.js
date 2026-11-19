// Indicador de carga con la percha del logo balanceándose. Server Component:
// la animación es CSS pura (clase .percha-balanceo en globals.css), que se
// apaga si el usuario pidió menos movimiento.
import Logo from "./Logo";

export default function CargandoPercha({ texto = "Cargando…" }) {
  return (
    <div role="status" className="flex items-center gap-3 text-sm text-muted">
      <Logo variante="isotipo" id="logo-carga" titulo="" className="percha-balanceo h-8 w-auto" />
      <span>{texto}</span>
    </div>
  );
}
