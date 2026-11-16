import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import UserMenu from "@/components/auth/UserMenu";

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
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* AuthProvider es cliente, pero sus children siguen siendo Server Components */}
        <AuthProvider>
          <header className="border-b border-border">
            <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-4">
              <div className="flex items-center gap-6">
                <Link href="/" className="text-xl font-black tracking-widest">
                  PILCHA
                </Link>
                <Link href="/paletas" className="text-sm font-medium hover:underline">
                  Paletas
                </Link>
              </div>
              <UserMenu />
            </nav>
          </header>

          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
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
