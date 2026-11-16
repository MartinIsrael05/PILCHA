export default function Loading() {
  return (
    <section className="flex flex-col gap-8" aria-busy="true">
      <p className="sr-only">Cargando las paletas…</p>
      <div className="h-10 w-80 max-w-full animate-pulse rounded bg-border" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-2xl bg-border" />
        ))}
      </div>
    </section>
  );
}
