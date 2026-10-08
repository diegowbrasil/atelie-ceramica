"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { abrirWhatsAppComprovante } from "@/lib/whatsapp";
import { useConfigAtelie } from "@/components/ConfigAtelieProvider";
import { Copy, Check, MessageCircle } from "lucide-react";

// Fluxo pedido pelo Diego (2026-09-25, refeito 2026-09-29): clicar no
// "Pendente" mostra o valor + chave Pix; aluno paga por fora do app (não
// processamos pagamento nenhum aqui) e manda o comprovante direto pelo
// WhatsApp do ateliê (número fixo, ver ATELIE_WHATSAPP em
// lib/whatsapp.ts) — sem seletor de arquivo aqui dentro: não existe forma
// de anexar automaticamente a uma conversa de um número específico a
// partir de uma página web (limitação real da plataforma), então o
// upload só criava um passo que não levava a nada — a pessoa anexa a
// foto direto no WhatsApp, que já abre com a mensagem pronta.

interface Props {
  pagamento: { id: string; descricao: string | null; valor: number | null };
  onClose: () => void;
  /** Opcional — chamado junto com o envio (2026-09-29), hoje só usado
   *  pela auto-inscrição de oficina pra marcar comprovante_enviado_em
   *  (trava o cancelamento depois disso). Fire-and-forget, mesmo padrão
   *  não-bloqueante do resto desta função — o WhatsApp abrindo é a ação
   *  principal, não precisa esperar nada pra fechar o modal. */
  onEnviar?: () => void;
}

export function ModalComprovante({ pagamento, onClose, onEnviar }: Props) {
  const [copiado, setCopiado] = useState(false);
  const { pixChave } = useConfigAtelie();

  async function copiarChave() {
    if (!pixChave) return;
    try {
      await navigator.clipboard.writeText(pixChave);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // clipboard pode falhar sem permissão/HTTPS — a chave já está
      // visível na tela pra copiar na mão, não precisa travar o fluxo.
    }
  }

  function enviar() {
    abrirWhatsAppComprovante(pagamento.descricao, pagamento.valor);
    onEnviar?.();
    onClose();
  }

  return (
    <Modal onClose={onClose}>
      <h3 className="mb-1 text-base font-semibold text-ink">{pagamento.descricao ?? "Pagamento pendente"}</h3>
      {pagamento.valor != null && <p className="mb-4 text-2xl font-semibold text-ink">R$ {pagamento.valor}</p>}

      {pixChave ? (
        <>
          <div className="mb-4 rounded-xl border border-line bg-cream p-3">
            <p className="mb-1 text-xs font-medium text-ink-soft">Chave Pix do ateliê</p>
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-ink">{pixChave}</span>
              <button
                onClick={copiarChave}
                className="flex shrink-0 items-center gap-1 rounded-lg border border-line bg-white px-2 py-1 text-xs font-medium text-ink hover:bg-cream"
              >
                {copiado ? <Check size={13} /> : <Copy size={13} />}
                {copiado ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>
          <p className="mb-4 text-sm text-ink-soft">Depois de pagar, envie o comprovante para:</p>
        </>
      ) : (
        <p className="mb-4 text-sm text-ink-soft">Chama o ateliê no WhatsApp pra combinar o pagamento. Depois é só mandar o comprovante na mesma conversa.</p>
      )}

      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink">
          Cancelar
        </button>
        <button
          onClick={enviar}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <MessageCircle size={14} />
          WhatsApp do ateliê
        </button>
      </div>
    </Modal>
  );
}
