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
import type { StatusPecas } from "@/types/database";

async function meuProfileId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("id, nome").eq("auth_user_id", user.id).maybeSingle();
  return data?.id ?? null;
}

export interface TurmaParaAluno {
  id: string;
  nome: string;
  dia: string;
  hora: string;
  ocupadas: number;
  capacidade: number;
}

export async function getTurmasParaAluno(): Promise<TurmaParaAluno[]> {
  const admin = createAdminClient();
  const { data: turmas, error } = await admin.from("turmas").select("id, nome, dia, hora_inicio, hora_fim, capacidade").order("dia").order("hora_inicio");
  if (error) throw new Error(`Falha ao buscar turmas: ${error.message}`);

  const DIA_LABEL: Record<string, string> = { seg: "Segunda", ter: "Terça", qua: "Quarta", qui: "Quinta", sex: "Sexta", sab: "Sábado", dom: "Domingo" };

  return Promise.all(
    (turmas ?? []).map(async (t): Promise<TurmaParaAluno> => {
      const { count } = await admin.from("matriculas").select("id", { count: "exact", head: true }).eq("turma_id", t.id).eq("status", "confirmado");
      return {
        id: t.id,
        nome: t.nome,
        dia: DIA_LABEL[t.dia] ?? t.dia,
        hora: `${t.hora_inicio.slice(0, 5)} às ${t.hora_fim.slice(0, 5)}`,
        ocupadas: count ?? 0,
        capacidade: t.capacidade,
      };
    })
  );
}

/** Pedido de vaga nova ou reposição — mesma tela/tabela que o admin já
 *  aprova em Solicitações (src/lib/actions/solicitacoes.ts), só que agora
 *  criada pelo próprio aluno em vez de digitada à mão pelo admin.
 *  `aluno_id` preenchido é o que muda — permite ligar de volta ao profile
 *  se um dia isso importar (hoje `aprovarSolicitacao` ainda trata como
 *  "pessoa nova", mesma simplificação deliberada já documentada). */
export async function solicitarVaga(turmaId: string, tipo: string) {
  const supabase = createClient();
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
  const supabase = createClient();

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
  const supabase = createClient();

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
