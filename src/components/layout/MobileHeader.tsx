import { Bell } from "lucide-react";

// Referência de comportamento: demo/AtelieDemo.jsx, <header> (perto de
// TABS_MOBILE). Pílula flutuante de vidro — mesma receita da nav inferior
// (rounded-full + gradiente branco translúcido + backdrop-blur + brilho
// interno + sombra de dois níveis), não uma variação nova. `fixed` (não
// `relative`): flutua sobre o conteúdo que rola por baixo, como a nav
// inferior já faz — por isso o <main> no layout precisa de padding-top
// extra no mobile pra compensar (ver AdminLayout).
//
// O texto "MTCST" passou por 5 rodadas até este estado (histórico completo
// em CLAUDE.md §6): imagem com bug de alpha → texto simples cinza (ficou
// "cinza" em vez de "preto com efeito de vidro" — alpha sobre fundo claro
// sempre clareia) → gradiente escuro opaco com `background-clip: text` +
// `drop-shadow` sutil de borda (não `text-shadow`/`-webkit-text-stroke`,
// que "sujavam" o preto por dentro ou criavam um halo lavando o texto).
export function MobileHeader() {
  return (
    <header className="fixed inset-x-3 top-3 z-20 grid grid-cols-[1fr_auto_1fr] items-center rounded-full border border-white/70 bg-gradient-to-b from-white/80 to-white/50 px-4 py-5 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.85),0_10px_28px_-6px_rgba(59,56,51,0.25)] backdrop-blur-2xl backdrop-saturate-150 md:hidden">
      <span />
      <span
        className="justify-self-center font-display text-3xl font-bold uppercase leading-none tracking-wide"
        style={{
          backgroundImage: "linear-gradient(180deg, #0c0c0b, #000)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          filter: "drop-shadow(0 0 0.6px rgba(255,255,255,0.85)) drop-shadow(0 0.5px 0.5px rgba(255,255,255,0.5))",
        }}
      >
        MTCST
      </span>
      <Bell size={20} className="justify-self-end text-ink-soft" />
    </header>
  );
}
