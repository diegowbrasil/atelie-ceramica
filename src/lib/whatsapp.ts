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

// Número real do ateliê (2026-09-29, informado pelo Diego: "+55 14
// 99725-7052") — dígitos só, formato que o wa.me exige (código do país +
// DDD + número, sem símbolo nenhum).
export const ATELIE_WHATSAPP = "5514997257052";

/** Direção oposta de mensagemCobranca — aluno avisando o ateliê que já
 *  pagou. Manda pro número FIXO do ateliê (2026-09-29: "na verdade já
 *  vai mandar para o whatsapp predeterminado"), não mais um wa.me
 *  genérico sem número.
 *
 *  Limitação real da plataforma, sem contorno possível: um link wa.me só
 *  consegue pré-preencher TEXTO — não existe parâmetro de URL (nem API de
 *  navegador nenhuma) que anexe um ARQUIVO a uma conversa de um número
 *  específico. `navigator.share({files})` até anexa arquivo de verdade,
 *  mas só abrindo a folha de compartilhar do sistema, sem escolher o
 *  destinatário por código — as duas coisas (número fixo + anexo
 *  automático) não dão pra ter juntas a partir da web. Prioriza o número
 *  certo (pedido explícito do Diego); a pessoa anexa a foto na conversa
 *  que abre, um toque a mais dentro do próprio WhatsApp. */
export function mensagemComprovante(descricao: string | null, valor: number | null) {
  return `Olá! Fiz o pagamento${descricao ? ` — ${descricao}` : ""}${valor != null ? `, no valor de R$ ${valor}` : ""}. Segue o comprovante!`;
}

export function abrirWhatsAppComprovante(descricao: string | null, valor: number | null) {
  window.open(`https://wa.me/${ATELIE_WHATSAPP}?text=${encodeURIComponent(mensagemComprovante(descricao, valor))}`, "_blank");
}
