import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Cliente com a service_role key — só pode rodar em Server Actions/Route
// Handlers, NUNCA em código que chega ao browser (a chave dá acesso total,
// ignora RLS). Reservado pra operações que realmente precisam ignorar RLS
// ou mexer em auth.users (ex: o primeiro admin, um futuro convite de aluno
// pra Área do Aluno) — "cadastrar aluno" comum NÃO usa isso, é só um
// insert direto em `profiles` (ver src/lib/actions/turmas.ts), já que
// `profiles` não exige mais conta de login por trás (schema.sql, decisão
// 2026-09-23: "precisa de email? nao pode ser um usuario?" — a primeira
// versão criava uma conta muda com e-mail inventado só pra satisfazer uma
// FK que não precisava mais existir).
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
