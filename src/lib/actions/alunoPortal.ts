"use server";

// Leituras/ações voltadas pro aluno logado (Área do Aluno, 2026-09-24,
// segunda fatia — Turmas + Oficinas). Contagens de ocupação (quantas
// vagas/participantes) usam service_role de propósito: a RLS de
// `matriculas`/`oficina_participantes` só libera `aluno_id =
// current_profile_id()` pra quem não é admin (Fase 1) — um aluno contando
// via client normal só veria a PRÓPRIA linha, não o total da turma/
// oficina. Isso NUNCA expõe nome/dado de outra pessoa pro aluno — só o
// número agregado (ocupadas/vagas) sai daqui; a própria participação do
// aluno é buscada à parte, filtrada pelo próprio id.
//
// `solicitarVaga` já é diferente: escreve em nome do próprio aluno
// (aluno_id = current_profile_id(), a nova policy de insert cobre
// exatamente isso), não precisa de service_role.

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatarData, formatarHora } from "@/lib/formatarData";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import type { StatusPecas } from "@/types/database";

// cache() dedupe por-request (não é o mesmo cache de dado entre requests)
// — várias funções deste arquivo chamam meuProfileId(), e mais de uma às
// vezes roda junto num Promise.all (ex: getHistoricoAulas +
// getHistoricoPagamentos) — sem isso cada uma resolvia auth.getUser() +
// profiles de novo, sequencialmente, pro MESMO resultado (achado no
// pente-fino de performance, 2026-09-25). Seguro com "use server" no
// topo do arquivo porque `meuProfileId` nunca foi exportado — a regra
// "toda export vira Server Action" (CLAUDE.md armadilhas) não se aplica
// a helpers internos.
const meuProfileId = cache(async (): Promise<string | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("id, nome").eq("auth_user_id", user.id).maybeSingle();
  return data?.id ?? null;
});

export interface TurmaParaAluno {
  id: string;
  nome: string;
  dia: string;
  hora: string;
  ocupadas: number;
  capacidade: number;
  /** Já é matrícula FIXA do próprio aluno logado (2026-09-25, pedido do
   *  Diego: "na turma dela precisa estar escrito minha turma... e nao
   *  solicitar vaga em todas") — essa turma não mostra botão de
   *  solicitar, mostra que é a turma dele. */
  souEuFixo: boolean;
  /** Solicitação MAIS RECENTE do próprio aluno pra essa turma (2026-09-25,
   *  "vai estar pendente ou confirmada na tela dela"). `null` = nunca
   *  pediu, ou a mais recente já foi resolvida há tempo (não filtramos
   *  por data — a mais recente por `solicitado_em` já resolve o caso
   *  comum de pedir de novo depois de uma recusa). RLS não libera aluno
   *  ler a própria `solicitacoes_vaga` (só admin, ver schema) — por isso
   *  usa `admin`, já em uso nesta função pelo mesmo motivo do
   *  `matriculas`/`oficina_participantes`. */
  minhaSolicitacao: { id: string; status: "pendente" | "aprovada" | "recusada"; tipo: string } | null;
}

