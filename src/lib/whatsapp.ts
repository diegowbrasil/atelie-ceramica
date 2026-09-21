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
