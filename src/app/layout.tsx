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
  // com espaço no caminho do projeto — ver CLAUDE.md armadilhas). Favicon
  // continua SVG (todo navegador moderno aceita). `apple` precisa ser PNG
  // de verdade — o Safari do iOS ignora silenciosamente um SVG em
  // apple-touch-icon (achado 2026-09-25, testando o PWA em produção pela
  // primeira vez) — `public/icon-180.png`, gerado a partir do mesmo SVG
  // (180×180, tamanho recomendado pela Apple).
  icons: {
    icon: "/icon.svg",
    apple: "/icon-180.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#C2410C",
  width: "device-width",
  initialScale: 1,
  // `viewport-fit=cover` — sem isso, `env(safe-area-inset-*)` sempre
  // resolve pra 0 e o conteúdo ignora a área da notch/status bar do
  // iOS. Achado 2026-09-25: instalado como PWA de verdade (Safari, não
  // Chrome-shortcut) em tela cheia, o título "TURMAS" da Área do Aluno
  // ficava atrás da barra de status (hora/bateria) — só aparece assim
  // no modo standalone real, nunca dentro de uma aba de navegador
  // comum (onde a barra do próprio Safari/Chrome já ocupa esse
  // espaço). Ver padding em `(aluno)/layout.tsx`.
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${bebasNeue.variable} ${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
