import type { DiaSemana } from "@/types/database";
import { normalizarTelefoneE164 } from "@/lib/telefone";

// Espelho dos 2 modelos cadastrados na Meta (nome + corpo). A API só
// manda texto já aprovado lá, então isto NÃO muda o que o aluno recebe —
// serve pra prévia na tela e pra montar os parâmetros na ordem certa.
// Mudar um texto = mudar aqui E criar o modelo de novo na Meta.
export const MODELOS = {
  aula: {
    nome: "lembrete_aula",
    corpo: "Bom dia, {{1}}! ☀️ Hoje tem aula de cerâmica: {{2}}, das {{3}}. Sua vaga está confirmada! Se não puder vir, avisa a Hanna: (14) 99725-7052.",
  },
  oficina: {
    nome: "lembrete_oficina",
    corpo: "Oi, {{1}}! 🏺 Amanhã tem a oficina {{2}}, às {{3}}. Sua inscrição está confirmada! {{4}} Dúvidas: (14) 99725-7052.",
  },
} as const;

export type TipoLembrete = keyof typeof MODELOS;

export function renderizarModelo(tipo: TipoLembrete, parametros: string[]): string {
  return MODELOS[tipo].corpo.replace(/\{\{(\d+)\}\}/g, (_, n: string) => parametros[Number(n) - 1] ?? "");
}

/** A Meta recusa parâmetro vazio, com quebra de linha/tab ou com mais de
 *  4 espaços seguidos — `observacoes` da oficina vem de um textarea. */
export function limparParametro(texto: string | null | undefined, padrao: string): string {
  const limpo = (texto ?? "").replace(/\s+/g, " ").trim();
  return limpo || padrao;
}

export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] || nome;
}

export const DIA_NOME: Record<DiaSemana, string> = {
  seg: "segunda", ter: "terça", qua: "quarta", qui: "quinta", sex: "sexta", sab: "sábado", dom: "domingo",
};

const DIAS_POR_INDICE: DiaSemana[] = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];

/** Hoje (YYYY-MM-DD) no fuso do ateliê — o servidor da Vercel roda em UTC,
 *  e a partir das 21h de Brasília o UTC já virou o dia seguinte. */
export function hojeNoAtelie(agora: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(agora);
}

export function somarDias(dataISO: string, dias: number): string {
  const [a, m, d] = dataISO.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
}

export function diaDaSemana(dataISO: string): DiaSemana {
  const [a, m, d] = dataISO.split("-").map(Number);
  return DIAS_POR_INDICE[new Date(Date.UTC(a, m - 1, d)).getUTCDay()];
}

/** Formato que a API do WhatsApp espera no `to`: só dígitos, com 55.
 *  `null` pra número que não tem cara de celular brasileiro com DDD. */
export function telefoneParaWhatsApp(tel: string | null | undefined): string | null {
  if (!tel) return null;
  const digitos = normalizarTelefoneE164(tel).replace(/\D/g, "");
  return digitos.length === 12 || digitos.length === 13 ? digitos : null;
}
