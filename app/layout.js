import Link from "next/link";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import UserMenu from "@/components/auth/UserMenu";
import { BarraNavEscritorio, BarraNavMobile } from "@/components/ui/BarraNav";
import Footer from "@/components/ui/Footer";

// Pisa el tema (claro/oscuro) antes de que React pinte. Así no se ve el
// flash blanco si el usuario guardó "oscuro". Es chico y se inyecta inline.
const BOOT_TEMA = `
try {
  var t = localStorage.getItem('pilcha:tema');
  if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
} catch (e) {}
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  // Base para armar las URLs absolutas de Open Graph (las imágenes al compartir).
  metadataBase: new URL("https://pilcha-ropa.vercel.app"),
  title: {
    default: "PILCHA",
    template: "%s | PILCHA",
  },
  description:
    "Te armamos el outfit del día con la ropa de tu placard según el clima de donde estás.",
};

// Color de la barra del navegador en el celular, según el tema del sistema.
export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: el boot script escribe data-theme antes de
    // que React hidrate. Suprime solo el diff del <html>, no de los hijos.
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        {/* beforeInteractive: corre antes del primer render. Previene el flash. */}
        <Script id="boot-tema" strategy="beforeInteractive">{BOOT_TEMA}</Script>
        <AuthProvider>
          {/* Link oculto que aparece al enfocar con tab: accesibilidad. */}
          <a href="#contenido" className="skip-link">
            Saltar al contenido
          </a>

          {/* Header: logo + perfil/tema/salir. En escritorio, una fila aparte
              debajo con la navegación. En mobile, la nav vive en el pie. */}
          <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-x-4 px-4 py-3">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-black tracking-widest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                PILCHA
              </Link>
              <UserMenu />
            </div>
            <div className="mx-auto max-w-6xl px-2 pb-2">
              <BarraNavEscritorio />
            </div>
          </header>

          <main id="contenido" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">
            {children}
          </main>

          <Footer />

          {/* Barra inferior fija de navegación en mobile. */}
          <BarraNavMobile />
        </AuthProvider>
      </body>
    </html>
  );
}
