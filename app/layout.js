import Link from "next/link";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import UserMenu from "@/components/auth/UserMenu";

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

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: el boot script (líneas abajo) escribe
    // data-theme antes de que React hidrate. React ve ese atributo en el DOM
    // pero no en su HTML server (que no conoce el localStorage del usuario),
    // y marca el diff. Solo afecta este atributo del <html>, no a los hijos.
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        {/* beforeInteractive: corre antes del primer render. Previene el flash. */}
        <Script id="boot-tema" strategy="beforeInteractive">{BOOT_TEMA}</Script>
        {/* AuthProvider es cliente, pero sus children siguen siendo Server Components */}
        <AuthProvider>
          {/* Link oculto que aparece al enfocar con tab: accesibilidad. */}
          <a href="#contenido" className="skip-link">
            Saltar al contenido
          </a>
          <header className="relative border-b border-border">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-x-4 px-4 py-4">
              <Link href="/" className="text-xl font-black tracking-widest">
                PILCHA
              </Link>
              <UserMenu />
            </div>
          </header>

          <main id="contenido" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
            {children}
          </main>

          <footer className="border-t border-border">
            <p className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted">
              PILCHA · TP Final de Programación Multimedial III · UMAI
            </p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