export async function getTurmasParaAluno(): Promise<TurmaParaAluno[]> {
  const admin = createAdminClient();
  // meuId e turmas não dependem um do outro; solicitacoes/matriculaFixa
  // (mais abaixo) só dependem de meuId, não uma da outra; a contagem de
  // ocupadas virou 1 query em lote em vez de 1 por turma (achado no
  // pente-fino de performance, 2026-09-25).
  const [meuId, { data: turmas, error }] = await Promise.all([
    meuProfileId(),
    admin.from("turmas").select("id, nome, dia, hora_inicio, hora_fim, capacidade").order("dia").order("hora_inicio"),
  ]);
  if (error) throw new Error(`Falha ao buscar turmas: ${error.message}`);

  const DIA_LABEL: Record<string, string> = { seg: "Segunda", ter: "Terça", qua: "Quarta", qui: "Quinta", sex: "Sexta", sab: "Sábado", dom: "Domingo" };
  const turmaIds = (turmas ?? []).map((t) => t.id);

  const minhasPorTurma = new Map<string, { id: string; status: "pendente" | "aprovada" | "recusada"; tipo: string }>();
  let minhaTurmaFixaId: string | null = null;
  if (meuId) {
    const [{ data: solicitacoes }, { data: matriculaFixa }] = await Promise.all([
      admin.from("solicitacoes_vaga").select("id, turma_id, status, tipo").eq("aluno_id", meuId).order("solicitado_em", { ascending: false }),
      admin.from("matriculas").select("turma_id").eq("aluno_id", meuId).eq("status", "confirmado").eq("provisorio", false).maybeSingle(),
    ]);
    for (const s of solicitacoes ?? []) {
      if (!minhasPorTurma.has(s.turma_id)) minhasPorTurma.set(s.turma_id, { id: s.id, status: s.status, tipo: s.tipo });
    }
    minhaTurmaFixaId = matriculaFixa?.turma_id ?? null;
  }

  const ocupadasPorTurma = new Map<string, number>();
  if (turmaIds.length > 0) {
    const { data: matriculasConfirmadas } = await admin.from("matriculas").select("turma_id").in("turma_id", turmaIds).eq("status", "confirmado");
    for (const m of matriculasConfirmadas ?? []) {
      ocupadasPorTurma.set(m.turma_id, (ocupadasPorTurma.get(m.turma_id) ?? 0) + 1);
    }
  }

  return (turmas ?? []).map((t): TurmaParaAluno => ({
    id: t.id,
    nome: t.nome,
    dia: DIA_LABEL[t.dia] ?? t.dia,
    hora: `${t.hora_inicio.slice(0, 5)} às ${t.hora_fim.slice(0, 5)}`,
    ocupadas: ocupadasPorTurma.get(t.id) ?? 0,
    capacidade: t.capacidade,
    souEuFixo: t.id === minhaTurmaFixaId,
    minhaSolicitacao: minhasPorTurma.get(t.id) ?? null,
  }));
}

/** Pedido de vaga nova ou reposição — mesma tela/tabela que o admin já
 *  aprova em Solicitações (src/lib/actions/solicitacoes.ts), só que agora
 *  criada pelo próprio aluno em vez de digitada à mão pelo admin.
 *  `aluno_id` preenchido é o que muda — permite ligar de volta ao profile
 *  se um dia isso importar (hoje `aprovarSolicitacao` ainda trata como
 *  "pessoa nova", mesma simplificação deliberada já documentada). */
export async function solicitarVaga(turmaId: string, tipo: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: perfil } = await supabase.from("profiles").select("id, nome").eq("auth_user_id", user.id).maybeSingle();
  if (!perfil) throw new Error("Perfil não encontrado.");

  const { error } = await supabase.from("solicitacoes_vaga").insert({ nome: perfil.nome, tipo, turma_id: turmaId, aluno_id: perfil.id });
  if (error) throw new Error(`Falha ao enviar solicitação: ${error.message}`);

  revalidatePath("/aluno/turmas");
}

/** Cancela a própria solicitação, só enquanto pendente — RLS
 *  (`solicitacoes_vaga_aluno_delete`) já garante as duas coisas: só
 *  apaga se for do próprio aluno E se ainda estiver pendente (uma já
 *  aprovada/recusada não pode "sumir" por engano). "Editar" (pedido do
 *  Diego) vira cancelar + abrir o modal de novo na UI, não um formulário
 *  separado — mais simples e cobre o mesmo caso de uso. */
export async function cancelarSolicitacao(solicitacaoId: string) {
  const supabase = await createClient();
  // `.select()` no delete pra distinguir "apagou de verdade" de "RLS
  // bloqueou silenciosamente" — um delete que a policy nega não vem com
  // `error` nenhum, só devolve 0 linhas (achado testando esta mesma
  // função antes do patch da policy chegar no banco do Diego).
  const { data, error } = await supabase.from("solicitacoes_vaga").delete().eq("id", solicitacaoId).select("id");
  if (error) throw new Error(`Falha ao cancelar solicitação: ${error.message}`);
  if (!data || data.length === 0) throw new Error("Não foi possível cancelar essa solicitação — ela pode já ter sido resolvida.");
  revalidatePath("/aluno/turmas");
}

