export default function Loading() {
  return (
    <section className="flex flex-col gap-6" aria-busy="true">
      <p className="sr-only">Cargando el panel…</p>
      <div className="h-9 w-56 animate-pulse rounded bg-border" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-border" />
        ))}
      </div>
    </section>
  );
}
