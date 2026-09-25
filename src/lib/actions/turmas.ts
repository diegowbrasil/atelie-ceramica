"use server";

// Camada real de dados pra Turmas — leitura (chamável de Server Components)
// e mutações (Server Actions, "use server"). LIGADA à tela desde
// 2026-09-24 (turmas/[turmaId]/page.tsx virou Server Component, a
// interatividade mora em src/components/turmas/TurmaDetalheClient.tsx).
// Formato de saída igual ao tipo `Vaga` do mock (+ ids reais, ver
// `VagaReal`), pra reaproveitar a UI que já existia.
//
// Mapeamento schema → UI (decisões tomadas ao escrever isto, sem poder
// perguntar ao Diego — são detalhes de implementação, não de produto):
// - `Vaga.numero` não existe no schema (matriculas não tem número de vaga
//   fixo) — computado aqui: ordem de `solicitado_em`, 1..N, preenchendo
//   vagas vazias até `capacidade` (ou até N se passar da capacidade, caso
//   real da Terça com 14 — CLAUDE.md §5 "nao precisa travar em 12").
// - `Vaga.status`: se pacote.status === 'ultima_aula' → "ultima"; senão,
//   se existir pagamento pendente do aluno pra essa turma → "pendente";
//   senão "confirmado". Mesma prioridade do demo (pendente vence "ultima"
//   mesmo com aula === total, CLAUDE.md §5 "Amanda 4 na Quarta").
// - `Vaga.statusAula`/`presente`: da linha de `presencas` da aula desta
//   semana (turma_id + data calculada, mesmo dia-da-semana de `turmas.dia`).
//   Sem presença marcada ainda essa semana → default "confirmado"/false,
//   igual ao comportamento atual do mock.

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { StatusPacote, StatusAula, Vaga } from "@/lib/vagasPorTurma";
import type { DiaSemana } from "@/types/database";

const ORDEM_DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"] as const;

/** Data (YYYY-MM-DD) do dia-da-semana `diaId` na semana atual — mesmo
 *  cálculo de `datasDaSemanaAtual()` no client, reescrito aqui porque
 *  Server Actions não podem importar de arquivos "use client". */
function dataDestaSemana(diaId: string): string {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = ORDEM_DIAS.indexOf(diaId as (typeof ORDEM_DIAS)[number]);
  const offset = alvo - hoje.getDay();
  const data = new Date(hoje);
  data.setDate(hoje.getDate() + offset);
  return data.toISOString().slice(0, 10);
}

/** As 4 URLs da UI (`/turmas/ter-1830` etc.) são slugs fixos, mas
 *  `turmas.id` no banco é um UUID gerado — precisa de uma tradução.
 *  Formato do slug: `{dia}-{HHMM}` (ex: "qui-1830" → dia=qui,
 *  hora_inicio="18:30"). Turma real, não uma tabela de rotas — só 4
 *  linhas, comparar direto é suficiente. */
export async function getTurmaPorSlug(slug: string): Promise<{ id: string; capacidade: number; dia: string; horaInicio: string } | null> {
  const supabase = createClient();
  const m = slug.match(/^([a-z]+)-(\d{2})(\d{2})$/);
  if (!m) return null;
  const [, dia, hh, mm] = m;
  const { data, error } = await supabase
    .from("turmas")
    .select("id, capacidade, dia, hora_inicio")
    .eq("dia", dia as DiaSemana)
    .eq("hora_inicio", `${hh}:${mm}:00`)
    .maybeSingle();
  if (error) throw new Error(`Falha ao buscar turma: ${error.message}`);
  return data ? { id: data.id, capacidade: data.capacidade, dia: data.dia, horaInicio: data.hora_inicio } : null;
}

/** As 4 turmas com nome+id, na ordem de exibição (dia, depois horário) —
 *  pros selects de turma em Alunos (cadastrar/editar), que trabalham com
 *  o `turma_id` de verdade em vez do slug de rota (`turmas.nome` já bate
 *  exatamente com os labels que a tela de Alunos sempre usou, ex: "Terça
 *  18:30" — confirmado direto no banco, não é suposição). */
export async function listarTurmas(): Promise<{ id: string; nome: string }[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("turmas").select("id, nome").order("dia").order("hora_inicio");
  if (error) throw new Error(`Falha ao listar turmas: ${error.message}`);
  return data ?? [];
}

interface MatriculaComJoins {
  id: string;
  aluno_id: string;
  solicitado_em: string;
  profiles: { nome: string; telefone: string | null } | null;
  pacotes: { id: string; aulas_usadas: number; total_aulas: number; status: string } | null;
}

