// As 4 turmas fixas do ateliê (CLAUDE.md §5 Turmas) — mapeia o slug de
// rota (`/turmas/ter-1830`) pro dia/horário de exibição. Extraído de
// dentro de turmas/[turmaId]/page.tsx quando esse virou Server Component
// (precisa do mesmo dado tanto no server, pra traduzir slug→UUID via
// getTurmaPorSlug, quanto no client, pros tabs de dia/horário).

export type DiaId = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";

export interface TurmaInfo {
  id: string;
  dia: string;
  hora: string;
}

export interface DiaInfo {
  id: DiaId;
  label: string;
  disponivel: boolean;
  turmas: TurmaInfo[];
}

export const TURMAS_DIAS: DiaInfo[] = [
  { id: "seg", label: "Seg", disponivel: true, turmas: [{ id: "seg-0930", dia: "Segunda-feira", hora: "09:30 às 11:30" }] },
  { id: "ter", label: "Ter", disponivel: true, turmas: [{ id: "ter-1830", dia: "Terça-feira", hora: "18:30 às 20:30" }] },
  { id: "qua", label: "Qua", disponivel: true, turmas: [{ id: "qua-1630", dia: "Quarta-feira", hora: "16:30 às 18:30" }] },
  {
    id: "qui", label: "Qui", disponivel: true,
    turmas: [
      { id: "qui-1430", dia: "Quinta-feira", hora: "14:30 às 16:30" },
      { id: "qui-1830", dia: "Quinta-feira", hora: "18:30 às 20:30" },
    ],
  },
  { id: "sex", label: "Sex", disponivel: false, turmas: [] },
  { id: "sab", label: "Sáb", disponivel: false, turmas: [] },
  { id: "dom", label: "Dom", disponivel: false, turmas: [] },
];

export type CorIdentidade = "sienna" | "ardosia" | "musgo" | "cafe" | "ocre";
export const TURMA_COR: Record<string, CorIdentidade> = {
  "seg-0930": "ocre", "ter-1830": "sienna", "qua-1630": "ardosia", "qui-1430": "musgo", "qui-1830": "cafe",
};
export function corTurma(turmaId: string): CorIdentidade {
  return TURMA_COR[turmaId] ?? "sienna";
}
