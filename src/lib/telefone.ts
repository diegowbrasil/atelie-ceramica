// Compartilhado entre convite.ts ("use server") e login/page.tsx ("use
// client") — não pode morar dentro de convite.ts (mesma armadilha já
// documentada no CLAUDE.md: função pura exportada de um arquivo "use
// server" quebra o build assim que outro módulo tenta importá-la).

/** Formato exigido pelo Supabase Auth (E.164). A leva de dado real só tem
 *  telefone brasileiro sem código de país (ex: "(14) 99999-9999") — prefixa
 *  +55 quando o número dado ainda não inclui o DDI. */
export function normalizarTelefoneE164(tel: string): string {
  const digitos = tel.replace(/\D/g, "");
  if (digitos.startsWith("55") && digitos.length >= 12) return `+${digitos}`;
  return `+55${digitos}`;
}

/** Login "por telefone" sem depender do provider nativo de Phone do
 *  Supabase — descoberto ao vivo (2026-09-24) que habilitar Phone exige
 *  um provedor de SMS de verdade configurado (Twilio etc.), mesmo só
 *  pra auth por senha sem OTP nenhum. Em vez disso: e-mail SINTÉTICO
 *  derivado do telefone, nunca mostrado pro aluno (ele só digita o
 *  telefone, em qualquer tela) — por baixo é um login por e-mail comum,
 *  que já funciona sem configuração nenhuma. Determinístico: o mesmo
 *  telefone sempre gera o mesmo e-mail, então `aceitarConvite` (criação)
 *  e `login/page.tsx` (entrada) calculam o mesmo valor de forma
 *  independente sem precisar guardar nada a mais. */
export function emailSinteticoDoTelefone(tel: string): string {
  const digitos = normalizarTelefoneE164(tel).replace(/\D/g, "");
  return `${digitos}@aluno.mtcst.interno`;
}
