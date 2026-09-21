// Dado compartilhado entre /alunos (lista) e /alunos/[index] (detalhe).
// TODO(conectar dados reais): substituir por `supabase.from("profiles").select("*, pacotes(*)").eq("role", "aluno")`.
// Roster real dos 44 alunos das 4 turmas fixas (dado real do Diego,
// 2026-09-17) — mesmos nomes/números do demo, não inventado. "tel: null"
// em todo mundo — telefone não foi informado nesta leva, não inventado.

export type StatusPacote = "confirmado" | "pendente" | "ultima";

export interface AlunoReal {
  nome: string;
  tel: string | null;
  turma: string;
  aula: number;
  total: number;
  status: StatusPacote;
}

export type CorIdentidade = "sienna" | "ardosia" | "musgo" | "cafe";
export const TURMA_LABEL_COR: Record<string, CorIdentidade> = {
  "Terça 18:30": "sienna", "Quarta 16:30": "ardosia", "Quinta 14:30": "musgo", "Quinta 18:30": "cafe",
};
export const TURMAS_ORDEM_LABELS = Object.keys(TURMA_LABEL_COR);

export function alunosIniciais(): AlunoReal[] {
  return [
    { nome: "Isadora", tel: null, turma: "Terça 18:30", aula: 3, total: 4, status: "confirmado" },
    { nome: "Cristiane", tel: null, turma: "Terça 18:30", aula: 1, total: 4, status: "confirmado" },
    { nome: "Maria Clara", tel: null, turma: "Terça 18:30", aula: 3, total: 4, status: "confirmado" },
    { nome: "Cintya", tel: null, turma: "Terça 18:30", aula: 2, total: 4, status: "pendente" },
    { nome: "Moises", tel: null, turma: "Terça 18:30", aula: 1, total: 4, status: "pendente" },
    { nome: "Fabiola", tel: null, turma: "Terça 18:30", aula: 4, total: 4, status: "ultima" },
    { nome: "Maria Helena", tel: null, turma: "Terça 18:30", aula: 2, total: 4, status: "confirmado" },
    { nome: "Mayara", tel: null, turma: "Terça 18:30", aula: 4, total: 4, status: "ultima" },
    { nome: "Karol", tel: null, turma: "Terça 18:30", aula: 4, total: 4, status: "ultima" },
    { nome: "Ananda", tel: null, turma: "Terça 18:30", aula: 4, total: 4, status: "ultima" },
    { nome: "Marina", tel: null, turma: "Terça 18:30", aula: 2, total: 4, status: "confirmado" },
    { nome: "Dani", tel: null, turma: "Terça 18:30", aula: 3, total: 4, status: "confirmado" },
    { nome: "Vivian", tel: null, turma: "Terça 18:30", aula: 1, total: 4, status: "pendente" },
    { nome: "Cris", tel: null, turma: "Terça 18:30", aula: 3, total: 4, status: "pendente" },
    { nome: "Ju Pita", tel: null, turma: "Quarta 16:30", aula: 4, total: 4, status: "ultima" },
    { nome: "Natalia", tel: null, turma: "Quarta 16:30", aula: 2, total: 4, status: "confirmado" },
    { nome: "Paula", tel: null, turma: "Quarta 16:30", aula: 3, total: 4, status: "confirmado" },
    { nome: "Bianca", tel: null, turma: "Quarta 16:30", aula: 4, total: 4, status: "ultima" },
    { nome: "Amanda", tel: null, turma: "Quarta 16:30", aula: 4, total: 4, status: "pendente" },
    { nome: "Silvia", tel: null, turma: "Quarta 16:30", aula: 1, total: 4, status: "pendente" },
    { nome: "Ana Carolina", tel: null, turma: "Quarta 16:30", aula: 4, total: 4, status: "ultima" },
    { nome: "Fer", tel: null, turma: "Quarta 16:30", aula: 3, total: 4, status: "confirmado" },
    { nome: "Santina", tel: null, turma: "Quarta 16:30", aula: 4, total: 4, status: "ultima" },
    { nome: "Camila (aula de quarta)", tel: null, turma: "Quarta 16:30", aula: 4, total: 4, status: "pendente" },
    { nome: "Elisabeth", tel: null, turma: "Quarta 16:30", aula: 4, total: 4, status: "ultima" },
    { nome: "Bia", tel: null, turma: "Quinta 14:30", aula: 1, total: 4, status: "confirmado" },
    { nome: "Isa", tel: null, turma: "Quinta 14:30", aula: 3, total: 4, status: "pendente" },
    { nome: "Roxanne", tel: null, turma: "Quinta 14:30", aula: 3, total: 4, status: "confirmado" },
    { nome: "Piti", tel: null, turma: "Quinta 14:30", aula: 3, total: 4, status: "confirmado" },
    { nome: "Celina", tel: null, turma: "Quinta 14:30", aula: 1, total: 4, status: "confirmado" },
    { nome: "Helo", tel: null, turma: "Quinta 14:30", aula: 2, total: 4, status: "confirmado" },
    { nome: "Isabele", tel: null, turma: "Quinta 14:30", aula: 1, total: 4, status: "pendente" },
    { nome: "Luciane", tel: null, turma: "Quinta 14:30", aula: 1, total: 4, status: "pendente" },
    { nome: "Vitoria", tel: null, turma: "Quinta 14:30", aula: 2, total: 4, status: "confirmado" },
    { nome: "Ana Lara", tel: null, turma: "Quinta 14:30", aula: 1, total: 4, status: "confirmado" },
    { nome: "Lu", tel: null, turma: "Quinta 18:30", aula: 4, total: 4, status: "ultima" },
    { nome: "Nayane", tel: null, turma: "Quinta 18:30", aula: 2, total: 4, status: "confirmado" },
    { nome: "Yasmin", tel: null, turma: "Quinta 18:30", aula: 1, total: 4, status: "pendente" },
    { nome: "Vivi", tel: null, turma: "Quinta 18:30", aula: 4, total: 4, status: "ultima" },
    { nome: "Barbara", tel: null, turma: "Quinta 18:30", aula: 3, total: 4, status: "pendente" },
    { nome: "Tais", tel: null, turma: "Quinta 18:30", aula: 2, total: 4, status: "pendente" },
    { nome: "Camila (aula de quinta)", tel: null, turma: "Quinta 18:30", aula: 2, total: 4, status: "confirmado" },
    { nome: "Ju Oba", tel: null, turma: "Quinta 18:30", aula: 1, total: 1, status: "confirmado" },
    { nome: "Amanda R", tel: null, turma: "Quinta 18:30", aula: 3, total: 4, status: "confirmado" },
    { nome: "Paola", tel: null, turma: "Quinta 18:30", aula: 1, total: 4, status: "pendente" },
    { nome: "Olga", tel: null, turma: "Quinta 18:30", aula: 1, total: 1, status: "confirmado" },
  ];
}
