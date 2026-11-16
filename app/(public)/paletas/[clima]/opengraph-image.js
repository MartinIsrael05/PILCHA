// Imagen de Open Graph de cada paleta: la que aparece al compartir el link
// en WhatsApp, Instagram o X. Se genera con los colores reales de la paleta.
import { ImageResponse } from "next/og";
import { getPaletasDeClima } from "@/lib/data/paletas";
import { CLIMAS } from "@/lib/paletas";

export const alt = "Paleta de colores de PILCHA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return Object.keys(CLIMAS).map((clima) => ({ clima }));
}

export default async function Image({ params }) {
  const { clima } = await params;
  const [paleta] = await getPaletasDeClima(clima);
  const colores = paleta?.colores ?? ["#e5e7eb"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0a0a0a",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", flex: 1 }}>
          {colores.map((hex) => (
            <div key={hex} style={{ flex: 1, background: hex }} />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "40px 56px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 28, opacity: 0.7 }}>{`Paleta ${CLIMAS[clima]?.frase ?? ""}`}</div>
            <div style={{ fontSize: 64, fontWeight: 700 }}>{paleta?.nombre ?? "PILCHA"}</div>
          </div>
          <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: 8 }}>PILCHA</div>
        </div>
      </div>
    ),
    size
  );
}
