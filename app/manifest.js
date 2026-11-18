// Web App Manifest: permite "agregar a la pantalla de inicio" en el celular
// con el nombre, los colores y el ícono de PILCHA. Next lo sirve en
// /manifest.webmanifest y agrega el <link> solo.
export default function manifest() {
  return {
    name: "PILCHA",
    short_name: "PILCHA",
    description:
      "Te armamos el outfit del día con la ropa de tu placard según el clima de donde estás.",
    lang: "es-AR",
    start_url: "/hoy",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#171717",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
