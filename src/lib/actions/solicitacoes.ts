"use server";

// Camada real de dados pra Solicitações — leitura + mutações (Server
// Actions). AINDA NÃO LIGADA à tela. Usa `solicitacoes_vaga` (tabela
// nova, ver supabase/schema.sql 2026-09-24) — `reposicoes` não serve
// pra esse fluxo, ver comentário lá.

import { createClient } from "@/lib/supabase/server";
import { cadastrarAluno } from "@/lib/actions/turmas";
import { revalidatePath } from "next/cache";

export interface SolicitacaoReal {
  id: string;
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
    .select("id, nome, tipo, turma_id, solicitado_em")
    .eq("status", "pendente")
    .order("solicitado_em", { ascending: false });
  if (error) throw new Error(`Falha ao buscar solicitações: ${error.message}`);
  return (data ?? []).map((s) => ({ id: s.id, nome: s.nome, tipo: s.tipo, quando: formatarQuando(s.solicitado_em), turmaId: s.turma_id }));
}

/** Confirma o pacote e insere a pessoa como vaga ocupada nova na turma —
 *  reaproveita o mesmo fluxo de "Cadastrar aluno" de Turmas (cria conta
 *  muda... não, cria profile+pacote+matrícula+cobrança, ver turmas.ts),
 *  não duplica a lógica. Pedido de vaga nova e reposição são tratados
 *  igual, de propósito (CLAUDE.md §5 Solicitações). */
export async function aprovarSolicitacao(solicitacaoId: string, nome: string, turmaId: string, totalAulas: number) {
  const supabase = createClient();

  await cadastrarAluno(turmaId, { nome, total: totalAulas });

  const { error } = await supabase
    .from("solicitacoes_vaga")
    .update({ status: "aprovada", resolvido_em: new Date().toISOString() })
    .eq("id", solicitacaoId);
  if (error) throw new Error(`Falha ao marcar solicitação como aprovada: ${error.message}`);

  revalidatePath("/solicitacoes");
  revalidatePath("/dashboard");
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