// `Vaga` (mock) é identificada só por `numero` — suficiente quando tudo
// vive em memória. A versão real precisa dos ids de verdade pra saber EM
// QUAL linha mexer (toggleStatusAula/marcarPresenca pedem alunoId,
// moverAluno pede matriculaId+pacoteId também) — por isso `VagaReal`
// estende `Vaga` com esses 3 campos opcionais (`undefined` numa vaga
// vazia, sempre presentes numa ocupada).
export interface VagaReal extends Vaga {
  alunoId?: string;
  matriculaId?: string;
  pacoteId?: string;
}

/** Lê o roster real de uma turma. Chamável direto de um Server Component
 *  (`await getRosterTurma(turmaId)`). */
export async function getRosterTurma(turmaId: string, diaId: string, capacidade: number): Promise<VagaReal[]> {
  const supabase = createClient();

  const { data: matriculas, error } = await supabase
    .from("matriculas")
    .select("id, aluno_id, solicitado_em, profiles(nome, telefone), pacotes(id, aulas_usadas, total_aulas, status)")
    .eq("turma_id", turmaId)
    .eq("status", "confirmado")
    .order("solicitado_em", { ascending: true })
    .overrideTypes<MatriculaComJoins[], { merge: false }>();
  if (error) throw new Error(`Falha ao buscar roster da turma ${turmaId}: ${error.message}`);

  const alunoIds = (matriculas ?? []).map((m) => m.aluno_id);

  // Presença desta semana (se a aula ainda não foi criada, ninguém tem
  // presença marcada — todo mundo fica no default "confirmado").
  const dataAula = dataDestaSemana(diaId);
  const { data: aula } = await supabase.from("aulas").select("id").eq("turma_id", turmaId).eq("data", dataAula).maybeSingle();
  const presencaPorAluno = new Map<string, { status: string; presente: boolean }>();
  if (aula && alunoIds.length > 0) {
    const { data: presencas } = await supabase.from("presencas").select("aluno_id, status").eq("aula_id", aula.id).in("aluno_id", alunoIds);
    for (const p of presencas ?? []) {
      presencaPorAluno.set(p.aluno_id, { status: p.status, presente: p.status === "presente" });
    }
  }

  // Pagamento pendente por aluno nesta turma (qualquer um, não só o mais
  // recente — se existir algum pendente, o aluno conta como "pendente").
  const pendentesPorAluno = new Set<string>();
  if (alunoIds.length > 0) {
    const { data: pagamentosPendentes } = await supabase
      .from("pagamentos")
      .select("aluno_id")
      .eq("turma_id", turmaId)
      .eq("status", "pendente")
      .in("aluno_id", alunoIds);
    for (const p of pagamentosPendentes ?? []) {
      if (p.aluno_id) pendentesPorAluno.add(p.aluno_id);
    }
  }

  const ocupadas: VagaReal[] = (matriculas ?? []).map((m, i) => {
    const pacote = m.pacotes;
    const presenca = presencaPorAluno.get(m.aluno_id);
    const statusAula: StatusAula = presenca?.status === "falta" ? "ausente" : "confirmado";
    let status: StatusPacote = "confirmado";
    if (pendentesPorAluno.has(m.aluno_id)) status = "pendente";
    else if (pacote?.status === "ultima_aula") status = "ultima";
    return {
      numero: i + 1,
      nome: m.profiles?.nome ?? null,
      aula: pacote?.aulas_usadas ?? 0,
      total: pacote?.total_aulas ?? 4,
      status,
      statusAula,
      presente: presenca?.presente ?? false,
      alunoId: m.aluno_id,
      matriculaId: m.id,
      pacoteId: pacote?.id,
    };
  });

  // Vagas vazias até a capacidade (nunca corta ocupadas que passem dela —
  // ver "nao precisa travar em 12", CLAUDE.md §5).
  const vazias: VagaReal[] = [];
  for (let n = ocupadas.length + 1; n <= capacidade; n++) {
    vazias.push({ numero: n, nome: null, aula: 0, total: 4, status: "confirmado", statusAula: "confirmado", presente: false });
  }

  return [...ocupadas, ...vazias];
}

/** Pacote + matrícula confirmada + cobrança pra um `aluno_id` que JÁ
 *  existe (profile já criado em algum outro lugar) — extraído de
 *  `cadastrarAluno` (2026-09-25) pra ser reaproveitado por
 *  `aprovarSolicitacao` (solicitacoes.ts), que precisa matricular gente
 *  que já tem profile/conta própria sem duplicar o profile dela (era
 *  exatamente esse o bug: aprovar sempre criava um profile NOVO, mesmo
 *  quando a solicitação já vinha com `aluno_id` de uma conta real). */
