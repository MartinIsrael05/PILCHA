// Imagen de Open Graph de cada paleta: la que aparece al compartir el link
// en WhatsApp, Instagram o X. Se genera con los colores reales de la paleta.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getPaletasDeClima } from "@/lib/data/paletas";
import { CLIMAS } from "@/lib/paletas";
import { COLORES, GROSOR_PERCHA, PERCHA } from "@/lib/logo";

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
  // Geist en tres pesos, la misma tipografía de la web (licencia OFL).
  // ImageResponse trae solo Geist Regular, y si le pasamos fuentes propias
  // deja de usarla: por eso van las tres. El logo usa la Black (900).
  const fuentes = await Promise.all(
    [
      ["Geist-Regular.ttf", 400],
      ["Geist-Bold.ttf", 700],
      ["Geist-Black.ttf", 900],
    ].map(async ([archivo, weight]) => ({
      name: "Geist",
      data: await readFile(join(process.cwd(), "assets/fonts", archivo)),
      weight,
      style: "normal",
    }))
  );

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
          {/* Mismo logo que el header: isotipo + palabra en Geist Black. */}
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <svg width={60} height={60} viewBox="0 0 32 32">
              <defs>
                <linearGradient id="og-degrade" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor={COLORES.fondo1} />
                  <stop offset="1" stopColor={COLORES.fondo2} />
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="9" fill="url(#og-degrade)" />
              <path
                d={PERCHA}
                fill="none"
                stroke={COLORES.trazo}
                strokeWidth={GROSOR_PERCHA}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: -1.2 }}>
              PILCHA
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fuentes,
    }
  );
}
