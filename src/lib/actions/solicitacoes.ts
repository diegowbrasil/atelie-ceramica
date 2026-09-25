"use server";

// Camada real de dados pra Solicitações — leitura + mutações (Server
// Actions). Usa `solicitacoes_vaga` (tabela nova, ver supabase/schema.sql
// 2026-09-24) — `reposicoes` não serve pra esse fluxo, ver comentário lá.

import { createClient } from "@/lib/supabase/server";
import { cadastrarAluno, matricularAlunoExistente, moverAluno } from "@/lib/actions/turmas";
import { revalidatePath } from "next/cache";

export interface SolicitacaoReal {
  id: string;
  alunoId: string | null;
  nome: string;
  tipo: string;
  quando: string;
  turmaId: string;
}

function formatarQuando(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} às ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export async function getSolicitacoesReal(): Promise<SolicitacaoReal[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("solicitacoes_vaga")
    .select("id, aluno_id, nome, tipo, turma_id, solicitado_em")
    .eq("status", "pendente")
    .order("solicitado_em", { ascending: false });
  if (error) throw new Error(`Falha ao buscar solicitações: ${error.message}`);
  return (data ?? []).map((s) => ({
    id: s.id,
    alunoId: s.aluno_id,
    nome: s.nome,
    tipo: s.tipo,
    quando: formatarQuando(s.solicitado_em),
    turmaId: s.turma_id,
  }));
}

/** Aprova uma solicitação — três casos, na ordem em que fazem diferença:
 *  1. Sem `aluno_id` (solicitação antiga, de antes da Área do Aluno
 *     existir, ou alguém que o admin cadastrou na mão sem conta): não
 *     tem ninguém pra ligar de volta, comportamento original —
 *     `cadastrarAluno` cria um profile novo do zero.
 *  2. Com `aluno_id` mas SEM matrícula fixa ativa hoje (primeira turma
 *     da pessoa): `matricularAlunoExistente` cria pacote+matrícula pro
 *     profile que já existe, sem duplicar o profile — esse era o bug
 *     real (2026-09-25): aprovar SEMPRE criava um profile novo, mesmo
 *     quando a solicitação já vinha de uma conta de aluno de verdade.
 *  3. Com `aluno_id` E matrícula fixa ativa (pediu de dentro da Área do
 *     Aluno, já é aluno de outra turma): `moverAluno` — "Quer trocar
 *     para essa turma" vira transferência FIXA (sai da turma atual);
 *     qualquer outro tipo (hoje só "Quer experimentar essa turma um
 *     dia") vira PROVISÓRIA — mantém a matrícula/pacote original,
 *     só consome uma aula dele e cria uma segunda matrícula, marcada
 *     `provisorio: true`, na turma nova. Pedido explícito do Diego
 *     (2026-09-25): trocar avisa antes que a vaga atual será liberada
 *     (aviso mora em AlunoTurmasClient, antes de chamar isto);
 *     experimentar não mexe na turma fixa. */
export async function aprovarSolicitacao(solicitacaoId: string, alunoId: string | null, nome: string, turmaId: string, totalAulas: number) {
  const supabase = createClient();

  const { data: solicitacao } = await supabase.from("solicitacoes_vaga").select("tipo").eq("id", solicitacaoId).maybeSingle();
  const ehTrocaFixa = solicitacao?.tipo?.startsWith("Quer trocar para essa turma") ?? false;

  if (!alunoId) {
    await cadastrarAluno(turmaId, { nome, total: totalAulas });
  } else {
    const { data: matriculaAtual } = await supabase
      .from("matriculas")
      .select("id, turma_id, pacote_id")
      .eq("aluno_id", alunoId)
      .eq("status", "confirmado")
      .eq("provisorio", false)
      .maybeSingle();

    if (!matriculaAtual) {
      await matricularAlunoExistente(alunoId, turmaId, totalAulas);
    } else if (matriculaAtual.turma_id !== turmaId) {
      await moverAluno(matriculaAtual.id, alunoId, matriculaAtual.pacote_id, matriculaAtual.turma_id, turmaId, ehTrocaFixa ? "fixa" : "provisoria");
    }
    // matriculaAtual.turma_id === turmaId: já está matriculada fixa
    // exatamente nessa turma — nada a fazer além de marcar aprovada.
  }

  const { error } = await supabase
    .from("solicitacoes_vaga")
    .update({ status: "aprovada", resolvido_em: new Date().toISOString() })
    .eq("id", solicitacaoId);
  if (error) throw new Error(`Falha ao marcar solicitação como aprovada: ${error.message}`);

  revalidatePath("/solicitacoes");
  revalidatePath("/dashboard");
  revalidatePath(`/turmas/${turmaId}`);
}

export async function recusarSolicitacao(solicitacaoId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("solicitacoes_vaga")
    .update({ status: "recusada", resolvido_em: new Date().toISOString() })
    .eq("id", solicitacaoId);
  if (error) throw new Error(`Falha ao recusar solicitação: ${error.message}`);
  revalidatePath("/solicitacoes");
  revalidatePath("/dashboard");
}
