export default function Loading() {
  return (
    <section className="flex flex-col gap-6" aria-busy="true">
      <p className="sr-only">Cargando tus estadísticas…</p>
      <div className="h-9 w-48 animate-pulse rounded bg-border" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-border" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl bg-border" />
        <div className="h-72 animate-pulse rounded-2xl bg-border" />
      </div>
    </section>
  );
}
