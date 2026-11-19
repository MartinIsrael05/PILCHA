import CargandoPercha from "@/components/ui/CargandoPercha";

export default function Loading() {
  return (
    <section className="flex flex-col gap-6" aria-busy="true">
      <CargandoPercha texto="Cargando tu historial…" />
      <div className="h-9 w-40 animate-pulse rounded bg-border" />
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-border" />
      ))}
    </section>
  );
}
