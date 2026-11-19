import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { CLIMAS } from "@/lib/paletas";
import Reveal from "@/components/landing/Reveal";
import DemoManiqui from "@/components/landing/DemoManiqui";
import HeroAnimado from "@/components/landing/HeroAnimado";

export const metadata = {
  // absolute evita que el template del layout agregue " | PILCHA" otra vez
  title: { absolute: "PILCHA | Qué ponerte hoy según el clima" },
  description:
    "Armá el outfit del día con la ropa de tu placard y el clima de donde estás. Paletas por clima, historial que aprende y modo viaje.",
};

// Landing: la portada es una pantalla de arribo con animaciones y CTAs.
// A quien ya está logueado le mandamos directo a /hoy: la landing es para
// los que todavía no entraron y queremos invitar.
export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/hoy");

  return (
    <div className="flex flex-col gap-24">
      <Hero />
      <ComoFunciona />
      <ParaCadaClima />
      <Beneficios />
      <CTAFinal />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative isolate -mx-4 overflow-hidden px-4 pb-16 pt-10 sm:pt-16">
      {/* Fondo decorativo: gradiente animado en una capa suave + puntos. */}
      <div
        aria-hidden="true"
        className="pilcha-gradient absolute inset-0 -z-10 opacity-20"
      />
      <div aria-hidden="true" className="pilcha-dots absolute inset-0 -z-10" />

      {/* HeroAnimado anima los elementos con data-hero-item con GSAP
          (stagger). El hero está sobre el fold, así que la animación corre
          una sola vez al montar. */}
      <HeroAnimado>
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div className="flex flex-col gap-6">
            <p data-hero-item className="text-xs font-semibold uppercase tracking-widest text-muted">
              Clima · Placard · Paletas
            </p>
            <h1
              data-hero-item
              className="text-5xl font-black leading-[1.02] tracking-tight sm:text-7xl"
            >
              ¿Qué me pongo
              <br />
              <span className="pilcha-gradient-text">hoy?</span>
            </h1>
            <p data-hero-item className="max-w-xl text-lg text-muted sm:text-xl">
              PILCHA mira el pronóstico entre la hora en que salís y la que
              volvés, y te arma el outfit del día con la ropa de tu placard.
              Aprende de vos y rota lo que ya tenés.
            </p>
            <div data-hero-item className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/registro"
                className="rounded-full bg-[var(--marca-primario)] px-6 py-3 font-medium text-white shadow-sm transition hover:brightness-110 hover:shadow-md"
              >
                Crear cuenta gratis
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-border px-6 py-3 font-medium transition hover:border-[var(--marca-primario)] hover:text-[var(--marca-primario)]"
              >
                Ya tengo cuenta
              </Link>
            </div>
            <p data-hero-item className="text-sm text-muted">
              Sin tarjeta. Tus datos quedan en tu cuenta.
            </p>
          </div>

          <div data-hero-item className="flex justify-center lg:justify-end">
            <DemoManiqui />
          </div>
        </div>
      </HeroAnimado>
    </section>
  );
}

const PASOS = [
  {
    numero: "01",
    titulo: "Cargá tu ropa",
    descripcion:
      "Alta rápida: nombre, categoría, color (sugerido por el picker) y nivel de abrigo. La foto es opcional.",
  },
  {
    numero: "02",
    titulo: "PILCHA lee el clima",
    descripcion:
      "Tomamos el pronóstico de Open-Meteo para el horario en que vas a estar afuera.",
  },
  {
    numero: "03",
    titulo: "Tu outfit, armado",
    descripcion:
      "El motor combina tu ropa con la paleta del día y rota prendas poco usadas. Calificás cómo te fue y aprende.",
  },
];