export async function matricularAlunoExistente(alunoId: string, turmaId: string, total: number) {
  const supabase = createClient();

  const { data: pacote, error: pacoteError } = await supabase
    .from("pacotes")
    .insert({ aluno_id: alunoId, turma_id: turmaId, total_aulas: total, aulas_usadas: 0, status: "ativo" })
    .select("id")
    .single();
  if (pacoteError) throw new Error(`Falha ao criar pacote: ${pacoteError.message}`);

  const { error: matriculaError } = await supabase
    .from("matriculas")
    .insert({ turma_id: turmaId, aluno_id: alunoId, pacote_id: pacote.id, status: "confirmado", provisorio: false });
  if (matriculaError) throw new Error(`Falha ao matricular aluno: ${matriculaError.message}`);

  // Cobrança do pacote novo, pendente até o admin marcar como pago em
  // Pagamentos (ver src/lib/actions/pagamentos.ts) — sem isso, o aluno
  // nunca apareceria lá até alguém criar o registro na mão.
  const { error: pagamentoError } = await supabase.from("pagamentos").insert({
    aluno_id: alunoId,
    turma_id: turmaId,
    tipo: "pacote",
    descricao: `Pacote ${total} aulas`,
    valor: null,
    status: "pendente",
  });
  if (pagamentoError) throw new Error(`Falha ao criar cobrança: ${pagamentoError.message}`);
}

/** Cadastra um aluno novo numa vaga vazia: profile, depois pacote +
 *  matrícula + cobrança (`matricularAlunoExistente`, acima). Aluno
 *  cadastrado pelo admin não ganha conta de login nenhuma — `profiles`
 *  não exige mais isso (schema.sql, decisão 2026-09-23 revertendo a
 *  versão anterior que criava uma conta "muda" só pra satisfazer uma FK
 *  que não precisava mais existir). Não recebe `numero` (não existe no
 *  schema, ver comentário no topo do arquivo) — só entra na próxima
 *  posição. */
export async function cadastrarAluno(turmaId: string, dados: { nome: string; total: number; telefone?: string | null }) {
  const supabase = createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert({ role: "aluno", nome: dados.nome, telefone: dados.telefone ?? null })
    .select("id")
    .single();
  if (profileError) throw new Error(`Falha ao criar profile: ${profileError.message}`);

  await matricularAlunoExistente(profile.id, turmaId, dados.total);

  revalidatePath(`/turmas/${turmaId}`);
  revalidatePath("/pagamentos");
}

/** Alterna presente/ausente pra ESTA semana — cria a `aula` do dia se
 *  ainda não existir (lazy, primeira marcação da semana pra essa turma) e
 *  faz upsert da `presenca`. Reversível (clicar de novo desfaz), mesma
 *  regra do mock — não é um log append-only aqui ainda, é um upsert por
 *  (aula_id, aluno_id), então "desfazer" é só marcar como pendente nesta
 *  mesma linha, não apaga histórico de semanas anteriores (essas já são
 *  outras linhas de `aulas`, com outra `data`). */
export async function toggleStatusAula(turmaId: string, diaId: string, alunoId: string) {
  const supabase = createClient();
  const dataAula = dataDestaSemana(diaId);

  const { data: aula, error: aulaError } = await supabase
    .from("aulas")
    .upsert({ turma_id: turmaId, data: dataAula }, { onConflict: "turma_id,data" })
    .select("id")
    .single();
  if (aulaError) throw new Error(`Falha ao preparar a aula do dia: ${aulaError.message}`);

  const { data: atual } = await supabase.from("presencas").select("status").eq("aula_id", aula.id).eq("aluno_id", alunoId).maybeSingle();
  const novoStatus = atual?.status === "falta" ? "pendente" : "falta";

  const { error } = await supabase
    .from("presencas")
    .upsert({ aula_id: aula.id, aluno_id: alunoId, status: novoStatus }, { onConflict: "aula_id,aluno_id" });
  if (error) throw new Error(`Falha ao atualizar presença: ${error.message}`);

  revalidatePath(`/turmas/${turmaId}`);
}

/** Marca presença de verdade (fecha o anel do pacote) — reversível:
 *  clicar de novo desfaz e decrementa o pacote (pedido explícito do
 *  Diego, CLAUDE.md §5, "não remover essa reversibilidade"). */
