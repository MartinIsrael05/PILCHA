// Marco de cada gráfico: título, una frase que lo resume y la misma
// información en una tabla desplegable (para lectores de pantalla o para
// quien prefiera los números).
export default function Figura({
  id,
  titulo,
  resumen,
  columnas,
  filas,
  children,
}) {
  return (
    <figure
      aria-labelledby={`${id}-titulo`}
      className="flex flex-col gap-4 rounded-2xl border border-border p-5"
    >
      <div>
        <h2 id={`${id}-titulo`} className="text-lg font-semibold">
          {titulo}
        </h2>
        {resumen && <p className="text-sm text-muted">{resumen}</p>}
      </div>

      {children}

      {filas?.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-muted hover:text-foreground">
            Ver como tabla
          </summary>
          <table className="mt-2 w-full text-left">
            <thead>
              <tr className="border-b border-border">
                {columnas.map((c) => (
                  <th key={c} scope="col" className="py-1.5 pr-3 font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((fila, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  {fila.map((celda, j) => (
                    <td key={j} className="py-1.5 pr-3">
                      {celda}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </figure>
  );
}
