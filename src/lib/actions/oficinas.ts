"use server";

// Camada real de dados pra Oficinas — leitura + mutações (Server Actions).
// Ligada desde 2026-09-24 (OficinasListClient/OficinaDetalheClient).
// Formato de saída em camelCase, igual ao tipo `Oficina`/`Participante`
// que as páginas já usam.
//
// Schema ganhou 4 coisas que faltavam (supabase/schema.sql, 2026-09-24,
// mesmo padrão de achado dos outros domínios): `status_pecas` (não
// existia — "Em secagem → ... → Prontas"), `descricao`/`observacoes`/
// `receita` em `oficinas` (a UI já tinha esses campos, o schema não),
// `tipo`/`dupla_com` em `oficina_participantes` (individual/dupla) e
// `criado_em` nela também (precisa de uma ordem estável pra numerar as
// vagas, mesma razão de `matriculas.solicitado_em` em Turmas).

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ParticipanteTipo, StatusPecas } from "@/types/database";
import { formatarData, formatarHora } from "@/lib/formatarData";

export interface ParticipanteReal {
  numero: number;
  nome: string | null;
  tipo?: "individual" | "dupla";
  duplaCom?: string | null;
  pagamento?: "pendente" | "pago";
  _id?: string; // id real da linha em oficina_participantes, só quando ocupada — precisa pra editar/remover
}

export interface OficinaReal {
  id: string;
  nome: string;
  status: "Agendada";
  statusPecas: StatusPecas;
  data: string; // formatado, só exibição: "10 de Outubro de 2026"
  hora: string; // formatado, só exibição: "16:00 às 19:00"
  dataISO: string; // "YYYY-MM-DD", pro form de editar (input type=date)
  horaInicioRaw: string; // "HH:MM", pro form de editar (input type=time)
  horaFimRaw: string; // "HH:MM", pro form de editar (input type=time)
  valor: number | null;
  vagas: number;
  descricao: string;
  receita: { item: string; peso: string }[];
  observacoes: string;
  participantes: ParticipanteReal[];
}


async function montarOficinaReal(row: {
  id: string;
  nome: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  valor: number | null;
  max_participantes: number;
  status_pecas: StatusPecas;
  descricao: string | null;
  observacoes: string | null;
  receita: { item: string; peso: string }[];
  oficina_participantes: {
    id: string;
    nome: string;
    tipo: ParticipanteTipo;
    dupla_com: string | null;
    pagamento: "pendente" | "pago" | "isento";
    criado_em: string;
  }[];
}): Promise<OficinaReal> {
  const ocupadas = [...row.oficina_participantes]
    .sort((a, b) => a.criado_em.localeCompare(b.criado_em))
    .map((p, i): ParticipanteReal => ({
      numero: i + 1,
      nome: p.nome,
      tipo: p.tipo,
      duplaCom: p.dupla_com,
      pagamento: p.pagamento === "isento" ? "pago" : p.pagamento,
      _id: p.id,
    }));
  const vazias: ParticipanteReal[] = [];
  for (let n = ocupadas.length + 1; n <= row.max_participantes; n++) vazias.push({ numero: n, nome: null });

  return {
    id: row.id,
    nome: row.nome,
    status: "Agendada",
    statusPecas: row.status_pecas,
    data: formatarData(row.data),
    hora: formatarHora(row.hora_inicio, row.hora_fim),
    dataISO: row.data,
    horaInicioRaw: row.hora_inicio.slice(0, 5),
    horaFimRaw: row.hora_fim.slice(0, 5),
    valor: row.valor,
    vagas: row.max_participantes,
    descricao: row.descricao ?? "",
    receita: row.receita ?? [],
    observacoes: row.observacoes ?? "",
    participantes: [...ocupadas, ...vazias],
  };
}

export async function getOficinasReal(): Promise<OficinaReal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("oficinas")
    .select("*, oficina_participantes(id, nome, tipo, dupla_com, pagamento, criado_em)")
    .order("data", { ascending: true })
    .overrideTypes<Parameters<typeof montarOficinaReal>[0][], { merge: false }>();
  if (error) throw new Error(`Falha ao buscar oficinas: ${error.message}`);
  return Promise.all((data ?? []).map(montarOficinaReal));
}

export async function getOficinaReal(id: string): Promise<OficinaReal | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("oficinas")
    .select("*, oficina_participantes(id, nome, tipo, dupla_com, pagamento, criado_em)")
    .eq("id", id)
    .maybeSingle()
    .overrideTypes<Parameters<typeof montarOficinaReal>[0] | null, { merge: false }>();
  if (error) throw new Error(`Falha ao buscar oficina: ${error.message}`);
  return data ? montarOficinaReal(data) : null;
}

