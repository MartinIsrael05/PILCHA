import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { listarPrendas } from "@/lib/data/prendas";
import { listarOutfits } from "@/lib/data/outfits";
import {
  calificacionesPorTemperatura,
  distribucionColores,
  masUsadas,
  nuncaUsadas,
} from "@/lib/stats";
import Figura from "@/components/stats/Figura";
import BarrasHorizontales from "@/components/stats/BarrasHorizontales";
import GraficoCalificaciones from "@/components/stats/GraficoCalificaciones";
import PageHeader from "@/components/ui/PageHeader";
import VacioCard from "@/components/ui/VacioCard";

export const metadata = {
  title: "Estadísticas",
};

export default async function StatsPage() {
  const user = await requireUser();
  const [prendas, outfits] = await Promise.all([
    listarPrendas(user.uid),
    listarOutfits(user.uid),
  ]);

  // Todo se calcula en el servidor (lib/stats.js); los gráficos solo dibujan.
  const usadas = masUsadas(prendas);
  const nunca = nuncaUsadas(prendas);
  const colores = distribucionColores(prendas);
  const calificaciones = calificacionesPorTemperatura(outfits);
  const calificados = outfits.filter((o) => o.calificacion).length;

  if (prendas.length === 0) {
    return (
      <section className="flex flex-col gap-8">
        <PageHeader titulo="Estadísticas" />
        <VacioCard
          titulo="Todavía no hay nada para medir"
          descripcion="Cargá tu ropa y empezá a usar PILCHA para ver tus números."
          cta={{ href: "/placard/nueva", texto: "Cargar una prenda" }}
        />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      <PageHeader
        titulo="Estadísticas"
        descripcion="Cómo usás tu placard y cómo te fue con el clima."
      />

      {/* Números sueltos: no hace falta un gráfico para un solo dato */}
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Numero titulo="Prendas en el placard" valor={prendas.length} />
        <Numero titulo="Outfits usados" valor={outfits.length} />
        <Numero
          titulo="Calificados"
          valor={`${calificados} de ${outfits.length}`}
        />
        <Numero titulo="Sin usar todavía" valor={nunca.length} />
      </dl>

      <div className="grid gap-6 lg:grid-cols-2">
        <Figura
          id="usadas"
          titulo="Tus prendas más usadas"
          resumen={
            usadas.length
              ? `${usadas[0].nombre} es la que más usaste (${veces(usadas[0].usos)}).`
              : null
          }
          columnas={["Prenda", "Usos"]}
          filas={usadas.map((p) => [p.nombre, p.usos])}
        >
          {usadas.length ? (
            <BarrasHorizontales
              datos={usadas}
              campoNombre="nombre"
              campoValor="usos"
              nombreSerie="Usos"
            />
          ) : (
            <Vacio>
              Cuando toques “Usé este outfit” en{" "}
              <Link href="/hoy" className="underline">
                Hoy
              </Link>
              , vas a ver acá tus favoritas.
            </Vacio>
          )}
        </Figura>

        <Figura
          id="colores"
          titulo="Colores de tu placard"
          resumen={`Lo que más tenés: ${colores[0].nombre.toLowerCase()} (${colores[0].cantidad} de ${prendas.length}).`}
          columnas={["Familia de color", "Prendas"]}
          filas={colores.map((c) => [c.nombre, c.cantidad])}
        >
          <BarrasHorizontales
            datos={colores}
            campoNombre="nombre"
            campoValor="cantidad"
            nombreSerie="Prendas"
            conMuestra
          />
        </Figura>
      </div>

      <Figura
        id="calificaciones"
        titulo="Cómo te fue según la temperatura"
        resumen="Cuántas veces calificaste frío, bien o calor en cada rango de sensación térmica."
        columnas={["Sensación", "Tuve frío", "Estuve bien", "Tuve calor"]}
        filas={calificaciones.map((f) => [f.rango, f.frio, f.bien, f.calor])}
      >
        {calificaciones.length ? (
          <GraficoCalificaciones datos={calificaciones} />
        ) : (
          <Vacio>
            Calificá tus outfits en el{" "}
            <Link href="/historial" className="underline">
              historial
            </Link>{" "}
            y vas a ver en qué temperaturas te abrigamos de más o de menos.
          </Vacio>
        )}
      </Figura>

      <section
        aria-labelledby="titulo-nunca"
        className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-5"
      >
        <h2 id="titulo-nunca" className="text-lg font-semibold">
          Nunca las usaste
        </h2>
        {nunca.length === 0 ? (
          <p className="text-sm text-muted">
            Usaste todas tus prendas al menos una vez. ¡Bien ahí!
          </p>
        ) : (
          <>
            <p className="text-sm text-muted">
              {nunca.length === 1
                ? "1 prenda espera"
                : `${nunca.length} prendas esperan`}{" "}
              su turno. Quizás alguna ya no la usás.
            </p>
            <ul className="flex flex-wrap gap-2 text-sm">
              {nunca.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/placard/${p.id}`}
                    className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 hover:border-foreground"
                  >
                    <span
                      aria-hidden="true"
                      className="size-3 rounded-full border border-border bg-background"
                      style={{ backgroundColor: p.color.hex }}
                    />
                    {p.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </section>
  );
}

function veces(n) {
  return n === 1 ? "1 vez" : `${n} veces`;
}

function Numero({ titulo, valor }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border bg-background p-4">
      <dt className="text-sm text-muted">{titulo}</dt>
      <dd className="text-3xl font-black tracking-tight">{valor}</dd>
    </div>
  );
}

function Vacio({ children }) {
  return (
    <p className="rounded-xl bg-border/40 p-4 text-sm text-muted">{children}</p>
  );
}
