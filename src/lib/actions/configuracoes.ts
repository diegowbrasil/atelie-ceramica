"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Resultado } from "@/lib/resultado";

// Preços e chave Pix (atelie_config) — tela de Configurações. Escreve com
// o client normal: a RLS só libera admin, e a checagem abaixo dá a
// mensagem certa antes de chegar lá.

function lerPreco(texto: string): number | null {
  const n = Number(texto.replace(/[^\d,.]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 && n < 100000 ? Math.round(n * 100) / 100 : null;
}

export async function salvarConfigAtelie(dados: { pixChave: string; precoPacote: string; precoAvulsa: string }): Promise<Resultado> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Sua sessão expirou. Entre de novo." };
  const { data: perfil } = await supabase.from("profiles").select("role").eq("auth_user_id", user.id).maybeSingle();
  if (perfil?.role !== "admin") return { ok: false, erro: "Só admin pode fazer isso." };

  const pix = dados.pixChave.trim();
  if (pix.length > 140) return { ok: false, erro: "Chave Pix longa demais." };
  const precoPacote = lerPreco(dados.precoPacote);
  const precoAvulsa = lerPreco(dados.precoAvulsa);
  if (precoPacote === null) return { ok: false, erro: "Preço do pacote inválido — use só números, ex: 460." };
  if (precoAvulsa === null) return { ok: false, erro: "Preço da aula avulsa inválido — use só números, ex: 160." };

  const { data, error } = await supabase
    .from("atelie_config")
    .update({ pix_chave: pix || null, preco_pacote: precoPacote, preco_avulsa: precoAvulsa, atualizado_em: new Date().toISOString() })
    .eq("id", 1)
    .select("id");
  if (error) return { ok: false, erro: `Não deu pra salvar: ${error.message}` };
  if (!data?.length) return { ok: false, erro: "Configuração não encontrada — falta rodar o SQL de atelie_config." };

  revalidatePath("/", "layout");
  return { ok: true };
}
