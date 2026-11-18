"use client"; // Recharts dibuja en el navegador (mide el ancho disponible).

// Calificaciones por rango de temperatura: barras apiladas frío / bien / calor.
// Los colores son un par divergente (azul frío, rojo calor) con gris al medio
// para "bien". Leyenda siempre visible (propia, en HTML, para fijar el orden
// frío, bien, calor) y el número dentro de cada tramo, así la información no
// depende solo del color.
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import TooltipGrafico from "@/components/stats/TooltipGrafico";

const SERIES = [
  // texto: color del número dentro del tramo (el de más contraste).
  {
    clave: "frio",
    nombre: "Tuve frío",
    color: "var(--stats-frio)",
    texto: "#ffffff",
  },
  {
    clave: "bien",
    nombre: "Estuve bien",
    color: "var(--stats-bien)",
    texto: "var(--foreground)",
  },
  {
    clave: "calor",
    nombre: "Tuve calor",
    color: "var(--stats-calor)",
    texto: "#ffffff",
  },
];

export default function GraficoCalificaciones({ datos }) {
  return (
    <div className="flex flex-col gap-3">
      <ul
        className="flex flex-wrap gap-x-4 gap-y-1 text-sm"
        aria-label="Referencias"
      >
        {SERIES.map((serie) => (
          <li key={serie.clave} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-3 rounded-sm"
              style={{ backgroundColor: serie.color }}
            />
            {serie.nombre}
          </li>
        ))}
      </ul>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={datos}
            margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
          >
            <CartesianGrid vertical={false} stroke="var(--stats-grilla)" />
            <XAxis
              dataKey="rango"
              // Mostrar todos los rangos aunque el gráfico sea angosto (celular).
              interval={0}
              tickLine={false}
              axisLine={{ stroke: "var(--stats-grilla)" }}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted)", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "var(--stats-grilla)" }}
              content={<TooltipGrafico />}
            />
            {SERIES.map((serie, i) => (
              <Bar
                key={serie.clave}
                dataKey={serie.clave}
                name={serie.nombre}
                stackId="calificaciones"
                fill={serie.color}
                // Borde del color del fondo: separa los tramos 2 px entre sí.
                stroke="var(--background)"
                strokeWidth={2}
                // Solo el tramo de arriba lleva las puntas redondeadas.
                radius={i === SERIES.length - 1 ? [4, 4, 0, 0] : 0}
                maxBarSize={56}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey={serie.clave}
                  position="center"
                  // Los tramos en 0 no llevan número.
                  formatter={(v) => (v > 0 ? v : "")}
                  fill={serie.texto}
                  fontSize={13}
                  fontWeight={600}
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
