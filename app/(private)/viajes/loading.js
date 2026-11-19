import CargandoPercha from "@/components/ui/CargandoPercha";

export default function Loading() {
  return (
    <section className="flex flex-col gap-6" aria-busy="true">
      <CargandoPercha texto="Cargando tus viajes…" />
      <div className="h-9 w-48 animate-pulse rounded bg-border" />
      <div className="h-64 animate-pulse rounded-2xl bg-border" />
      <div className="h-24 animate-pulse rounded-2xl bg-border" />
    </section>
  );
}