export interface OficinaParaAluno {
  id: string;
  nome: string;
  data: string;
  hora: string;
  valor: number | null;
  vagas: number;
  ocupadas: number;
  descricao: string;
  statusPecas: StatusPecas;
  minhaParticipacao: { tipo: "individual" | "dupla"; pagamento: "pendente" | "pago" | "isento" } | null;
}

export async function getOficinasParaAluno(): Promise<OficinaParaAluno[]> {
  const meuId = await meuProfileId();
  const admin = createAdminClient();

  const { data: oficinas, error } = await admin
    .from("oficinas")
    .select("id, nome, data, hora_inicio, hora_fim, valor, max_participantes, descricao, status_pecas, oficina_participantes(aluno_id, tipo, pagamento)")
    .order("data", { ascending: true })
    .overrideTypes<
      Array<{
        id: string; nome: string; data: string; hora_inicio: string; hora_fim: string;
        valor: number | null; max_participantes: number; descricao: string | null; status_pecas: StatusPecas;
        oficina_participantes: { aluno_id: string | null; tipo: "individual" | "dupla"; pagamento: "pendente" | "pago" | "isento" }[];
      }>,
      { merge: false }
    >();
  if (error) throw new Error(`Falha ao buscar oficinas: ${error.message}`);

  return (oficinas ?? []).map((o) => {
    const minha = meuId ? o.oficina_participantes.find((p) => p.aluno_id === meuId) : undefined;
    return {
      id: o.id,
      nome: o.nome,
      data: formatarData(o.data),
      hora: formatarHora(o.hora_inicio, o.hora_fim),
      valor: o.valor,
      vagas: o.max_participantes,
      ocupadas: o.oficina_participantes.length,
      descricao: o.descricao ?? "",
      statusPecas: o.status_pecas,
      minhaParticipacao: minha ? { tipo: minha.tipo, pagamento: minha.pagamento } : null,
    };
  });
}

/** Histórico de aulas/pagamentos do próprio aluno (2026-09-25). As duas
 *  tabelas por trás (aulas/presencas) só passaram a ser gravadas de
 *  verdade quando os dados reais de Turmas foram ligados (2026-09-24,
 *  ver toggleStatusAula/marcarPresenca em actions/turmas.ts) — antes
 *  disso não existe linha nenhuma pra ler, então quem nunca teve
 *  presença/falta marcada pelo admin desde então simplesmente não
 *  aparece aqui (não é bug, é ausência real de dado anterior a essa
 *  data). RLS já cobre as duas tabelas pro próprio aluno
 *  (`aluno_id = current_profile_id()`), sem precisar de service_role. */
export interface AulaHistorico {
  turma: string;
  dataFormatada: string;
  status: "presente" | "falta" | "reposicao" | "pendente";
}

export async function getHistoricoAulas(): Promise<AulaHistorico[]> {
  const meuId = await meuProfileId();
  if (!meuId) return [];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("presencas")
    .select("status, aulas(data, turmas(nome))")
    .eq("aluno_id", meuId)
    .overrideTypes<Array<{ status: AulaHistorico["status"]; aulas: { data: string; turmas: { nome: string } | null } | null }>, { merge: false }>();
  if (error) throw new Error(`Falha ao buscar histórico de aulas: ${error.message}`);

  return (data ?? [])
    .filter((p): p is typeof p & { aulas: { data: string; turmas: { nome: string } | null } } => !!p.aulas)
    .sort((a, b) => b.aulas.data.localeCompare(a.aulas.data))
    .map((p) => ({ turma: p.aulas.turmas?.nome ?? "Turma", dataFormatada: formatarData(p.aulas.data), status: p.status }));
}

export interface PagamentoHistorico {
  id: string;
  descricao: string | null;
  valor: number | null;
  status: "pendente" | "pago";
  dataFormatada: string;
}

