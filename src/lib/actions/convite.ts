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
import type { Resultado } from "@/lib/resultado";

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

export async function aceitarConvite(token: string, senha: string): Promise<{ ok: true; role: "admin" | "aluno" } | { ok: false; erro: string }> {
  if (senha.length < 6) return { ok: false, erro: "A senha precisa ter pelo menos 6 caracteres." };

  const admin = createAdminClient();
  const { data: perfil } = await admin
    .from("profiles")
    .select("id, role, telefone, email, convite_expira_em, auth_user_id")
    .eq("convite_token", token)
    .maybeSingle();
  if (!perfil) return { ok: false, erro: "Convite inválido." };
  if (perfil.auth_user_id) return { ok: false, erro: "Essa conta já foi ativada — faça login normalmente." };
  if (!perfil.convite_expira_em || new Date(perfil.convite_expira_em) < new Date()) return { ok: false, erro: "Esse link expirou — peça um convite novo no ateliê." };

  // Admin loga com e-mail de verdade (digitado na hora de convidar);
  // aluno loga com telefone por baixo de um e-mail sintético (a leva de
  // dado real nunca trouxe e-mail de aluno — ver comentário no topo do
  // arquivo). Mesmo convite/token pros dois papéis, só a origem do
  // e-mail muda.
  const ehAdmin = perfil.role === "admin";
  if (ehAdmin && !perfil.email) return { ok: false, erro: "Esse cadastro não tem e-mail. Peça pro ateliê gerar o convite de novo." };
  if (!ehAdmin && !perfil.telefone) return { ok: false, erro: "Esse cadastro não tem telefone. Peça pro ateliê adicionar antes de tentar de novo." };
  const emailLogin = ehAdmin ? perfil.email! : emailSinteticoDoTelefone(perfil.telefone!);

  const { data: novoUsuario, error: criarError } = await admin.auth.admin.createUser({
    email: emailLogin,
    password: senha,
    email_confirm: true,
  });
  if (criarError) return { ok: false, erro: `Falha ao criar acesso: ${criarError.message}` };

  const { error: linkError } = await admin
    .from("profiles")
    .update({ auth_user_id: novoUsuario.user.id, convite_token: null, convite_expira_em: null })
    .eq("id", perfil.id);
  if (linkError) return { ok: false, erro: `Falha ao vincular conta: ${linkError.message}` };

  // Assina a pessoa de verdade na mesma ida — `createClient()` (não o
  // admin) escreve os cookies de sessão certos porque roda dentro do
  // mesmo request desta Server Action, evitando uma segunda ida à tela
  // de login logo depois de criar a conta.
  const cliente = await createClient();
  const { error: loginError } = await cliente.auth.signInWithPassword({ email: emailLogin, password: senha });
  if (loginError) return { ok: false, erro: `Conta criada, mas o login automático falhou — entre pela tela de login. (${loginError.message})` };

  return { ok: true, role: ehAdmin ? "admin" : "aluno" };
}

/** Convida um novo admin (2026-09-30, pedido do Diego — antes só existia
 *  convite pra aluno). Mesmo mecanismo (token/expiração em `profiles`),
 *  só que aqui a Server Action TAMBÉM cria o cadastro (aluno já tem o
 *  cadastro feito na hora da matrícula; admin não tem esse passo
 *  anterior). Usa o client normal (RLS), não service_role — a policy
 *  `profiles_admin_insert` (`is_admin() or auth_user_id = auth.uid()`)
 *  já garante que só um admin logado consegue criar outro admin; ninguém
 *  não-admin passa por aqui mesmo chamando a action direto. Reenviar pra
 *  um e-mail com convite ainda pendente atualiza o mesmo cadastro (token
 *  novo) em vez de duplicar linha. */
export async function convidarAdmin(dados: { nome: string; email: string }): Promise<Resultado<{ token: string }>> {
  const supabase = await createClient();
  const email = dados.email.trim().toLowerCase();
  if (!email.includes("@")) return { ok: false, erro: "E-mail inválido." };

  const { data: existente } = await supabase.from("profiles").select("id, auth_user_id").eq("email", email).eq("role", "admin").maybeSingle();
  if (existente?.auth_user_id) return { ok: false, erro: "Já existe uma conta admin ativa com esse e-mail." };

  const token = crypto.randomUUID();
  const expiraEm = new Date(Date.now() + CONVITE_VALIDADE_DIAS * 24 * 3600 * 1000).toISOString();

  if (existente) {
    const { error } = await supabase.from("profiles").update({ nome: dados.nome, convite_token: token, convite_expira_em: expiraEm }).eq("id", existente.id);
    if (error) return { ok: false, erro: `Não deu pra reenviar o convite: ${error.message}` };
  } else {
    const { error } = await supabase.from("profiles").insert({ role: "admin", nome: dados.nome, email, convite_token: token, convite_expira_em: expiraEm });
    if (error) return { ok: false, erro: `Não deu pra convidar: ${error.message}` };
  }

  revalidatePath("/configuracoes");
  return { ok: true, token };
}

export interface AdminInfo {
  id: string;
  nome: string;
  email: string | null;
  status: "ativo" | "pendente" | "expirado";
}

export async function listarAdmins(): Promise<AdminInfo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("id, nome, email, auth_user_id, convite_expira_em").eq("role", "admin").order("nome");
  if (error) throw new Error(`Falha ao buscar admins: ${error.message}`);
  return (data ?? []).map((p): AdminInfo => ({
    id: p.id,
    nome: p.nome,
    email: p.email,
    status: p.auth_user_id ? "ativo" : p.convite_expira_em && new Date(p.convite_expira_em) > new Date() ? "pendente" : "expirado",
  }));
}

/** Remove um admin — apaga o cadastro E o acesso de login (diferente de
 *  excluirAluno, que só apaga `profiles`; aqui vale a pena fechar a
 *  conta de verdade, não só tirar da lista, já que é acesso
 *  administrativo). Duas travas que só fazem sentido pra admin (nenhuma
 *  tem equivalente do lado aluno): não dá pra remover a si mesmo (evita
 *  se trancar fora sem querer) nem remover o ÚLTIMO admin (evita
 *  ninguém mais conseguir entrar na área administrativa). */
export async function removerAdmin(adminId: string): Promise<Resultado> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Sua sessão expirou — entre de novo." };

  const { data: eu } = await supabase.from("profiles").select("id, role").eq("auth_user_id", user.id).maybeSingle();
  if (eu?.role !== "admin") return { ok: false, erro: "Só admin pode fazer isso." };
  if (eu.id === adminId) return { ok: false, erro: "Você não pode remover a própria conta por aqui." };

  const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin");
  if ((count ?? 0) <= 1) return { ok: false, erro: "Esse é o único admin — não dá pra remover." };

  const admin = createAdminClient();
  const { data: alvo } = await admin.from("profiles").select("auth_user_id").eq("id", adminId).maybeSingle();
  if (alvo?.auth_user_id) await admin.auth.admin.deleteUser(alvo.auth_user_id);
  const { error } = await admin.from("profiles").delete().eq("id", adminId);
  if (error) return { ok: false, erro: `Não deu pra remover: ${error.message}` };

  revalidatePath("/configuracoes");
  return { ok: true };
}
