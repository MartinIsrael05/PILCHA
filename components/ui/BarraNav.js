"use client"; // Lee el AuthContext para mostrar el link de admin cuando toca.

// Navegación principal: tira horizontal con ícono + texto en escritorio,
// barra inferior fija con íconos en mobile. Cada sección se puede abrir
// con un solo toque.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import IconoNav from "@/components/ui/IconosNav";

const ITEMS_LOGUEADO = [
  { href: "/hoy", texto: "Hoy", icono: "hoy" },
  { href: "/placard", texto: "Placard", icono: "placard" },
  { href: "/historial", texto: "Historial", icono: "historial" },
  { href: "/viajes", texto: "Viajes", icono: "viajes" },
  { href: "/stats", texto: "Stats", icono: "stats" },
  { href: "/paletas", texto: "Paletas", icono: "paletas" },
];
const ITEMS_ADMIN = { href: "/admin", texto: "Admin", icono: "admin" };
const ITEMS_PUBLICOS = [{ href: "/paletas", texto: "Paletas", icono: "paletas" }];

function useItems() {
  const { user, cargando } = useAuth();
  if (cargando) return [];
  if (!user) return ITEMS_PUBLICOS;
  return user.esAdmin ? [...ITEMS_LOGUEADO, ITEMS_ADMIN] : ITEMS_LOGUEADO;
}

function activa(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Fila horizontal debajo del logo en escritorio.
export function BarraNavEscritorio() {
  const pathname = usePathname();
  const items = useItems();
  if (items.length === 0) return <div className="h-10" aria-hidden="true" />;

  return (
    <nav
      aria-label="Secciones"
      className="hidden items-center gap-1 overflow-x-auto px-2 md:flex"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={activa(pathname, item.href) ? "page" : undefined}
          className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition hover:bg-border/60 ${
            activa(pathname, item.href)
              ? "bg-foreground text-background hover:bg-foreground"
              : "text-foreground"
          }`}
        >
          <IconoNav nombre={item.icono} className="size-4" />
          {item.texto}
        </Link>
      ))}
    </nav>
  );
}

// Barra fija al pie en mobile. Scroll horizontal si no entran todos los items.
export function BarraNavMobile() {
  const pathname = usePathname();
  const { user, cargando } = useAuth();
  const items = useItems();
  if (cargando || !user) return null;

  // En mobile sumamos "Perfil" como pestaña: no hay avatar en el header.
  const conPerfil = [...items, { href: "/perfil", texto: "Perfil", icono: "perfil" }];

  return (
    <nav
      aria-label="Secciones"
      className="sticky bottom-0 z-30 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-2 py-2">
        {conPerfil.map((item) => {
          const esActiva = activa(pathname, item.href);
          return (
            <li key={item.href} className="flex-1 min-w-16">
              <Link
                href={item.href}
                aria-current={esActiva ? "page" : undefined}
                className={`flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-medium transition ${
                  esActiva
                    ? "text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <IconoNav nombre={item.icono} className="size-6" />
                {item.texto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