export async function getHistoricoPagamentos(): Promise<PagamentoHistorico[]> {
  const meuId = await meuProfileId();
  if (!meuId) return [];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pagamentos")
    .select("id, descricao, valor, status, criado_em")
    .eq("aluno_id", meuId)
    .neq("status", "isento")
    .order("criado_em", { ascending: false })
    .overrideTypes<Array<{ id: string; descricao: string | null; valor: number | null; status: "pendente" | "pago"; criado_em: string }>, { merge: false }>();
  if (error) throw new Error(`Falha ao buscar histórico de pagamentos: ${error.message}`);

  return (data ?? []).map((p) => ({
    id: p.id,
    descricao: p.descricao,
    valor: p.valor,
    status: p.status,
    dataFormatada: formatarData(p.criado_em.slice(0, 10)),
  }));
}

/** Pagamento pendente mais recente do próprio aluno, pro card "Minha
 *  Turma" do Início — reaproveita a mesma leitura de getHistoricoPagamentos
 *  (RLS já cobre) em vez de criar uma query paralela quase igual. */
export async function getPagamentoPendente(): Promise<PagamentoHistorico | null> {
  const historico = await getHistoricoPagamentos();
  return historico.find((p) => p.status === "pendente") ?? null;
}

/** Aluno anexa o comprovante do PRÓPRIO pagamento pendente (2026-09-25,
 *  "consiga pagar por pix e enviar o comprovante para o admin"). Confere
 *  posse/status ANTES de subir o arquivo (evita gastar upload num arquivo
 *  que o update ia rejeitar de qualquer forma) — o bucket é privado
 *  (`comprovantes`, ver schema.sql), e as policies de storage.objects só
 *  liberam o aluno gravar/ler dentro da própria pasta
 *  (`{aluno_id}/...`), então o caminho abaixo é o que faz a policy
 *  bater, não é só organização.
 *
 *  Sem notificação em `notificacoes` de propósito — a tabela existe no
 *  schema mas nenhuma tela (admin ou aluno) lê dela ainda, seria escrever
 *  num vazio que ninguém veria. O admin vê o comprovante direto na tela
 *  de Pagamentos (getPagamentosReal/PagamentosClient), que já é onde ele
 *  confirma o pagamento. */
export async function enviarComprovantePagamento(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: perfil } = await supabase.from("profiles").select("id").eq("auth_user_id", user.id).maybeSingle();
  if (!perfil) throw new Error("Perfil não encontrado.");

  const pagamentoId = formData.get("pagamentoId");
  const arquivo = formData.get("arquivo");
  if (typeof pagamentoId !== "string" || !pagamentoId) throw new Error("Pagamento inválido.");
  if (!(arquivo instanceof File) || arquivo.size === 0) throw new Error("Selecione um arquivo antes de enviar.");

  const { data: pagamento } = await supabase.from("pagamentos").select("id, aluno_id, status").eq("id", pagamentoId).maybeSingle();
  if (!pagamento || pagamento.aluno_id !== perfil.id) throw new Error("Pagamento não encontrado.");
  if (pagamento.status !== "pendente") throw new Error("Esse pagamento já foi confirmado.");

  const extensao = arquivo.name.includes(".") ? arquivo.name.split(".").pop() : "jpg";
  const caminho = `${perfil.id}/${Date.now()}.${extensao}`;
  const { error: uploadError } = await supabase.storage.from("comprovantes").upload(caminho, arquivo, { contentType: arquivo.type || undefined });
  if (uploadError) throw new Error(`Falha ao enviar o comprovante: ${uploadError.message}`);

  const { error: updateError } = await supabase
    .from("pagamentos")
    .update({ comprovante_url: caminho, comprovante_enviado_em: new Date().toISOString() })
    .eq("id", pagamentoId);
  if (updateError) throw new Error(`Falha ao registrar o comprovante: ${updateError.message}`);

  revalidatePath("/aluno");
  revalidatePath("/aluno/historico");
  revalidatePath("/pagamentos");
}
