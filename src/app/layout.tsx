import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({ subsets: ["latin"], variable: "--font-bebas", weight: "400" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", weight: ["500", "600", "700"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-plex-mono", weight: "500" });

export const metadata: Metadata = {
  title: "MTCST",
  description: "Gestão de turmas, oficinas e queimas do ateliê de cerâmica.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "MTCST" },
  // SVG estático em vez de gerado (next/og ImageResponse quebra no Windows
  // com espaço no caminho do projeto — ver CLAUDE.md armadilhas). Cobre
  // favicon + apple-touch-icon com o mesmo arquivo de public/icon.svg.
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#C2410C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${bebasNeue.variable} ${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
