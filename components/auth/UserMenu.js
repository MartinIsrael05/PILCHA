"use client"; // Lee el AuthContext y maneja el logout.

// Menú de usuario en el header: botones de tema y salir.
// La navegación entre secciones vive en BarraNav (escritorio) y
// BarraNavMobile (barra inferior fija en celular), que se renderizan aparte.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import BotonTema from "@/components/ui/BotonTema";
import IconoNav from "@/components/ui/IconosNav";

export default function UserMenu() {
  const router = useRouter();
  const { user, cargando, logout } = useAuth();

  async function salir() {
    await logout();
    router.push("/");
    router.refresh();
  }

  // Reservamos el espacio del header mientras Firebase averigua la sesión.
  if (cargando) return <div className="h-10 w-28" aria-hidden="true" />;

  if (!user) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium">
        <BotonTema />
        <Link
          href="/login"
          className="hidden rounded-full px-3 py-2 hover:bg-border/40 sm:inline-block"
        >
          Ingresar
        </Link>
        <Link
          href="/registro"
          className="rounded-full bg-foreground px-4 py-2 text-background hover:opacity-90"
        >
          Crear cuenta
        </Link>
      </div>
    );
  }

  const nombre = user.nombre || user.email;

  return (
    <div className="flex items-center gap-2">
      {/* Avatar con la inicial, link al perfil. Visible solo en escritorio:
          en mobile está en la barra inferior. */}
      <Link
        href="/perfil"
        aria-label={`Mi perfil (${nombre})`}
        className="hidden items-center gap-2 rounded-full border border-border bg-background px-2 py-1 text-sm font-medium transition hover:bg-border/40 md:flex"
      >
        <span
          aria-hidden="true"
          className="flex size-7 items-center justify-center rounded-full bg-foreground text-sm text-background"
        >
          {nombre.charAt(0).toUpperCase()}
        </span>
        <span className="pr-1">{nombre.split(" ")[0]}</span>
      </Link>

      <BotonTema />

      {/* Logout: texto en escritorio, ícono en mobile. Envolvemos para no
          chocar con las clases base del Button (inline-flex). */}
      <div className="hidden md:block">
        <Button
          variante="secundario"
          onClick={salir}
          className="gap-2 px-4 py-2 text-sm"
        >
          <IconoNav nombre="salir" className="size-4" />
          Salir
        </Button>
      </div>
      <button
        type="button"
        onClick={salir}
        aria-label="Salir"
        className="flex size-10 items-center justify-center rounded-full border border-border bg-background transition hover:bg-border/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground md:hidden"
      >
        <IconoNav nombre="salir" className="size-5" />
      </button>
    </div>
  );
}
