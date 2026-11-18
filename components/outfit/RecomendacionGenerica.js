// Recomendación en texto para quien no tiene placard cargado (o no está
// logueado). Server Component: recibe el resultado de recomendar() y lo dibuja.
import Link from "next/link";
import Alertas from "@/components/clima/Alertas";

// conInvitacion: en /hoy la invitación a cargar el placard ya se muestra
// aparte, así que ahí se oculta el pie.
export default function RecomendacionGenerica({ recomendacion, logueado, conInvitacion = true }) {
  const { tempEfectiva, nivel, textoGenerico, alertas } = recomendacion;

  // Fondo con el acento de la paleta del día (variables CSS que define
  // OutfitDelDia). Si no hay paleta, vuelve a los colores de siempre.
  return (
    <article className="flex flex-col gap-5 rounded-2xl bg-[var(--tema-acento,var(--foreground))] p-5 text-[var(--tema-acento-texto,var(--background))] sm:p-6">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium opacity-80">
          {/* tempEfectiva ya incluye la sensibilidad del perfil */}
          Para vos se siente como {Math.round(tempEfectiva)}° · {nivel.nombre}
        </p>
        <h3 className="text-sm font-semibold uppercase tracking-widest opacity-80">
          Qué ponerte hoy
        </h3>
      </header>

      <p className="text-2xl font-semibold leading-snug sm:text-3xl">{textoGenerico}</p>

      {/* Las alertas van sobre fondo claro para que se lean bien */}
      <div className="rounded-xl bg-background p-1 text-foreground empty:hidden">
        <Alertas alertas={alertas} />
      </div>

      {conInvitacion && (
        <footer className="text-sm opacity-80">
          {logueado ? (
            <p>
              <Link href="/hoy" className="font-semibold underline">
                Mirá el outfit armado con tu placard
              </Link>
            </p>
          ) : (
            <p>
              <Link href="/registro" className="font-semibold underline">
                Creá tu cuenta
              </Link>{" "}
              y cargá tu placard: te armamos el outfit con tu propia ropa.
            </p>
          )}
        </footer>
      )}
    </article>
  );
}
