"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { enviarComprovantePagamento } from "@/lib/actions/alunoPortal";
import { PIX_CHAVE } from "@/lib/whatsapp";
import { Copy, Check, Upload } from "lucide-react";

// Fluxo pedido pelo Diego (2026-09-25): clicar no "Pendente" mostra o
// valor + chave Pix, aluno paga por fora do app (não processamos
// pagamento nenhum aqui) e sobe o comprovante — vira signed URL privada
// que só o admin consegue abrir (ver getUrlComprovante em
// actions/pagamentos.ts).

interface Props {
  pagamento: { id: string; descricao: string | null; valor: number | null };
  onClose: () => void;
}

export function ModalComprovante({ pagamento, onClose }: Props) {
  const router = useRouter();
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
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

  async function enviar() {
    if (!arquivo) return;
    setEnviando(true);
    setErro(null);
    try {
      const formData = new FormData();
      formData.set("arquivo", arquivo);
      formData.set("pagamentoId", pagamento.id);
      await enviarComprovantePagamento(formData);
      setEnviado(true);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu pra enviar o comprovante. Tenta de novo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      {enviado ? (
        <>
          <h3 className="mb-1 text-base font-semibold text-ink">Comprovante enviado!</h3>
          <p className="mb-4 text-sm text-ink-soft">O ateliê vai conferir e confirmar seu pagamento em breve.</p>
          <button onClick={onClose} className="w-full rounded-xl bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover">
            Fechar
          </button>
        </>
      ) : (
        <>
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

          <p className="mb-2 text-xs font-medium text-ink-soft">Depois de pagar, envie o comprovante</p>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
            className="mb-3 w-full text-xs text-ink-soft file:mr-3 file:rounded-lg file:border file:border-line file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ink"
          />

          {erro && <p className="mb-3 text-sm text-rose-500">{erro}</p>}

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink">
              Cancelar
            </button>
            <button
              disabled={!arquivo || enviando}
              onClick={enviar}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
            >
              <Upload size={14} />
              {enviando ? "Enviando…" : "Enviar comprovante"}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
