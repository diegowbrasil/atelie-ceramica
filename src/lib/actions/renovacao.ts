"use server";

// Renovar pacote (2026-10-08, pedido do Diego). Regras combinadas com ele:
// renova quando o pacote ACABA (aula X de X); o pacote novo começa a
// contar na hora e a cobrança fica pendente até o admin marcar como pago
// (é como o ateliê já trabalha). Opções: pacote de 4 aulas ou aula avulsa,
// preço sempre lido de atelie_config no servidor, nunca do navegador.
//
// O aluno não tem permissão de escrita em `pacotes` pela RLS (só admin),
// então a versão dele usa service_role, com a posse conferida aqui antes.

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { getConfigAtelie } from "@/lib/configAtelie";
import { RENOVACAO, ehTipoRenovacao, precoDe, type TipoRenovacao } from "@/lib/pacotes";
import type { Resultado } from "@/lib/resultado";
import { telefoneParaWhatsApp } from "@/lib/lembretes";

type Banco = ReturnType<typeof createAdminClient> | Awaited<ReturnType<typeof createClient>>;
type CobrancaCriada = { pagamento: { id: string; descricao: string; valor: number } };

async function executarRenovacao(
  db: Banco,
  alunoId: string,
  tipo: TipoRenovacao,
  regras: { bloquearComPendente: boolean }
): Promise<Resultado<CobrancaCriada>> {
  // Só a matrícula FIXA (mesmo motivo de montarAlunoReal em alunos.ts).
  const { data: matricula, error: eMatricula } = await db
    .from("matriculas")
    .select("id, turma_id, pacote_id")
    .eq("aluno_id", alunoId)
    .eq("status", "confirmado")
    .eq("provisorio", false)
    .maybeSingle();
  if (eMatricula) return { ok: false, erro: `Não deu pra ler a matrícula: ${eMatricula.message}` };
  if (!matricula) return { ok: false, erro: "Sem turma fixa, não tem pacote pra renovar." };

  if (matricula.pacote_id) {
    const { data: atual } = await db.from("pacotes").select("aulas_usadas, total_aulas").eq("id", matricula.pacote_id).maybeSingle();
    if (atual && atual.aulas_usadas < atual.total_aulas) {
      const faltam = atual.total_aulas - atual.aulas_usadas;
      return { ok: false, erro: `O pacote atual ainda tem ${faltam} aula${faltam > 1 ? "s" : ""}. Dá pra renovar quando ele acabar.` };
    }
  }

  if (regras.bloquearComPendente) {
    const { count } = await db.from("pagamentos").select("id", { count: "exact", head: true }).eq("aluno_id", alunoId).eq("status", "pendente");
    if ((count ?? 0) > 0) return { ok: false, erro: "Você tem um pagamento pendente. Assim que o ateliê confirmar, dá pra renovar." };
  }

  // Trava contra clique duplo / duas abas: só segue quem conseguir
  // encerrar o pacote atual (o segundo encontra ele já encerrado).
  if (matricula.pacote_id) {
    const { data: encerrado, error } = await db
      .from("pacotes")
      .update({ status: "encerrado", atualizado_em: new Date().toISOString() })
      .eq("id", matricula.pacote_id)
      .neq("status", "encerrado")
      .select("id");
    if (error) return { ok: false, erro: `Não deu pra encerrar o pacote atual: ${error.message}` };
    if (!encerrado?.length) return { ok: false, erro: "Esse pacote já foi renovado." };
  }

  const config = await getConfigAtelie();
  const opcao = RENOVACAO[tipo];
  const valor = precoDe(tipo, config);

  const { data: novo, error: ePacote } = await db
    .from("pacotes")
    .insert({ aluno_id: alunoId, turma_id: matricula.turma_id, total_aulas: opcao.aulas, aulas_usadas: 0, status: "ativo" })
    .select("id")
    .single();
  if (ePacote) {
    // Devolve o pacote antigo ao estado de antes, senão o aluno ficaria
    // sem poder tentar de novo ("já foi renovado").
    if (matricula.pacote_id) await db.from("pacotes").update({ status: "ultima_aula" }).eq("id", matricula.pacote_id);
    return { ok: false, erro: `Não deu pra criar o pacote novo: ${ePacote.message}` };
  }

  const { error: eVinculo } = await db.from("matriculas").update({ pacote_id: novo.id }).eq("id", matricula.id);
  if (eVinculo) return { ok: false, erro: `Não deu pra ligar o pacote novo à turma: ${eVinculo.message}` };

  const { data: pagamento, error: ePagamento } = await db
    .from("pagamentos")
    .insert({ aluno_id: alunoId, turma_id: matricula.turma_id, tipo, descricao: opcao.descricao, valor, status: "pendente" })
    .select("id")
    .single();
  if (ePagamento) return { ok: false, erro: `O pacote foi renovado, mas a cobrança não foi criada: ${ePagamento.message}` };

  revalidatePath("/aluno");
  revalidatePath("/aluno/historico");
  revalidatePath("/alunos");
  revalidatePath(`/alunos/${alunoId}`);
  revalidatePath("/turmas", "layout");
  revalidatePath("/pagamentos");
  revalidatePath("/dashboard");
  return { ok: true, pagamento: { id: pagamento.id, descricao: opcao.descricao, valor } };
}

