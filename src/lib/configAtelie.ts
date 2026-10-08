import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { CONFIG_PADRAO, type ConfigAtelie } from "@/lib/pacotes";

// Só servidor (sem "use server" — não é uma Server Action). Lê com
// service_role porque também roda dentro da renovação feita pelo aluno, e
// o preço cobrado tem que vir daqui, nunca do navegador. Não é dado
// sensível: qualquer pessoa logada já pode ler pela RLS.
export const getConfigAtelie = cache(async (): Promise<ConfigAtelie> => {
  const { data, error } = await createAdminClient().from("atelie_config").select("pix_chave, preco_pacote, preco_avulsa").eq("id", 1).maybeSingle();
  // Tabela ainda não criada: segue com os preços padrão e sem chave Pix.
  if (error || !data) return CONFIG_PADRAO;
  return {
    instalado: true,
    pixChave: data.pix_chave?.trim() || null,
    precoPacote: Number(data.preco_pacote),
    precoAvulsa: Number(data.preco_avulsa),
  };
});
