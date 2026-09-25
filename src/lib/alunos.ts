// Cores de identidade por turma, compartilhadas entre AlunosListClient e
// AlunoDetalheClient — mesma paleta de src/lib/turmasDias.ts (corTurma),
// só indexada por NOME da turma (ex: "Terça 18:30") em vez de slug de
// rota, porque é assim que `turma_id`→nome chega em src/lib/actions/alunos.ts.

export type CorIdentidade = "sienna" | "ardosia" | "musgo" | "cafe" | "ocre";
export const TURMA_LABEL_COR: Record<string, CorIdentidade> = {
  "Segunda 09:30": "ocre", "Terça 18:30": "sienna", "Quarta 16:30": "ardosia", "Quinta 14:30": "musgo", "Quinta 18:30": "cafe",
};
export const TURMAS_ORDEM_LABELS = Object.keys(TURMA_LABEL_COR);
