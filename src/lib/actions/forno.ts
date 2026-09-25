"use server";

// Camada real de dados pro Forno — leitura + mutações (Server Actions).
// AINDA NÃO LIGADA à tela (mesmo estágio de src/lib/actions/turmas.ts,
// ver PROGRESS.md sessão 2026-09-23/24). Formato de saída em camelCase,
// igual ao tipo `Fornada` que forno/page.tsx já usa — trocar a fonte não
// deve exigir mudar a UI.
//
// Schema ganhou 3 coisas que faltavam (ver supabase/schema.sql, sessão
// 2026-09-24, mesmo padrão de achado do Turmas): `queimas.forno_id`
// (qual dos 2 fornos físicos — não existia), `queimas.status` (estado da
// fornada como registro — "interrompida"/"cancelada" não são etapas de
// `etapa_atual`, são finais alternativos) e a tabela `queima_observacoes`
// (o schema original só tinha `queimas.observacoes text`, um campo só,
// mas a UI precisa de uma lista com timestamp).

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ConteudoCategoria, EtapaQueimaDB, FornoFisico, TipoQueima } from "@/types/database";

export interface FornadaReal {
  id: string;
  fornoId: FornoFisico;
  tipo: TipoQueima;
  tipoDescricao: string;
  categorias: ConteudoCategoria[];
  detalhesConteudo: string;
  config: {
    temperaturaInicial: number;
    temperaturaMaxima: number;
    velocidadeAquecimento: number;
    tempoPatamarMin: number;
    velocidadeResfriamento: number;
    temperaturaSegura: number;
  };
  iniciadoEm: string | null;
  finalizadoEm: string | null;
  status: "andamento" | "finalizada" | "interrompida" | "cancelada";
  etapaAtual: EtapaQueimaDB;
  leituras: { temperatura: number; em: string }[];
  observacoes: { em: string; texto: string }[];
}

/** Todas as fornadas (histórico + ativa, se houver) de um forno físico,
 *  mais novas primeiro — mesmo formato da lista lateral de histórico. */
export async function getFornadasReal(fornoId: FornoFisico): Promise<FornadaReal[]> {
  const supabase = createClient();

  const { data: queimas, error } = await supabase
    .from("queimas")
    .select("*, queima_leituras(temperatura, registrado_em), queima_observacoes(texto, registrado_em)")
    .eq("forno_id", fornoId)
    .order("criado_em", { ascending: false })
    .overrideTypes<
      Array<{
        id: string;
        forno_id: FornoFisico;
        status: "andamento" | "finalizada" | "interrompida" | "cancelada";
        tipo: TipoQueima;
        tipo_descricao: string | null;
        categorias: ConteudoCategoria[];
        detalhes_conteudo: string | null;
        temperatura_inicial: number;
        temperatura_maxima: number;
        velocidade_aquecimento: number;
        tempo_patamar_min: number;
        velocidade_resfriamento: number;
        temperatura_segura: number;
        iniciado_em: string | null;
        finalizado_em: string | null;
        etapa_atual: EtapaQueimaDB;
        queima_leituras: { temperatura: number; registrado_em: string }[];
        queima_observacoes: { texto: string; registrado_em: string }[];
      }>,
      { merge: false }
    >();
  if (error) throw new Error(`Falha ao buscar fornadas do ${fornoId}: ${error.message}`);

  return (queimas ?? []).map((q) => ({
    id: q.id,
    fornoId: q.forno_id,
    tipo: q.tipo,
    tipoDescricao: q.tipo_descricao ?? "",
    categorias: q.categorias,
    detalhesConteudo: q.detalhes_conteudo ?? "",
    config: {
      temperaturaInicial: q.temperatura_inicial,
      temperaturaMaxima: q.temperatura_maxima,
      velocidadeAquecimento: q.velocidade_aquecimento,
      tempoPatamarMin: q.tempo_patamar_min,
      velocidadeResfriamento: q.velocidade_resfriamento,
      temperaturaSegura: q.temperatura_segura,
    },
    iniciadoEm: q.iniciado_em,
    finalizadoEm: q.finalizado_em,
    status: q.status,
    etapaAtual: q.etapa_atual,
    leituras: (q.queima_leituras ?? [])
      .map((l) => ({ temperatura: l.temperatura, em: l.registrado_em }))
      .sort((a, b) => a.em.localeCompare(b.em)),
    observacoes: (q.queima_observacoes ?? [])
      .map((o) => ({ em: o.registrado_em, texto: o.texto }))
      .sort((a, b) => a.em.localeCompare(b.em)),
  }));
}

