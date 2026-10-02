// Em produção o Next.js troca a mensagem de qualquer erro LANÇADO por uma
// Server Action por um texto genérico em inglês ("An error occurred in the
// Server Components render...") — achado testando um build de produção
// (2026-10-02); em `next dev` a mensagem real aparece e esconde o problema.
// Por isso erro esperado (validação, regra de negócio) volta como VALOR,
// nunca com `throw`.
export type Resultado<T extends object = object> = ({ ok: true } & T) | { ok: false; erro: string };

const MENSAGEM_ESCONDIDA_PELO_NEXT = "An error occurred in the Server Components render";

/** Pro `catch` no client: erro inesperado (rede, banco fora do ar) ainda
 *  chega lançado — em produção com o texto genérico em inglês, que nunca
 *  deve aparecer pra Hanna nem pros alunos. */
export function mensagemDeErro(e: unknown, padrao: string): string {
  const mensagem = e instanceof Error ? e.message : "";
  return !mensagem || mensagem.startsWith(MENSAGEM_ESCONDIDA_PELO_NEXT) ? padrao : mensagem;
}
