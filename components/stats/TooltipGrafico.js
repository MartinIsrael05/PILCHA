"use client"; // Lo usa Recharts, que corre en el navegador.

// Tooltip de los gráficos con los colores de PILCHA. El texto va en los
// colores de texto de siempre; el cuadradito de color identifica la serie.
export default function TooltipGrafico({
  active,
  payload,
  label,
  unidad = "",
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 font-semibold">{label}</p>
      <ul className="flex flex-col gap-0.5">
        {payload.map((item) => (
          <li key={item.dataKey} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-2.5 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted">{item.name}:</span>
            <span className="font-medium">
              {item.value}
              {unidad}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