/** Nova fornada nesse forno — se já tiver uma "em andamento" nele, ela
 *  vira "interrompida" primeiro (nunca apagada, mesma regra do demo). */
export async function iniciarFornada(
  fornoId: FornoFisico,
  dados: {
    tipo: TipoQueima;
    tipoDescricao: string;
    categorias: ConteudoCategoria[];
    detalhesConteudo: string;
    config: {
      temperaturaInicial: number;
      temperaturaMaxima: number;
      velocidadeAquecimento: number;
      tempoPatamarMin: number;
      velocidadeResfriamento: number;
      temperaturaSegura: number;
    };
  }
) {
  const supabase = createClient();

  const { error: interromperError } = await supabase
    .from("queimas")
    .update({ status: "interrompida", finalizado_em: new Date().toISOString() })
    .eq("forno_id", fornoId)
    .eq("status", "andamento");
  if (interromperError) throw new Error(`Falha ao interromper fornada anterior: ${interromperError.message}`);

  const { error } = await supabase.from("queimas").insert({
    forno_id: fornoId,
    status: "andamento",
    tipo: dados.tipo,
    tipo_descricao: dados.tipoDescricao || null,
    categorias: dados.categorias,
    detalhes_conteudo: dados.detalhesConteudo || null,
    temperatura_inicial: dados.config.temperaturaInicial,
    temperatura_maxima: dados.config.temperaturaMaxima,
    velocidade_aquecimento: dados.config.velocidadeAquecimento,
    tempo_patamar_min: dados.config.tempoPatamarMin,
    velocidade_resfriamento: dados.config.velocidadeResfriamento,
    temperatura_segura: dados.config.temperaturaSegura,
    etapa_atual: "aquecendo",
    iniciado_em: new Date().toISOString(),
  });
  if (error) throw new Error(`Falha ao criar fornada: ${error.message}`);

  revalidatePath("/forno");
}

/** Atualiza a temperatura real — vira o novo ponto de origem do cálculo de
 *  previsão (a mesma `calcularPrevisao`, ver src/lib/forno.ts, recalibra
 *  sozinha a partir de `temperatura_real`/`temperatura_real_em`; não criar
 *  lógica separada de "recalcular", CLAUDE.md §5 Forno). */
export async function atualizarTemperatura(queimaId: string, valor: number) {
  const supabase = createClient();
  const agora = new Date().toISOString();

  const { error: leituraError } = await supabase.from("queima_leituras").insert({ queima_id: queimaId, temperatura: valor, registrado_em: agora });
  if (leituraError) throw new Error(`Falha ao registrar leitura: ${leituraError.message}`);

  const { error: queimaError } = await supabase
    .from("queimas")
    .update({ temperatura_real: valor, temperatura_real_em: agora })
    .eq("id", queimaId);
  if (queimaError) throw new Error(`Falha ao atualizar temperatura: ${queimaError.message}`);

  revalidatePath("/forno");
}

export async function adicionarObservacao(queimaId: string, texto: string) {
  const supabase = createClient();
  const { error } = await supabase.from("queima_observacoes").insert({ queima_id: queimaId, texto });
  if (error) throw new Error(`Falha ao adicionar observação: ${error.message}`);
  revalidatePath("/forno");
}

export async function finalizarFornada(queimaId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("queimas")
    .update({ status: "finalizada", etapa_atual: "finalizada", finalizado_em: new Date().toISOString() })
    .eq("id", queimaId);
  if (error) throw new Error(`Falha ao finalizar fornada: ${error.message}`);
  revalidatePath("/forno");
}

/** Botão discreto, não um 4º botão grande (CLAUDE.md §5 Forno) — só muda
 *  `status`, nunca apaga, mesmo padrão de `finalizarFornada`. */
export async function cancelarFornada(queimaId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("queimas")
    .update({ status: "cancelada", finalizado_em: new Date().toISOString() })
    .eq("id", queimaId);
  if (error) throw new Error(`Falha ao cancelar fornada: ${error.message}`);
  revalidatePath("/forno");
}

/** Só mexe em categorias/detalhes — nunca em `config` (temperatura/tempo),
 *  que mudaria retroativamente a curva de previsão já em andamento
 *  (CLAUDE.md §5 Forno, "categoria de edição bem mais delicada"). */
export async function editarConteudo(queimaId: string, categorias: ConteudoCategoria[], detalhesConteudo: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("queimas")
    .update({ categorias, detalhes_conteudo: detalhesConteudo || null })
    .eq("id", queimaId);
  if (error) throw new Error(`Falha ao editar conteúdo: ${error.message}`);
  revalidatePath("/forno");
}