function ComoFunciona() {
  return (
    <section
      aria-labelledby="como-funciona"
      className="mx-auto flex max-w-6xl flex-col gap-10"
    >
      <Reveal className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
          Cómo funciona
        </p>
        <h2
          id="como-funciona"
          className="text-3xl font-black tracking-tight sm:text-4xl"
        >
          Tres pasos. Sin obsesión.
        </h2>
      </Reveal>

      <ol className="grid gap-5 sm:grid-cols-3">
        {PASOS.map((p, i) => (
          <Reveal key={p.numero} as="li" delay={i * 120} className="group flex flex-col gap-3 rounded-2xl border border-border bg-background/70 p-5 backdrop-blur hover-elevar hover:border-[var(--marca-primario)]">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-[var(--marca-primario)]/10 font-mono text-sm font-semibold text-[var(--marca-primario)]">
              {p.numero}
            </span>
            <h3 className="text-xl font-bold">{p.titulo}</h3>
            <p className="text-sm text-muted">{p.descripcion}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

function ParaCadaClima() {
  return (
    <section
      aria-labelledby="para-cada-clima"
      className="mx-auto flex max-w-6xl flex-col gap-10"
    >
      <Reveal className="flex max-w-2xl flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
          Para cada clima
        </p>
        <h2
          id="para-cada-clima"
          className="text-3xl font-black tracking-tight sm:text-4xl"
        >
          Sol, lluvia, frío o noche. Sabe qué sugerir.
        </h2>
        <p className="text-base text-muted">
          Cada condición tiene su propia paleta y su propia lógica: los
          impermeables se priorizan con lluvia, de noche no te pedimos
          protector solar, con nieve suben los grados de abrigo del calzado.
        </p>
      </Reveal>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(CLIMAS).map(([clave, c], i) => (
          <Reveal
            key={clave}
            as="li"
            delay={i * 80}
            className="flex items-start gap-3 rounded-2xl border border-border bg-background/70 p-4 backdrop-blur hover-elevar hover:border-[var(--marca-terciario)]"
          >
            <span aria-hidden="true" className="text-3xl drop-shadow-sm">
              {c.icono}
            </span>
            <div>
              <p className="font-semibold">{c.nombre}</p>
              <p className="text-sm text-muted first-letter:uppercase">
                Outfit {c.frase}.
              </p>
            </div>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

const BENEFICIOS = [
  {
    titulo: "Rota tu placard",
    descripcion:
      "Prioriza las prendas que menos usaste: tu ropa no se duerme en el fondo del cajón.",
  },
  {
    titulo: "Aprende de vos",
    descripcion:
      "Decís frío, bien o calor; la próxima recomendación corrige cuánto te abrigamos.",
  },
  {
    titulo: "Modo viaje",
    descripcion:
      "Ciudad y fechas: te armamos la valija mínima para esos días, sin llevar de más.",
  },
  {
    titulo: "Paletas por clima",
    descripcion:
      "Un día de lluvia no pide los mismos colores que una tarde de verano.",
  },
];

function Beneficios() {
  return (
    <section
      aria-labelledby="beneficios"
      className="mx-auto flex max-w-6xl flex-col gap-10"
    >
      <Reveal className="flex max-w-2xl flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
          Más que un pronóstico
        </p>
        <h2 id="beneficios" className="text-3xl font-black tracking-tight sm:text-4xl">
          Hecho para que decidas rápido.
        </h2>
      </Reveal>

      <ul className="grid gap-4 sm:grid-cols-2">
        {BENEFICIOS.map((b, i) => (
          <Reveal
            key={b.titulo}
            as="li"
            delay={i * 100}
            className="group flex flex-col gap-2 rounded-2xl border border-border bg-background/70 p-6 backdrop-blur hover-elevar hover:border-[var(--marca-secundario)]"
          >
            <h3 className="text-xl font-bold group-hover:text-[var(--marca-primario)]">
              {b.titulo}
            </h3>
            <p className="text-sm text-muted">{b.descripcion}</p>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

function CTAFinal() {
  return (
    <Reveal
      as="section"
      className="relative isolate mx-auto flex w-full max-w-6xl flex-col items-center gap-6 overflow-hidden rounded-3xl border border-border p-10 text-center sm:p-16"
    >
      <div
        aria-hidden="true"
        className="pilcha-gradient absolute inset-0 -z-10 opacity-15"
      />
      <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
        Dejá que el clima elija.
      </h2>
      <p className="max-w-xl text-lg text-muted">
        Cargá tu ropa una vez y despertate sabiendo qué ponerte.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/registro"
          className="rounded-full bg-[var(--marca-primario)] px-7 py-3.5 text-lg font-medium text-white shadow-sm transition hover:brightness-110 hover:shadow-md"
        >
          Empezar gratis
        </Link>
        <Link
          href="/paletas"
          className="rounded-full border border-border px-7 py-3.5 text-lg font-medium transition hover:border-[var(--marca-terciario)] hover:text-[var(--marca-terciario)]"
        >
          Explorar paletas
        </Link>
      </div>
    </Reveal>
  );
}
