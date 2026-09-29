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

async function montarAlunoReal(supabase: Awaited<ReturnType<typeof createClient>>, alunoId: string) {
  // `provisorio: false` — sem esse filtro, um aluno com uma visita
  // avulsa ativa (moverAluno modo "provisoria", que NUNCA encerra a
  // matrícula fixa, de propósito — é assim que "visitar outra turma um
  // dia" funciona) tem 2 linhas confirmado ao mesmo tempo. `.maybeSingle()`
  // com 2+ linhas devolve `data: null` + um `error` que esta função
  // sempre ignorou silenciosamente — a pessoa passava a aparecer como
  // "sem turma" (Início cai pro estado de "Solicitar vaga") mesmo tendo
  // uma matrícula fixa perfeitamente normal. Achado ao vivo 2026-09-25
  // testando o fluxo fixo/provisório do admin. "Minha turma"/pacote
  // sempre devem refletir a matrícula FIXA, nunca uma visita avulsa.
  const { data: matricula } = await supabase
    .from("matriculas")
    .select("id, pacote_id, turma_id, turmas(nome)")
    .eq("aluno_id", alunoId)
    .eq("status", "confirmado")
    .eq("provisorio", false)
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

/** Versão em lote de montarAlunoReal — usada pela lista inteira (hoje 46
 *  alunos reais). A versão por-aluno faz até 3 queries cada; rodada 46x em
 *  paralelo isso ainda é ~138 queries por carregamento da tela (achado no
 *  pente-fino de performance, 2026-09-25). Batch com `.in(...)` + Maps em
 *  vez de Promise.all(map(montarAlunoReal)) — mesmo padrão já usado em
 *  getPagamentosReal (pagamentos.ts). `getAlunoReal` (1 aluno só, página de
 *  detalhe) continua usando montarAlunoReal — 3 queries pra 1 pessoa nunca
 *  foi o problema. */
export async function getAlunosReal(): Promise<AlunoReal[]> {
  const supabase = await createClient();
  const { data: perfis, error } = await supabase.from("profiles").select("id, nome, telefone, auth_user_id").eq("role", "aluno").order("nome", { ascending: true });
  if (error) throw new Error(`Falha ao buscar alunos: ${error.message}`);
  const alunos = perfis ?? [];
  const alunoIds = alunos.map((p) => p.id);
  if (alunoIds.length === 0) return [];

  // `provisorio: false` — mesmo motivo de montarAlunoReal acima: sem
  // isso, um aluno com uma visita avulsa ativa tem 2 linhas confirmado,
  // e o Map abaixo escolheria uma das duas meio ao acaso (a ordem da
  // query, não necessariamente a fixa) em vez de sempre mostrar a turma
  // de casa da pessoa.
  const { data: matriculas, error: matriculasError } = await supabase
    .from("matriculas")
    .select("aluno_id, id, pacote_id, turma_id, turmas(nome)")
    .in("aluno_id", alunoIds)
    .eq("status", "confirmado")
    .eq("provisorio", false)
    .overrideTypes<Array<{ aluno_id: string; id: string; pacote_id: string | null; turma_id: string; turmas: { nome: string } | null }>, { merge: false }>();
  if (matriculasError) throw new Error(`Falha ao buscar matrículas: ${matriculasError.message}`);
  const matriculaPorAluno = new Map((matriculas ?? []).map((m) => [m.aluno_id, m]));

  const pacoteIds = [...new Set((matriculas ?? []).map((m) => m.pacote_id).filter((id): id is string => !!id))];
  const pacotesPorId = new Map<string, { aulas_usadas: number; total_aulas: number; status: string }>();
  if (pacoteIds.length > 0) {
    const { data: pacotes } = await supabase.from("pacotes").select("id, aulas_usadas, total_aulas, status").in("id", pacoteIds);
    for (const pac of pacotes ?? []) pacotesPorId.set(pac.id, pac);
  }

  const pendentesPorAluno = new Set<string>();
  const { data: pendentes } = await supabase.from("pagamentos").select("aluno_id").in("aluno_id", alunoIds).eq("status", "pendente");
  for (const pg of pendentes ?? []) {
    if (pg.aluno_id) pendentesPorAluno.add(pg.aluno_id);
  }

  return alunos.map((p): AlunoReal => {
    const matricula = matriculaPorAluno.get(p.id) ?? null;
    const pacote = matricula?.pacote_id ? pacotesPorId.get(matricula.pacote_id) : undefined;
    let status: AlunoReal["status"] = "confirmado";
    if (matricula) {
      if (pendentesPorAluno.has(p.id)) status = "pendente";
      else if (pacote?.status === "ultima_aula") status = "ultima";
    }
    return {
      id: p.id,
      nome: p.nome,
      tel: p.telefone,
      turma: matricula?.turmas?.nome ?? "Sem turma",
      turmaId: matricula?.turma_id ?? null,
      matriculaId: matricula?.id ?? null,
      pacoteId: matricula?.pacote_id ?? null,
      aula: pacote?.aulas_usadas ?? 0,
      total: pacote?.total_aulas ?? 4,
      status,
      temContaAtiva: !!p.auth_user_id,
    };
  });
}

export async function getAlunoReal(id: string): Promise<AlunoReal | null> {
  const supabase = await createClient();
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
  const supabase = await createClient();

  if (dados.telefone !== undefined) {
    const { error } = await supabase.from("profiles").update({ telefone: dados.telefone }).eq("id", alunoId);
    if (error) throw new Error(`Falha ao atualizar telefone: ${error.message}`);
  }

  // `provisorio: false` — mesmo motivo de montarAlunoReal: sem isso, um
  // aluno com visita avulsa ativa tem 2 linhas confirmado, `.maybeSingle()`
  // falha silenciosamente (error ignorado) e essa função tratava a
  // pessoa como "sem matrícula", inserindo uma matrícula NOVA em vez de
  // atualizar a fixa existente.
  const { data: matriculaAtual } = await supabase
    .from("matriculas")
    .select("id, turma_id, pacote_id")
    .eq("aluno_id", alunoId)
    .eq("status", "confirmado")
    .eq("provisorio", false)
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
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").delete().eq("id", alunoId);
  if (error) throw new Error(`Falha ao excluir aluno: ${error.message}`);
  revalidatePath("/alunos");
  revalidatePath("/turmas");
}
