"use server";

// Camada real de dados pra Alunos — leitura + mutações (Server Actions).
// AINDA NÃO LIGADA à tela. Mesmas tabelas de src/lib/actions/turmas.ts
// (profiles/pacotes/matriculas), só que numa visão "todos os alunos,
// todas as turmas" em vez de "roster de uma turma". Diferente do mock
// (vagasPorTurma vs alunosLista, deliberadamente NUNCA unificados —
// CLAUDE.md §5 Alunos, "as duas fontes de dado continuam separadas"),
// aqui as duas telas leem a MESMA fonte real — a limitação do mock era
// só um efeito colateral de serem dois `useState` diferentes, dissolve
// sozinha ao ligar Supabase de verdade (mesma previsão já registrada no
// CLAUDE.md pra Fase 11).

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface AlunoReal {
  id: string; // profiles.id — usado como rota /alunos/[id] no lugar do índice do array
  nome: string;
  tel: string | null;
  turma: string;
  turmaId: string | null;
  matriculaId: string | null;
  pacoteId: string | null;
  aula: number;
  total: number;
  status: "confirmado" | "pendente" | "ultima";
  /** Já ativou a Área do Aluno (auth_user_id preenchido) — ver
   *  src/lib/actions/convite.ts. Só o booleano, não o uuid em si (a UI
   *  não precisa do id de auth, só de saber se já existe conta). */
  temContaAtiva: boolean;
}

async function montarAlunoReal(supabase: ReturnType<typeof createClient>, alunoId: string) {
  const { data: matricula } = await supabase
    .from("matriculas")
    .select("id, pacote_id, turma_id, turmas(nome)")
    .eq("aluno_id", alunoId)
    .eq("status", "confirmado")
    .maybeSingle()
    .overrideTypes<{ id: string; pacote_id: string | null; turma_id: string; turmas: { nome: string } | null } | null, { merge: false }>();

  let aula = 0;
  let total = 4;
  let pacoteStatus: string | null = null;
  if (matricula?.pacote_id) {
    const { data: pacote } = await supabase.from("pacotes").select("aulas_usadas, total_aulas, status").eq("id", matricula.pacote_id).maybeSingle();
    if (pacote) {
      aula = pacote.aulas_usadas;
      total = pacote.total_aulas;
      pacoteStatus = pacote.status;
    }
  }

  let status: AlunoReal["status"] = "confirmado";
  if (matricula) {
    const { count } = await supabase
      .from("pagamentos")
      .select("id", { count: "exact", head: true })
      .eq("aluno_id", alunoId)
      .eq("status", "pendente");
    if ((count ?? 0) > 0) status = "pendente";
    else if (pacoteStatus === "ultima_aula") status = "ultima";
  }

  return { matricula, aula, total, status };
}

export async function getAlunosReal(): Promise<AlunoReal[]> {
  const supabase = createClient();
  const { data: perfis, error } = await supabase.from("profiles").select("id, nome, telefone, auth_user_id").eq("role", "aluno").order("nome", { ascending: true });
  if (error) throw new Error(`Falha ao buscar alunos: ${error.message}`);

  return Promise.all(
    (perfis ?? []).map(async (p): Promise<AlunoReal> => {
      const { matricula, aula, total, status } = await montarAlunoReal(supabase, p.id);
      return {
        id: p.id,
        nome: p.nome,
        tel: p.telefone,
        turma: matricula?.turmas?.nome ?? "Sem turma",
        turmaId: matricula?.turma_id ?? null,
        matriculaId: matricula?.id ?? null,
        pacoteId: matricula?.pacote_id ?? null,
        aula,
        total,
        status,
        temContaAtiva: !!p.auth_user_id,
      };
    })
  );
}

export async function getAlunoReal(id: string): Promise<AlunoReal | null> {
  const supabase = createClient();
  const { data: p, error } = await supabase.from("profiles").select("id, nome, telefone, auth_user_id").eq("id", id).maybeSingle();
  if (error) throw new Error(`Falha ao buscar aluno: ${error.message}`);
  if (!p) return null;

  const { matricula, aula, total, status } = await montarAlunoReal(supabase, p.id);
  return {
    id: p.id,
    nome: p.nome,
    tel: p.telefone,
    turma: matricula?.turmas?.nome ?? "Sem turma",
    turmaId: matricula?.turma_id ?? null,
    matriculaId: matricula?.id ?? null,
    pacoteId: matricula?.pacote_id ?? null,
    aula,
    total,
    status,
    temContaAtiva: !!p.auth_user_id,
  };
}

