// Lista de las prendas de un outfit guardado, con un circulito de su color.
// Si alguna se borró del placard después, lo decimos en lugar de romper.
export default function PrendasDelOutfit({ prendaIds, prendasPorId, grande = false }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${grande ? "text-base" : "text-sm"}`}>
      {prendaIds.map((id) => {
        const prenda = prendasPorId.get(id);
        return (
          <li
            key={id}
            className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1"
          >
            <span
              aria-hidden="true"
              className="size-3 shrink-0 rounded-full border border-border bg-background"
              style={{ backgroundColor: prenda?.color.hex ?? "transparent" }}
            />
            {prenda ? prenda.nombre : <span className="text-muted">Prenda eliminada</span>}
          </li>
        );
      })}
    </ul>
  );
}