/** O próprio aluno renova, pela tela Minha Turma. */
export async function renovarMeuPacote(tipo: TipoRenovacao): Promise<Resultado<CobrancaCriada>> {
  if (!ehTipoRenovacao(tipo)) return { ok: false, erro: "Opção inválida." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Sua sessão expirou. Entre de novo." };
  const { data: perfil } = await supabase.from("profiles").select("id, role").eq("auth_user_id", user.id).maybeSingle();
  if (!perfil || perfil.role !== "aluno") return { ok: false, erro: "Perfil não encontrado." };

  return executarRenovacao(createAdminClient(), perfil.id, tipo, { bloquearComPendente: true });
}

/** Admin renova pela página do aluno — pode renovar mesmo com pagamento
 *  antigo pendente (é decisão da Hanna). Usa o client normal: a RLS de
 *  admin já libera, e continua valendo como segunda trava. */
export async function renovarPacoteAluno(alunoId: string, tipo: TipoRenovacao): Promise<Resultado<CobrancaCriada>> {
  if (!ehTipoRenovacao(tipo)) return { ok: false, erro: "Opção inválida." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Sua sessão expirou. Entre de novo." };
  const { data: perfil } = await supabase.from("profiles").select("role").eq("auth_user_id", user.id).maybeSingle();
  if (perfil?.role !== "admin") return { ok: false, erro: "Só admin pode fazer isso." };

  return executarRenovacao(supabase, alunoId, tipo, { bloquearComPendente: false });
}

export interface ResumoPacote {
  nome: string;
  /** Só dígitos com 55, pronto pro wa.me — null sem telefone válido. */
  telefoneWhatsApp: string | null;
  totalAulas: number;
  aulasUsadas: number;
  /** "dd/mm" das presenças do pacote atual, em ordem. Pode ter menos que
   *  aulasUsadas: aulas dadas antes do app registrar presença não têm data. */
  datas: string[];
  /** null = nada pendente. */
  pendente: { valor: number | null } | null;
  usaOApp: boolean;
}

/** Resumo pra mensagem de "pacote fechou" (2026-10-08, pedido do Diego):
 *  datas reais em que a pessoa veio (não semanas seguidas — ela pode pular
 *  uma), situação do pagamento, e o resto (Pix, preços) a tela completa
 *  com a configuração do ateliê. Não existe ligação direta presença →
 *  pacote no schema; como cada presença marcada soma 1 no pacote atual, as
 *  últimas `aulas_usadas` presenças são as dele. */
export async function getResumoPacote(alunoId: string): Promise<Resultado<{ resumo: ResumoPacote }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Sua sessão expirou. Entre de novo." };
  const { data: eu } = await supabase.from("profiles").select("role").eq("auth_user_id", user.id).maybeSingle();
  if (eu?.role !== "admin") return { ok: false, erro: "Só admin pode fazer isso." };

  const [{ data: perfil }, { data: matricula }, { data: presencas }, { data: pendentes }] = await Promise.all([
    supabase.from("profiles").select("nome, telefone, auth_user_id").eq("id", alunoId).maybeSingle(),
    supabase
      .from("matriculas")
      .select("pacotes(total_aulas, aulas_usadas)")
      .eq("aluno_id", alunoId)
      .eq("status", "confirmado")
      .eq("provisorio", false)
      .maybeSingle()
      .overrideTypes<{ pacotes: { total_aulas: number; aulas_usadas: number } | null } | null, { merge: false }>(),
    supabase
      .from("presencas")
      .select("aulas(data)")
      .eq("aluno_id", alunoId)
      .eq("status", "presente")
      .overrideTypes<Array<{ aulas: { data: string } | null }>, { merge: false }>(),
    supabase.from("pagamentos").select("valor").eq("aluno_id", alunoId).eq("status", "pendente").order("criado_em", { ascending: false }).limit(1),
  ]);
  if (!perfil) return { ok: false, erro: "Aluno não encontrado." };
  const pacote = matricula?.pacotes;
  if (!pacote) return { ok: false, erro: "Esse aluno não tem pacote numa turma fixa." };

  const datas = (presencas ?? [])
    .map((p) => p.aulas?.data)
    .filter((d): d is string => !!d)
    .sort()
    .slice(-pacote.aulas_usadas)
    .map((d) => `${d.slice(8, 10)}/${d.slice(5, 7)}`);
  if (pacote.aulas_usadas === 0) datas.length = 0;

  return {
    ok: true,
    resumo: {
      nome: perfil.nome,
      telefoneWhatsApp: telefoneParaWhatsApp(perfil.telefone),
      totalAulas: pacote.total_aulas,
      aulasUsadas: pacote.aulas_usadas,
      datas,
      pendente: pendentes && pendentes.length > 0 ? { valor: pendentes[0].valor } : null,
      usaOApp: !!perfil.auth_user_id,
    },
  };
}
