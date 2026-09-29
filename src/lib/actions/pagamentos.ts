"use server";

// Camada real de dados pra Pagamentos — leitura + mutação (Server
// Actions). AINDA NÃO LIGADA à tela (mesmo estágio dos outros domínios).
// Diferente de Turmas/Forno/Oficinas, `pagamentos` já existia praticamente
// pronto no schema original — não precisou de coluna nova, só o
// `cadastrarAluno` de Turmas passou a criar a cobrança de verdade (ver
// src/lib/actions/turmas.ts), já que antes o mock só DERIVAVA pendentes
// do roster sem nenhum registro de cobrança de fato existir.

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface PagamentoReal {
  id: string;
  nome: string;
  telefone: string | null;
  tipo: string;
  valor: number | null;
  data: string;
  status: "pendente" | "pago";
  motivo: string;
  temComprovante: boolean;
}

function formatarDataCurta(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function getPagamentosReal(): Promise<PagamentoReal[]> {
  const supabase = await createClient();

  const { data: pagamentos, error } = await supabase
    .from("pagamentos")
    .select("id, aluno_id, turma_id, descricao, valor, status, criado_em, comprovante_url, profiles(nome, telefone)")
    .order("criado_em", { ascending: false })
    .overrideTypes<
      Array<{
        id: string;
        aluno_id: string | null;
        turma_id: string | null;
        descricao: string | null;
        valor: number | null;
        status: "pendente" | "pago" | "isento";
        criado_em: string;
        comprovante_url: string | null;
        profiles: { nome: string; telefone: string | null } | null;
      }>,
      { merge: false }
    >();
  if (error) throw new Error(`Falha ao buscar pagamentos: ${error.message}`);

  // Motivo ("Aula X de 4 sem pagamento") depende do pacote atual do aluno
  // nessa turma — busca em lote em vez de 1 query por pagamento.
  const alunoIds = [...new Set((pagamentos ?? []).map((p) => p.aluno_id).filter((id): id is string => !!id))];
  const pacotesPorAluno = new Map<string, { aulas_usadas: number; total_aulas: number }>();
  if (alunoIds.length > 0) {
    const { data: pacotes } = await supabase
      .from("pacotes")
      .select("aluno_id, aulas_usadas, total_aulas")
      .in("aluno_id", alunoIds)
      .neq("status", "encerrado");
    for (const p of pacotes ?? []) pacotesPorAluno.set(p.aluno_id, p);
  }

  return (pagamentos ?? [])
    .filter((p) => p.status !== "isento")
    .map((p) => {
      const pacote = p.aluno_id ? pacotesPorAluno.get(p.aluno_id) : undefined;
      return {
        id: p.id,
        nome: p.profiles?.nome ?? "(removido)",
        telefone: p.profiles?.telefone ?? null,
        tipo: p.descricao ?? "Pagamento",
        valor: p.valor,
        data: formatarDataCurta(p.criado_em),
        status: p.status as "pendente" | "pago",
        motivo: pacote ? `Aula ${pacote.aulas_usadas} de ${pacote.total_aulas} sem pagamento` : "Sem pagamento",
        temComprovante: !!p.comprovante_url,
      };
    });
}

export async function marcarComoPago(pagamentoId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("pagamentos").update({ status: "pago", pago_em: new Date().toISOString() }).eq("id", pagamentoId);
  if (error) throw new Error(`Falha ao marcar como pago: ${error.message}`);
  revalidatePath("/pagamentos");
}

/** Signed URL de 1 minuto pro comprovante — o bucket `comprovantes` é
 *  privado (dado pessoal, ver schema.sql), nunca expomos a URL pública.
 *  A policy de storage.objects já restringe SELECT a admin ou ao próprio
 *  aluno; aqui é sempre o admin lendo. */
export async function getUrlComprovante(pagamentoId: string): Promise<string> {
  const supabase = await createClient();
  const { data: pagamento, error } = await supabase.from("pagamentos").select("comprovante_url").eq("id", pagamentoId).maybeSingle();
  if (error) throw new Error(`Falha ao buscar comprovante: ${error.message}`);
  if (!pagamento?.comprovante_url) throw new Error("Esse pagamento não tem comprovante.");

  const { data, error: signError } = await supabase.storage.from("comprovantes").createSignedUrl(pagamento.comprovante_url, 60);
  if (signError || !data) throw new Error(`Falha ao gerar link do comprovante: ${signError?.message ?? "erro desconhecido"}`);
  return data.signedUrl;
}
