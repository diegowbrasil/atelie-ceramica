"use server";

// Camada real de dados pros Avisos — leitura + mutações (Server Actions).
// Ligada desde 2026-09-24 (dashboard/page.tsx busca no servidor, passa
// pra AvisosCard como prop). Schema já tinha tudo que a UI precisa desde
// a Fase 1, nenhum gap achado aqui (diferente dos outros domínios).

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { AvisoDestinatario } from "@/types/database";

export interface AvisoReal {
  id: string;
  texto: string;
  destinatario: AvisoDestinatario;
}

/** RLS já filtra pelo destinatário certo (admin vê os dois; visão de
 *  aluno, quando existir, só veria "alunos") — só pede os ativos. */
export async function getAvisosReal(): Promise<AvisoReal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("avisos")
    .select("id, texto, destinatario")
    .eq("ativo", true)
    .order("criado_em", { ascending: false });
  if (error) throw new Error(`Falha ao buscar avisos: ${error.message}`);
  return data ?? [];
}

export async function criarAviso(texto: string, destinatario: AvisoDestinatario) {
  const supabase = await createClient();
  const { error } = await supabase.from("avisos").insert({ texto, destinatario });
  if (error) throw new Error(`Falha ao criar aviso: ${error.message}`);
  revalidatePath("/dashboard");
}

/** Nunca apaga de verdade — só desativa (mesmo padrão de "nunca apagar
 *  sem confirmar" do resto do app; aqui nem pede confirmação porque
 *  remover um aviso já é reversível: basta criar de novo). */
export async function removerAviso(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("avisos").update({ ativo: false }).eq("id", id);
  if (error) throw new Error(`Falha ao remover aviso: ${error.message}`);
  revalidatePath("/dashboard");
}