export async function marcarPresenca(turmaId: string, diaId: string, alunoId: string, pacoteId: string) {
  const supabase = createClient();
  const dataAula = dataDestaSemana(diaId);

  const { data: aula, error: aulaError } = await supabase
    .from("aulas")
    .upsert({ turma_id: turmaId, data: dataAula }, { onConflict: "turma_id,data" })
    .select("id")
    .single();
  if (aulaError) throw new Error(`Falha ao preparar a aula do dia: ${aulaError.message}`);

  const { data: presencaAtual } = await supabase.from("presencas").select("status").eq("aula_id", aula.id).eq("aluno_id", alunoId).maybeSingle();
  const jaPresente = presencaAtual?.status === "presente";

  const { data: pacote, error: pacoteError } = await supabase
    .from("pacotes")
    .select("aulas_usadas, total_aulas")
    .eq("id", pacoteId)
    .single();
  if (pacoteError) throw new Error(`Falha ao ler pacote: ${pacoteError.message}`);

  const novaContagem = jaPresente ? Math.max(pacote.aulas_usadas - 1, 0) : Math.min(pacote.aulas_usadas + 1, pacote.total_aulas);
  const novoStatusPacote = novaContagem === pacote.total_aulas ? "ultima_aula" : "ativo";

  const { error: updatePacoteError } = await supabase
    .from("pacotes")
    .update({ aulas_usadas: novaContagem, status: novoStatusPacote, atualizado_em: new Date().toISOString() })
    .eq("id", pacoteId);
  if (updatePacoteError) throw new Error(`Falha ao atualizar pacote: ${updatePacoteError.message}`);

  const { error: presencaError } = await supabase
    .from("presencas")
    .upsert({ aula_id: aula.id, aluno_id: alunoId, status: jaPresente ? "pendente" : "presente" }, { onConflict: "aula_id,aluno_id" });
  if (presencaError) throw new Error(`Falha ao marcar presença: ${presencaError.message}`);

  revalidatePath(`/turmas/${turmaId}`);
}

/** Move um aluno pra outra turma. Dois modos, escolhidos por `tipo`:
 *  - `"fixa"` (padrão, comportamento original): encerra a matrícula
 *    antiga (não apaga — vira `status: 'recusado'`, preserva histórico)
 *    e cria uma nova. O pacote em si (progresso de aulas) migra junto,
 *    só troca de turma.
 *  - `"provisoria"` (2026-09-25, ligado por `aprovarSolicitacao` — o
 *    campo já existia no schema desde sempre, mas nada no Next.js
 *    escrevia nele até agora, ver PROGRESS.md): a matrícula antiga NÃO
 *    é encerrada, o pacote NÃO migra (continua pertencendo à turma de
 *    origem) — só consome uma aula dele (mesmo cálculo de
 *    `marcarPresenca`) e cria uma matrícula NOVA, `provisorio: true`, na
 *    turma de destino. O aluno fica matriculado nas duas ao mesmo tempo
 *    de propósito. */
export async function moverAluno(
  matriculaId: string,
  alunoId: string,
  pacoteId: string | null,
  turmaOrigemId: string,
  turmaDestinoId: string,
  tipo: "fixa" | "provisoria" = "fixa"
) {
  const supabase = createClient();

  if (tipo === "fixa") {
    const { error: encerrarError } = await supabase.from("matriculas").update({ status: "recusado" }).eq("id", matriculaId);
    if (encerrarError) throw new Error(`Falha ao encerrar matrícula antiga: ${encerrarError.message}`);

    if (pacoteId) {
      const { error: pacoteError } = await supabase.from("pacotes").update({ turma_id: turmaDestinoId }).eq("id", pacoteId);
      if (pacoteError) throw new Error(`Falha ao migrar pacote: ${pacoteError.message}`);
    }
  } else if (pacoteId) {
    const { data: pacote, error: pacoteReadError } = await supabase.from("pacotes").select("aulas_usadas, total_aulas").eq("id", pacoteId).single();
    if (pacoteReadError) throw new Error(`Falha ao ler pacote: ${pacoteReadError.message}`);
    const novaContagem = Math.min(pacote.aulas_usadas + 1, pacote.total_aulas);
    const { error: pacoteError } = await supabase
      .from("pacotes")
      .update({ aulas_usadas: novaContagem, status: novaContagem === pacote.total_aulas ? "ultima_aula" : "ativo", atualizado_em: new Date().toISOString() })
      .eq("id", pacoteId);
    if (pacoteError) throw new Error(`Falha ao consumir aula do pacote: ${pacoteError.message}`);
  }

  const { error: novaMatriculaError } = await supabase
    .from("matriculas")
    .insert({ turma_id: turmaDestinoId, aluno_id: alunoId, pacote_id: pacoteId, status: "confirmado", provisorio: tipo === "provisoria" });
  if (novaMatriculaError) throw new Error(`Falha ao matricular na turma nova: ${novaMatriculaError.message}`);

  revalidatePath(`/turmas/${turmaOrigemId}`);
  revalidatePath(`/turmas/${turmaDestinoId}`);
}