export async function criarOficina(dados: {
  nome: string;
  data: string; // YYYY-MM-DD
  horaInicio: string;
  horaFim: string;
  vagas: number;
  valor: number | null;
  descricao: string;
  observacoes: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("oficinas").insert({
    nome: dados.nome,
    data: dados.data,
    hora_inicio: dados.horaInicio,
    hora_fim: dados.horaFim,
    max_participantes: dados.vagas,
    valor: dados.valor,
    descricao: dados.descricao || null,
    observacoes: dados.observacoes || null,
  });
  if (error) throw new Error(`Falha ao criar oficina: ${error.message}`);
  revalidatePath("/oficinas");
}

/** Editar vagas nunca apaga participante já inscrito (CLAUDE.md §5
 *  Oficinas) — encolher só remove vagas VAZIAS do fim; se a redução
 *  pedida removeria alguém já cadastrado, recusa e mantém o número
 *  antigo. Também aceita `statusPecas` (mesmo botão de "avançar etapa"
 *  da tela, sem ação separada). */
export async function editarOficina(
  id: string,
  dados: Partial<{
    nome: string;
    data: string;
    horaInicio: string;
    horaFim: string;
    vagas: number;
    valor: number | null;
    descricao: string;
    observacoes: string;
    statusPecas: StatusPecas;
  }>
) {
  const supabase = await createClient();

  if (dados.vagas !== undefined) {
    const { count, error: countError } = await supabase
      .from("oficina_participantes")
      .select("id", { count: "exact", head: true })
      .eq("oficina_id", id);
    if (countError) throw new Error(`Falha ao checar participantes: ${countError.message}`);
    if ((count ?? 0) > dados.vagas) {
      throw new Error(`Não dá pra reduzir pra ${dados.vagas} vagas — já tem ${count} participante(s) cadastrado(s). Remova participantes antes.`);
    }
  }

  const { error } = await supabase
    .from("oficinas")
    .update({
      ...(dados.nome !== undefined && { nome: dados.nome }),
      ...(dados.data !== undefined && { data: dados.data }),
      ...(dados.horaInicio !== undefined && { hora_inicio: dados.horaInicio }),
      ...(dados.horaFim !== undefined && { hora_fim: dados.horaFim }),
      ...(dados.vagas !== undefined && { max_participantes: dados.vagas }),
      ...(dados.valor !== undefined && { valor: dados.valor }),
      ...(dados.descricao !== undefined && { descricao: dados.descricao || null }),
      ...(dados.observacoes !== undefined && { observacoes: dados.observacoes || null }),
      ...(dados.statusPecas !== undefined && { status_pecas: dados.statusPecas }),
    })
    .eq("id", id);
  if (error) throw new Error(`Falha ao editar oficina: ${error.message}`);
  revalidatePath("/oficinas");
  revalidatePath(`/oficinas/${id}`);
}

export async function cadastrarParticipante(
  oficinaId: string,
  dados: { nome: string; tipo: "individual" | "dupla"; duplaCom?: string | null; pagamento: "pendente" | "pago" }
) {
  const supabase = await createClient();
  const { error } = await supabase.from("oficina_participantes").insert({
    oficina_id: oficinaId,
    nome: dados.nome,
    tipo: dados.tipo,
    dupla_com: dados.duplaCom ?? null,
    pagamento: dados.pagamento,
    confirmado: true,
  });
  if (error) throw new Error(`Falha ao cadastrar participante: ${error.message}`);
  revalidatePath(`/oficinas/${oficinaId}`);
}

export async function editarParticipante(
  participanteId: string,
  oficinaId: string,
  dados: { nome: string; tipo: "individual" | "dupla"; duplaCom?: string | null; pagamento: "pendente" | "pago" }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("oficina_participantes")
    .update({ nome: dados.nome, tipo: dados.tipo, dupla_com: dados.duplaCom ?? null, pagamento: dados.pagamento })
    .eq("id", participanteId);
  if (error) throw new Error(`Falha ao editar participante: ${error.message}`);
  revalidatePath(`/oficinas/${oficinaId}`);
}

export async function removerParticipante(participanteId: string, oficinaId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("oficina_participantes").delete().eq("id", participanteId);
  if (error) throw new Error(`Falha ao remover participante: ${error.message}`);
  revalidatePath(`/oficinas/${oficinaId}`);
}
