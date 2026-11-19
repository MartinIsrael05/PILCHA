import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { CLIMAS } from "@/lib/paletas";
import Reveal from "@/components/landing/Reveal";
import HeroDemoAnimado from "@/components/landing/HeroDemoAnimado";
import HeroAnimado from "@/components/landing/HeroAnimado";
import InstruccionesInteractivas from "@/components/landing/InstruccionesInteractivas";
import FaqAcordeon from "@/components/landing/FaqAcordeon";

export const metadata = {
  title: { absolute: "PILCHA | Qué ponerte hoy según el clima" },
  description:
    "Armá el outfit del día con la ropa de tu placard y el clima de donde estás. Paletas por clima, historial que aprende y modo viaje.",
};

// Landing: la portada es una pantalla de arribo con animaciones y CTAs.
// A quien ya está logueado le mandamos directo a /hoy.
export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/hoy");

  return (
    <div className="flex flex-col gap-24 sm:gap-32">
      <Hero />
      <ParaCadaClima />
      <ComoSeUsa />
      <Beneficios />
      <Faq />
      <CTAFinal />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative isolate -mx-4 overflow-hidden px-4 pb-16 pt-10 sm:pt-20">
      {/* El fondo con sol/estrellas viene del layout; acá sumamos una capa
          extra de gradiente para que el hero destaque. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-full bg-gradient-to-b from-[var(--marca-secundario)]/10 via-transparent to-transparent"
      />

      <HeroAnimado>
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div className="flex flex-col gap-6">
            <p
              data-hero-item
              className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--marca-primario)]/30 bg-[var(--marca-primario)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[var(--marca-primario)]"
            >
              <span aria-hidden="true">✨</span>
              Clima, placard y paletas
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
            <p data-hero-item className="flex items-center gap-4 text-sm text-muted">
              <span className="flex items-center gap-1">
                <span className="inline-block size-2 rounded-full bg-[var(--marca-terciario)]" />
                Sin tarjeta
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block size-2 rounded-full bg-[var(--marca-secundario)]" />
                Datos en tu cuenta
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block size-2 rounded-full bg-[var(--marca-primario)]" />
                Argentina 🇦🇷
              </span>
            </p>
          </div>

          <div data-hero-item className="flex justify-center lg:justify-end">
            <HeroDemoAnimado />
          </div>
        </div>
      </HeroAnimado>
    </section>
  );
}

function ParaCadaClima() {
  return (
    <section
      aria-labelledby="para-cada-clima"
      className="mx-auto flex max-w-6xl flex-col gap-10"
    >
      <Reveal className="flex max-w-2xl flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--marca-terciario)]">
          Para cada clima, un outfit
        </p>
        <h2
          id="para-cada-clima"
          className="text-3xl font-black tracking-tight sm:text-5xl"
        >
          Sol. Lluvia. Frío.
          <br />
          <span className="text-muted">PILCHA sabe qué sugerir.</span>
        </h2>
        <p className="text-base text-muted sm:text-lg">
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
            className="group flex items-start gap-4 rounded-2xl border border-border bg-background/70 p-5 backdrop-blur hover-elevar hover:border-[var(--marca-terciario)]"
          >
            <span
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--marca-terciario)]/10 text-2xl transition group-hover:scale-110"
            >
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

function ComoSeUsa() {
  return (
    <section
      aria-labelledby="como-se-usa"
      className="mx-auto flex max-w-6xl flex-col gap-12"
    >
      <Reveal className="flex max-w-2xl flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--marca-primario)]">
          Instrucciones
        </p>
        <h2
          id="como-se-usa"
          className="text-3xl font-black tracking-tight sm:text-5xl"
        >
          Así funciona PILCHA
        </h2>
        <p className="text-base text-muted sm:text-lg">
          4 pasos. Lo único raro es acordarte una vez de qué tenés en el
          placard; después PILCHA se encarga.
        </p>
      </Reveal>

      <InstruccionesInteractivas />
    </section>
  );
}

const BENEFICIOS = [
  {
    titulo: "Rota tu placard",
    descripcion:
      "Prioriza las prendas que menos usaste: tu ropa no se duerme en el fondo del cajón.",
    icono: "🔄",
    color: "var(--marca-primario)",
  },
  {
    titulo: "Aprende de vos",
    descripcion:
      "Decís frío, bien o calor; la próxima recomendación corrige cuánto te abrigamos.",
    icono: "🧠",
    color: "var(--marca-terciario)",
  },
  {
    titulo: "Modo viaje",
    descripcion:
      "Ciudad y fechas: te armamos la valija mínima para esos días, sin llevar de más.",
    icono: "🧳",
    color: "var(--marca-secundario)",
  },
  {
    titulo: "Paletas por clima",
    descripcion:
      "Un día de lluvia no pide los mismos colores que una tarde de verano.",
    icono: "🎨",
    color: "var(--marca-primario)",
  },
];

function Beneficios() {
  return (
    <section
      aria-labelledby="beneficios"
      className="mx-auto flex max-w-6xl flex-col gap-10"
    >
      <Reveal className="flex max-w-2xl flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--marca-secundario)]">
          Más que un pronóstico
        </p>
        <h2 id="beneficios" className="text-3xl font-black tracking-tight sm:text-5xl">
          Hecho para que decidas rápido.
        </h2>
      </Reveal>

      <ul className="grid gap-4 sm:grid-cols-2">
        {BENEFICIOS.map((b, i) => (
          <Reveal
            key={b.titulo}
            as="li"
            delay={i * 100}
            className="group flex items-start gap-4 rounded-2xl border border-border bg-background/70 p-6 backdrop-blur hover-elevar"
            style={{ borderColor: undefined }}
          >
            <span
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-full text-2xl transition group-hover:scale-110"
              style={{ backgroundColor: `${b.color}20` }}
            >
              {b.icono}
            </span>
            <div className="flex flex-col gap-1">
              <h3
                className="text-xl font-bold transition group-hover:text-[color:var(--c)]"
                style={{ "--c": b.color }}
              >
                {b.titulo}
              </h3>
              <p className="text-sm text-muted">{b.descripcion}</p>
            </div>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

function Faq() {
  return (
    <section
      aria-labelledby="faq"
      className="mx-auto flex max-w-3xl flex-col gap-10"
    >
      <Reveal className="flex flex-col gap-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--marca-terciario)]">
          Preguntas frecuentes
        </p>
        <h2 id="faq" className="text-3xl font-black tracking-tight sm:text-5xl">
          Lo que nos preguntan
        </h2>
      </Reveal>

      <Reveal>
        <FaqAcordeon />
      </Reveal>
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
        className="pilcha-gradient absolute inset-0 -z-10 opacity-20"
      />
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--marca-primario)]">
        Último paso
      </p>
      <h2 className="text-3xl font-black tracking-tight sm:text-6xl">
        Dejá que el clima elija.
      </h2>
      <p className="max-w-xl text-lg text-muted sm:text-xl">
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
