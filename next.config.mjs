/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dejamos cacheComponents desactivado (el default de create-next-app lo
  // activa). Con el modelo clásico de caché podemos leer la cookie de sesión
  // en el layout privado y cachear el clima con fetch + revalidate, que es
  // más simple de explicar.
  // Las fotos de las prendas viven en Vercel Blob; next/image necesita
  // saber de qué dominio puede optimizarlas.
  // Las Server Actions aceptan 1 MB por defecto y una foto de celular suele
  // pesar más. Subimos el límite a 4.5 MB, que es el máximo que acepta Vercel
  // por pedido (la foto puede pesar hasta 4 MB, ver lib/prendas.js).
  experimental: {
    serverActions: {
      bodySizeLimit: "4.5mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
