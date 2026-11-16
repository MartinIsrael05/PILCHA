export default function Loading() {
  return (
    <section className="flex flex-col gap-6" aria-busy="true">
      <p className="sr-only">Cargando tu perfil…</p>
      <div className="h-9 w-40 animate-pulse rounded bg-border" />
      <div className="flex max-w-xl flex-col gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-border" />
        ))}
      </div>
    </section>
  );
}
