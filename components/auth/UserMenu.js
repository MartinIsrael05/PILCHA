"use client"; // Lee el usuario del AuthContext, maneja el menú hamburger y el logout.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import BotonTema from "@/components/ui/BotonTema";

const ITEMS_LOGUEADO = [
  { href: "/hoy", texto: "Hoy" },
  { href: "/placard", texto: "Mi placard" },
  { href: "/historial", texto: "Historial" },
  { href: "/viajes", texto: "Viajes" },
  { href: "/stats", texto: "Estadísticas" },
  { href: "/paletas", texto: "Paletas" },
  { href: "/perfil", texto: "Mi perfil" },
];

const ITEMS_PUBLICOS = [{ href: "/paletas", texto: "Paletas" }];

export default function UserMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, cargando, logout } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const menuRef = useRef(null);
  // Al navegar, cerramos el menú. Estado derivado (React 19): setState
  // durante render usando otro useState como memoria. Ver:
  // https://react.dev/learn/you-might-not-need-an-effect
  const [ultimaRuta, setUltimaRuta] = useState(pathname);
  if (ultimaRuta !== pathname) {
    setUltimaRuta(pathname);
    if (abierto) setAbierto(false);
  }

  // Cerrar con Escape o click fuera del menú.
  useEffect(() => {
    if (!abierto) return;
    function handleKey(e) {
      if (e.key === "Escape") setAbierto(false);
    }
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setAbierto(false);
    }
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [abierto]);

  async function salir() {
    setAbierto(false);
    await logout();
    router.push("/");
    router.refresh();
  }

  // Reservamos el espacio del header mientras Firebase averigua la sesión.
  if (cargando) return <div className="h-10 w-32" aria-hidden="true" />;

  const items = user
    ? [...ITEMS_LOGUEADO, ...(user.esAdmin ? [{ href: "/admin", texto: "Admin" }] : [])]
    : ITEMS_PUBLICOS;
  const nombre = user ? user.nombre || user.email : null;

  return (
    <div ref={menuRef} className="flex items-center gap-3">
      {/* Nav visible en escritorio */}
      <nav aria-label="Menú principal" className="hidden items-center gap-5 text-sm md:flex">
        {items.map((item) => (
          <ItemNav key={item.href} {...item} pathname={pathname} />
        ))}
      </nav>

      <BotonTema />

      {user ? (
        <>
          {/* Botón de logout visible en escritorio */}
          <Button
            variante="secundario"
            onClick={salir}
            className="hidden px-4 py-2 text-sm md:inline-flex"
          >
            Salir
          </Button>
          {/* Hamburger solo en mobile */}
          <button
            type="button"
            onClick={() => setAbierto((x) => !x)}
            aria-expanded={abierto}
            aria-controls="menu-movil"
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
            className="flex size-10 items-center justify-center rounded-full border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground md:hidden"
          >
            <IconoMenu abierto={abierto} />
          </button>
        </>
      ) : (
        <div className="flex items-center gap-3 text-sm font-medium">
          <Link href="/login" className="hover:underline">
            Ingresar
          </Link>
          <Link
            href="/registro"
            className="rounded-full bg-foreground px-4 py-2 text-background hover:opacity-90"
          >
            Crear cuenta
          </Link>
        </div>
      )}

      {/* Menú desplegable en mobile. Solo logueado, para no duplicar los links
          públicos que ya están visibles en el header. */}
      {user && abierto && (
        <div
          id="menu-movil"
          className="absolute left-0 right-0 top-full z-40 border-b border-border bg-background shadow-lg md:hidden"
        >
          <nav
            aria-label="Menú principal"
            className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-4"
          >
            <p className="mb-1 text-sm text-muted">Hola, {nombre}</p>
            {items.map((item) => (
              <ItemNavMovil key={item.href} {...item} pathname={pathname} />
            ))}
            <button
              type="button"
              onClick={salir}
              className="mt-2 rounded-lg border border-border px-3 py-2 text-left text-sm font-medium hover:bg-border/40"
            >
              Salir
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

function ItemNav({ href, texto, pathname }) {
  const activo = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={activo ? "page" : undefined}
      className={`font-medium hover:underline ${
        activo ? "underline underline-offset-4" : ""
      }`}
    >
      {texto}
    </Link>
  );
}

function ItemNavMovil({ href, texto, pathname }) {
  const activo = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={activo ? "page" : undefined}
      className={`rounded-lg px-3 py-2 text-base font-medium hover:bg-border/40 ${
        activo ? "bg-border/40" : ""
      }`}
    >
      {texto}
    </Link>
  );
}

function IconoMenu({ abierto }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5 stroke-current"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    >
      {abierto ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}
