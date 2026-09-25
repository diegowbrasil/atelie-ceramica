"use server";

// Convite pra Área do Aluno (2026-09-24, decisão do Diego: "convite por
// telefone/nome" — admin já cadastrou nome+telefone quando matriculou o
// aluno, ninguém precisa recadastrar nada; o aluno só define a própria
// senha depois, via link, e isso LIGA a conta nova ao profile que já
// existe). Token/expiração vivem em `profiles` (schema.sql), verificados
// inteiramente em código com service_role — de propósito, não abre
// nenhuma policy de leitura pública em `profiles` pra isso (ver comentário
// lá).
//
// Login "por telefone" pro aluno — a leva de dado real nunca trouxe
// e-mail de aluno nenhum, só telefone (às vezes nem isso). **NÃO usa o
// provider nativo de Phone do Supabase** — achado ao vivo (2026-09-24)
// que habilitar Phone no painel exige um provedor de SMS de verdade
// configurado (Twilio Account SID/Auth Token/Message Service SID), até
// pra auth só por senha sem NENHUM OTP envolvido — não dava pra
// contornar só desligando "phone confirmations". Em vez disso: e-mail
// SINTÉTICO derivado do telefone (`emailSinteticoDoTelefone`, src/lib/
// telefone.ts), nunca exposto pro aluno — por baixo é um login por
// e-mail comum, que já funciona sem configuração nenhuma no painel. A
// "verificação" de posse do número continua sendo o link de convite em
// si, não um OTP.

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { emailSinteticoDoTelefone } from "@/lib/telefone";

const CONVITE_VALIDADE_DIAS = 7;

export async function gerarConvite(alunoId: string): Promise<{ token: string; expiraEm: string }> {
  const supabase = await createClient();

  const { data: perfil, error: perfilError } = await supabase.from("profiles").select("auth_user_id, telefone").eq("id", alunoId).single();
  if (perfilError) throw new Error(`Falha ao buscar aluno: ${perfilError.message}`);
  if (perfil.auth_user_id) throw new Error("Esse aluno já tem conta ativa — não precisa de convite novo.");
  if (!perfil.telefone) throw new Error("Cadastre um telefone pra esse aluno antes de convidar.");

  const token = crypto.randomUUID();
  const expiraEm = new Date(Date.now() + CONVITE_VALIDADE_DIAS * 24 * 3600 * 1000).toISOString();
  const { error } = await supabase.from("profiles").update({ convite_token: token, convite_expira_em: expiraEm }).eq("id", alunoId);
  if (error) throw new Error(`Falha ao gerar convite: ${error.message}`);

  revalidatePath(`/alunos/${alunoId}`);
  return { token, expiraEm };
}

export interface ConviteInfo {
  nome: string;
}

/** Chamada pela página pública /convite/[token] — sem sessão nenhuma,
 *  por isso service_role (só essa Server Action lê `profiles` sem RLS;
 *  devolve só o nome, nada mais do profile). */
export async function verificarConvite(token: string): Promise<ConviteInfo | null> {
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("nome, convite_expira_em, auth_user_id").eq("convite_token", token).maybeSingle();
  if (!data || data.auth_user_id) return null;
  if (!data.convite_expira_em || new Date(data.convite_expira_em) < new Date()) return null;
  return { nome: data.nome };
}

export async function aceitarConvite(token: string, senha: string): Promise<{ ok: true } | { ok: false; erro: string }> {
  if (senha.length < 6) return { ok: false, erro: "A senha precisa ter pelo menos 6 caracteres." };

  const admin = createAdminClient();
  const { data: perfil } = await admin
    .from("profiles")
    .select("id, telefone, convite_expira_em, auth_user_id")
    .eq("convite_token", token)
    .maybeSingle();
  if (!perfil) return { ok: false, erro: "Convite inválido." };
  if (perfil.auth_user_id) return { ok: false, erro: "Essa conta já foi ativada — faça login normalmente." };
  if (!perfil.convite_expira_em || new Date(perfil.convite_expira_em) < new Date()) return { ok: false, erro: "Esse link expirou — peça um convite novo no ateliê." };
  if (!perfil.telefone) return { ok: false, erro: "Esse cadastro não tem telefone. Peça pro ateliê adicionar antes de tentar de novo." };

  const emailSintetico = emailSinteticoDoTelefone(perfil.telefone);

  const { data: novoUsuario, error: criarError } = await admin.auth.admin.createUser({
    email: emailSintetico,
    password: senha,
    email_confirm: true,
  });
  if (criarError) return { ok: false, erro: `Falha ao criar acesso: ${criarError.message}` };

  const { error: linkError } = await admin
    .from("profiles")
    .update({ auth_user_id: novoUsuario.user.id, convite_token: null, convite_expira_em: null })
    .eq("id", perfil.id);
  if (linkError) return { ok: false, erro: `Falha ao vincular conta: ${linkError.message}` };

  // Assina o aluno de verdade na mesma ida — `createClient()` (não o
  // admin) escreve os cookies de sessão certos porque roda dentro do
  // mesmo request desta Server Action, evitando uma segunda ida à tela
  // de login logo depois de criar a conta.
  const cliente = await createClient();
  const { error: loginError } = await cliente.auth.signInWithPassword({ email: emailSintetico, password: senha });
  if (loginError) return { ok: false, erro: `Conta criada, mas o login automático falhou — entre pela tela de login. (${loginError.message})` };

  return { ok: true };
}
