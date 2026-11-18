// Vista previa de un viaje: pide el pronóstico, arma la valija y la muestra
// con el botón para guardarla. Va envuelto en <Suspense> en /viajes.
import { planearViaje } from "@/lib/data/viajes";
import ResumenViaje from "@/components/viajes/ResumenViaje";
import GuardarViaje from "@/components/viajes/GuardarViaje";

export default async function PlanDeViaje({ user, ubicacion, desde, hasta }) {
  const plan = await planearViaje(user, ubicacion, desde, hasta);

  if (plan.error) {
    return (
      <p
        role="alert"
        className="rounded-2xl border border-border p-5 text-muted"
      >
        {plan.error}
      </p>
    );
  }

  const prendasPorId = new Map(plan.prendas.map((p) => [p.id, p]));

  return (
    <section
      aria-label="Vista previa del viaje"
      className="flex flex-col gap-6 rounded-2xl border-2 border-foreground p-5 sm:p-6"
    >
      <ResumenViaje viaje={plan} prendasPorId={prendasPorId} />
      <GuardarViaje
        ciudad={plan.ciudad}
        desde={plan.desde}
        hasta={plan.hasta}
      />
    </section>
  );
}
