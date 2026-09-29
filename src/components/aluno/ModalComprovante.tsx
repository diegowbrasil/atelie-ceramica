"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { PIX_CHAVE, abrirWhatsAppComprovante } from "@/lib/whatsapp";
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
}

export function ModalComprovante({ pagamento, onClose }: Props) {
  const [copiado, setCopiado] = useState(false);

  async function copiarChave() {
    try {
      await navigator.clipboard.writeText(PIX_CHAVE);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // clipboard pode falhar sem permissão/HTTPS — a chave já está
      // visível na tela pra copiar na mão, não precisa travar o fluxo.
    }
  }

  function enviar() {
    abrirWhatsAppComprovante(pagamento.descricao, pagamento.valor);
    onClose();
  }

  return (
    <Modal onClose={onClose}>
      <h3 className="mb-1 text-base font-semibold text-ink">{pagamento.descricao ?? "Pagamento pendente"}</h3>
      {pagamento.valor != null && <p className="mb-4 text-2xl font-semibold text-ink">R$ {pagamento.valor}</p>}

      <div className="mb-4 rounded-xl border border-line bg-cream p-3">
        <p className="mb-1 text-xs font-medium text-ink-soft">Chave Pix do ateliê</p>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-ink">{PIX_CHAVE}</span>
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
