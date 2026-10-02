"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { planejarLembretes, enviarModeloWhatsApp, whatsappConfigurado, type LembretePlanejado } from "@/lib/lembretesServidor";
import { primeiroNome, telefoneParaWhatsApp } from "@/lib/lembretes";
import type { Resultado } from "@/lib/resultado";
import type { LembreteEnviado, LembretesModo } from "@/types/database";

// Lado do admin dos lembretes por WhatsApp (tela de Configurações). A
// prévia e o envio de teste usam service_role por dentro
// (lembretesServidor.ts), por isso todas checam admin em código antes.

async function exigirAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");
  const { data: perfil } = await supabase.from("profiles").select("nome, role").eq("auth_user_id", user.id).maybeSingle();
  if (perfil?.role !== "admin") throw new Error("Só admin pode fazer isso.");
  return { supabase, nome: perfil.nome };
}

export interface PainelLembretes {
  /** false = as tabelas dos lembretes ainda não foram criadas no banco. */
  instalado: boolean;
  apiConfigurada: boolean;
  agendamentoConfigurado: boolean;
  modo: LembretesModo;
  numeroTeste: string;
  ultimosEnvios: Pick<LembreteEnviado, "id" | "tipo" | "data_referencia" | "nome" | "status" | "erro">[];
}

export async function getLembretesPainel(): Promise<PainelLembretes> {
  const { supabase } = await exigirAdmin();
  const base = { apiConfigurada: whatsappConfigurado(), agendamentoConfigurado: !!process.env.CRON_SECRET };

  const [{ data: config, error: eConfig }, { data: envios, error: eEnvios }] = await Promise.all([
    supabase.from("lembretes_config").select("modo, numero_teste").eq("id", 1).maybeSingle(),
    supabase.from("lembretes_enviados").select("id, tipo, data_referencia, nome, status, erro").order("criado_em", { ascending: false }).limit(30),
  ]);
  // Tabelas ainda não criadas: a tela mostra o aviso em vez de derrubar a
  // página inteira (mesma lição do crash de comprovante_url no Dashboard).
  if (eConfig || eEnvios) return { ...base, instalado: false, modo: "desligado", numeroTeste: "", ultimosEnvios: [] };

  return { ...base, instalado: true, modo: config?.modo ?? "desligado", numeroTeste: config?.numero_teste ?? "", ultimosEnvios: envios ?? [] };
}

export async function salvarConfigLembretes(dados: { modo: LembretesModo; numeroTeste: string }): Promise<Resultado> {
  const { supabase } = await exigirAdmin();
  const numero = dados.numeroTeste.trim();
  if (numero && !telefoneParaWhatsApp(numero)) return { ok: false, erro: "Número de teste inválido — use DDD + número, ex: (14) 99999-9999." };
  if (dados.modo === "teste" && !numero) return { ok: false, erro: "Pra usar o modo teste, cadastre antes o número de teste." };

  const { error } = await supabase
    .from("lembretes_config")
    .update({ modo: dados.modo, numero_teste: numero || null, atualizado_em: new Date().toISOString() })
    .eq("id", 1);
  if (error) return { ok: false, erro: `Não deu pra salvar: ${error.message}` };
  revalidatePath("/configuracoes");
  return { ok: true };
}

export async function previaLembretes(dataISO: string): Promise<Resultado<{ lembretes: LembretePlanejado[] }>> {
  await exigirAdmin();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataISO)) return { ok: false, erro: "Data inválida." };
  return { ok: true, lembretes: await planejarLembretes(dataISO) };
}

/** Manda os 2 modelos, com dados de exemplo, só pro número de teste —
 *  confere de uma vez se a conta da Meta, o token e os 2 textos aprovados
 *  estão certos, sem esperar o cron das 8h nem tocar em aluno nenhum. */
export async function enviarTesteAgora(): Promise<Resultado<{ resultados: { tipo: string; ok: boolean; erro?: string }[] }>> {
  const { supabase, nome } = await exigirAdmin();
  const { data: config } = await supabase.from("lembretes_config").select("numero_teste").eq("id", 1).maybeSingle();
  const destino = telefoneParaWhatsApp(config?.numero_teste);
  if (!destino) return { ok: false, erro: "Salve um número de teste primeiro." };

  const quem = primeiroNome(nome);
  const [aula, oficina] = await Promise.all([
    enviarModeloWhatsApp(destino, "aula", [quem, "terça", "18:30 às 20:30"]),
    enviarModeloWhatsApp(destino, "oficina", [quem, "Kit Café da Manhã", "16:00", "Levar avental, toalha e muita criatividade!"]),
  ]);
  return {
    ok: true,
    resultados: [
      { tipo: "Aula", ok: aula.ok, erro: aula.ok ? undefined : aula.erro },
      { tipo: "Oficina", ok: oficina.ok, erro: oficina.ok ? undefined : oficina.erro },
    ],
  };
}
