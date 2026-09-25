// Fotos reais de mesclagem de argila que o Diego mandou (mesmas do demo,
// ver CLAUDE.md §5 "Turmas ganhou um fundo de fotos reais..."). Extraídas
// do base64 embutido no demo pra arquivo estático de verdade em public/ —
// o Next.js não tem a limitação de artifact que forçou o demo a inline.
// Falta uma foto pra "café" (Quinta 18:30 usa o musgo do primeiro horário
// do dia por enquanto, mesma limitação já documentada no demo). "ocre"
// (2026-09-24, turma nova de Segunda) já tem foto própria, mandada pelo
// Diego especificamente pra essa cor — mesmo tratamento (480px de
// largura, JPEG) das outras.
export type CorFundoArgila = "carvao" | "sienna" | "ardosia" | "musgo" | "ocre";

export const FUNDOS_ARGILA: Record<CorFundoArgila, string> = {
  carvao: "/fundos/carvao.jpg",
  sienna: "/fundos/sienna.jpg",
  ardosia: "/fundos/ardosia.jpg",
  musgo: "/fundos/musgo.jpg",
  ocre: "/fundos/ocre.jpg",
};