/** Edita turma/pacote/pagamento num formulário só (CLAUDE.md §5 Alunos,
 *  "evita estados parciais estranhos"). Mudar turma encerra a matrícula
 *  antiga (`status: 'recusado'`, preserva histórico) e cria uma nova —
 *  mesma lógica de `moverAluno` em turmas.ts, reescrita aqui porque o
 *  formulário de Alunos edita tudo de uma vez (turma + pacote + pago),
 *  não só a turma. */
export async function editarAluno(
  alunoId: string,
  dados: { turmaId: string; total: number; aulaAtual: number; pago: boolean; telefone?: string | null }
) {
  const supabase = createClient();

  if (dados.telefone !== undefined) {
    const { error } = await supabase.from("profiles").update({ telefone: dados.telefone }).eq("id", alunoId);
    if (error) throw new Error(`Falha ao atualizar telefone: ${error.message}`);
  }

  const { data: matriculaAtual } = await supabase
    .from("matriculas")
    .select("id, turma_id, pacote_id")
    .eq("aluno_id", alunoId)
    .eq("status", "confirmado")
    .maybeSingle();

  const aulaClamped = Math.max(0, Math.min(dados.aulaAtual, dados.total));
  const statusPacote = aulaClamped === dados.total ? "ultima_aula" : "ativo";

  let pacoteId = matriculaAtual?.pacote_id ?? null;
  if (pacoteId) {
    const { error } = await supabase
      .from("pacotes")
      .update({ total_aulas: dados.total, aulas_usadas: aulaClamped, status: statusPacote, turma_id: dados.turmaId, atualizado_em: new Date().toISOString() })
      .eq("id", pacoteId);
    if (error) throw new Error(`Falha ao atualizar pacote: ${error.message}`);
  } else {
    const { data: novoPacote, error } = await supabase
      .from("pacotes")
      .insert({ aluno_id: alunoId, turma_id: dados.turmaId, total_aulas: dados.total, aulas_usadas: aulaClamped, status: statusPacote })
      .select("id")
      .single();
    if (error) throw new Error(`Falha ao criar pacote: ${error.message}`);
    pacoteId = novoPacote.id;
  }

  if (!matriculaAtual) {
    const { error } = await supabase.from("matriculas").insert({ turma_id: dados.turmaId, aluno_id: alunoId, pacote_id: pacoteId, status: "confirmado" });
    if (error) throw new Error(`Falha ao matricular: ${error.message}`);
  } else if (matriculaAtual.turma_id !== dados.turmaId) {
    const { error: encerrarError } = await supabase.from("matriculas").update({ status: "recusado" }).eq("id", matriculaAtual.id);
    if (encerrarError) throw new Error(`Falha ao encerrar matrícula antiga: ${encerrarError.message}`);
    const { error: novaError } = await supabase.from("matriculas").insert({ turma_id: dados.turmaId, aluno_id: alunoId, pacote_id: pacoteId, status: "confirmado" });
    if (novaError) throw new Error(`Falha ao matricular na turma nova: ${novaError.message}`);
  }

  // "Está em dia ou não" edita o pagamento pendente mais recente — não
  // inventa um 4º valor de `status` do pacote, mesma regra do mock
  // (CLAUDE.md §5 Alunos: "não é um 4º valor de status").
  const { data: pendente } = await supabase
    .from("pagamentos")
    .select("id")
    .eq("aluno_id", alunoId)
    .eq("status", "pendente")
    .order("criado_em", { ascending: false })
    .maybeSingle();
  if (dados.pago && pendente) {
    await supabase.from("pagamentos").update({ status: "pago", pago_em: new Date().toISOString() }).eq("id", pendente.id);
  } else if (!dados.pago && !pendente) {
    await supabase.from("pagamentos").insert({ aluno_id: alunoId, turma_id: dados.turmaId, tipo: "pacote", descricao: `Pacote ${dados.total} aulas`, status: "pendente" });
  }

  revalidatePath("/alunos");
  revalidatePath(`/alunos/${alunoId}`);
  revalidatePath("/turmas");
  revalidatePath("/pagamentos");
}

/** Diferente de "remover da turma" (moverAluno/matricula vira 'recusado')
 *  — exclui a pessoa do cadastro por completo. `on delete cascade` no
 *  schema cuida de pacotes/matrículas/presenças ligadas; pagamentos são
 *  `on delete set null` de propósito (mantém o histórico de cobrança
 *  mesmo se a pessoa for excluída, só perde o vínculo com o nome). */
export async function excluirAluno(alunoId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("profiles").delete().eq("id", alunoId);
  if (error) throw new Error(`Falha ao excluir aluno: ${error.message}`);
  revalidatePath("/alunos");
  revalidatePath("/turmas");
}
