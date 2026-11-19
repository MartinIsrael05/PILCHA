// Footer del sitio. Server Component: solo muestra texto y links.
import Link from "next/link";

const SECCIONES = [
  {
    titulo: "Explorar",
    links: [
      { href: "/", texto: "Inicio" },
      { href: "/paletas", texto: "Paletas" },
      { href: "/hoy", texto: "Hoy" },
    ],
  },
  {
    titulo: "Tu cuenta",
    links: [
      { href: "/registro", texto: "Crear cuenta" },
      { href: "/login", texto: "Ingresar" },
      { href: "/perfil", texto: "Mi perfil" },
    ],
  },
  {
    titulo: "Proyecto",
    links: [
      {
        href: "https://github.com/MartinIsrael05/TP-Final-PMIII",
        texto: "Repositorio en GitHub",
        externo: true,
      },
      {
        href: "https://github.com/lamaro/maimo-2026-tp-final",
        texto: "Consigna de la cátedra",
        externo: true,
      },
      {
        href: "https://open-meteo.com",
        texto: "Clima: Open-Meteo",
        externo: true,
      },
    ],
  },
];

const ANIO = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-border bg-border/20">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2 lg:col-span-1">
            <p className="text-lg font-black tracking-widest">PILCHA</p>
            <p className="max-w-xs text-sm text-muted">
              Qué ponerte hoy, armado con la ropa de tu placard y el clima de
              donde estás.
            </p>
          </div>
          {SECCIONES.map((seccion) => (
            <nav
              key={seccion.titulo}
              aria-labelledby={`footer-${seccion.titulo}`}
              className="flex flex-col gap-2"
            >
              <p
                id={`footer-${seccion.titulo}`}
                className="text-xs font-semibold uppercase tracking-wider text-muted"
              >
                {seccion.titulo}
              </p>
              <ul className="flex flex-col gap-1.5 text-sm">
                {seccion.links.map((link) => (
                  <li key={link.href}>
                    {link.externo ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="hover:underline"
                      >
                        {link.texto}
                      </a>
                    ) : (
                      <Link href={link.href} className="hover:underline">
                        {link.texto}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-xs text-muted">
          <p>© {ANIO} PILCHA · TP Final de Programación Multimedial III · UMAI</p>
          <p>Hecho con Next.js, Firebase y Open-Meteo</p>
        </div>
      </div>
    </footer>
  );
}
