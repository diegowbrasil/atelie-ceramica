// Compartilhado entre Alunos (AlunoDetalhe) e Pagamentos — extraído do demo
// (mensagemCobranca/abrirWhatsAppCobranca), mesma correção já aplicada lá:
// "valor: R$ {valor}" só entra na mensagem quando valor não é null (a leva
// de dados reais nunca informou valor, então isso saía "R$ null" antes).

export const PIX_CHAVE = "ateliedeceramica@pix.com.br";

export function mensagemCobranca(nome: string, valor: number | null) {
  return `Oi ${nome.split(" ")[0]}! Vi que seu pacote de cerâmica foi finalizado 😊 Quer renovar? Segue a chave Pix: ${PIX_CHAVE}${valor != null ? ` — valor: R$ ${valor}` : ""}. Qualquer dúvida me chama por aqui!`;
}

export function abrirWhatsAppCobranca(telefone: string | null | undefined, nome: string, valor: number | null) {
  window.open(`https://wa.me/${telefone || ""}?text=${encodeURIComponent(mensagemCobranca(nome, valor))}`, "_blank");
}

/** Direção oposta de mensagemCobranca — aluno avisando o ateliê que já
 *  pagou (2026-09-29, pedido do Diego). `wa.me/?text=...` sem número:
 *  o ateliê ainda não tem um WhatsApp cadastrado no app, então abre o
 *  WhatsApp com a mensagem pronta e deixa a PESSOA escolher o contato
 *  (mesmo comportamento de um botão de compartilhar). */
export function mensagemComprovante(descricao: string | null, valor: number | null) {
  return `Olá! Fiz o pagamento${descricao ? ` — ${descricao}` : ""}${valor != null ? `, no valor de R$ ${valor}` : ""}. Segue o comprovante!`;
}

export function abrirWhatsAppComprovante(descricao: string | null, valor: number | null) {
  window.open(`https://wa.me/?text=${encodeURIComponent(mensagemComprovante(descricao, valor))}`, "_blank");
}
