"use client"; // Recharts dibuja en el navegador (mide el ancho disponible).

// Barras horizontales de una sola serie (por ejemplo, usos por prenda).
// Una sola serie: un solo color y sin leyenda (el título dice qué es).
// El número va al final de cada barra para no depender del color.
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

const ALTO_FILA = 40;

export default function BarrasHorizontales({
  datos,
  campoNombre,
  campoValor,
  nombreSerie,
  conMuestra = false,
}) {
  return (
    <div style={{ height: datos.length * ALTO_FILA + 16 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={datos}
          layout="vertical"
          margin={{ top: 0, right: 32, bottom: 0, left: 12 }}
        >
          {/* Grilla apenas visible y solo vertical: guía la lectura sin competir */}
          <CartesianGrid horizontal={false} stroke="var(--stats-grilla)" />
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis
            type="category"
            dataKey={campoNombre}
            width={150}
            axisLine={false}
            tickLine={false}
            tick={<Etiqueta datos={datos} conMuestra={conMuestra} />}
          />
          <Tooltip
            cursor={{ fill: "var(--stats-grilla)" }}
            content={<TooltipGrafico />}
          />
          <Bar
            dataKey={campoValor}
            name={nombreSerie}
            fill="var(--stats-serie)"
            radius={[0, 4, 4, 0]}
            barSize={20}
            isAnimationActive={false}
          >
            <LabelList
              dataKey={campoValor}
              position="right"
              fill="var(--foreground)"
              fontSize={14}
              fontWeight={600}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Nombre de cada fila. Con conMuestra suma un cuadradito con el color real
// (en el gráfico de colores: el color ES el dato, no una serie).
function Etiqueta({ x, y, payload, datos, conMuestra }) {
  const fila = datos[payload.index];
  const texto = String(payload.value);
  const corto = texto.length > 20 ? `${texto.slice(0, 19)}…` : texto;
  return (
    <g transform={`translate(${x},${y})`}>
      {conMuestra && fila?.muestra && (
        <rect
          x={-146}
          y={-7}
          width={14}
          height={14}
          rx={3}
          fill={fila.muestra}
        />
      )}
      <text
        x={conMuestra ? -126 : -146}
        y={0}
        dy={5}
        textAnchor="start"
        fill="var(--foreground)"
        fontSize={14}
      >
        <title>{texto}</title>
        {corto}
      </text>
    </g>
  );
}
