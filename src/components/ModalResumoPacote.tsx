"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useConfigAtelie } from "@/components/ConfigAtelieProvider";
import { getResumoPacote } from "@/lib/actions/renovacao";
import { mensagemPacoteFechado } from "@/lib/whatsapp";
import { mensagemDeErro } from "@/lib/resultado";

// "Pacote fechou" (2026-10-08): abre sozinho quando a Hanna marca a
// presença que fecha o pacote (Turmas) e também pelo botão na página do
// aluno. Manda pelo WhatsApp DELA (wa.me), sem custo — quando o número de
// avisos estiver configurado na Meta, isso pode virar automático.
export function ModalResumoPacote({ alunoId, titulo, onClose }: { alunoId: string; titulo: string; onClose: () => void }) {
  const config = useConfigAtelie();
  const [texto, setTexto] = useState<string | null>(null);
  const [telefone, setTelefone] = useState<string | null>(null);
  const [semData, setSemData] = useState(0);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    getResumoPacote(alunoId)
      .then((r) => {
        if (!ativo) return;
        if (!r.ok) return setErro(r.erro);
        setTelefone(r.resumo.telefoneWhatsApp);
        setSemData(r.resumo.aulasUsadas - r.resumo.datas.length);
        setTexto(mensagemPacoteFechado(r.resumo, config));
      })
      .catch((e) => ativo && setErro(mensagemDeErro(e, "Não deu pra montar o resumo. Tenta de novo.")));
    return () => {
      ativo = false;
    };
    // Campos soltos (não o objeto): o router.refresh() logo depois de
    // marcar presença recria o objeto do contexto e, com ele na lista,
    // o texto que a Hanna já estivesse editando seria sobrescrito.
  }, [alunoId, config.pixChave, config.precoPacote, config.precoAvulsa]);

  function enviar() {
    if (!texto) return;
    window.open(`https://wa.me/${telefone ?? ""}?text=${encodeURIComponent(texto)}`, "_blank");
    onClose();
  }

  return (
    <Modal onClose={onClose}>
      <h3 className="mb-1 text-base font-semibold text-ink">{titulo}</h3>
      <p className="mb-3 text-sm text-ink-soft">Mensagem pronta pra mandar pelo seu WhatsApp (dá pra editar):</p>

      {erro ? (
        <p className="mb-4 text-sm text-rose-600">{erro}</p>
      ) : texto === null ? (
        <p className="mb-4 text-sm text-ink-soft">Montando o resumo…</p>
      ) : (
        <>
          {semData > 0 && (
            <p className="mb-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
              Falta a data de {semData === 1 ? "1 aula" : `${semData} aulas`}: foi antes de o app registrar presença. Procure o dia e complete em
              &quot;Suas aulas&quot; antes de mandar.
            </p>
          )}
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={10}
            aria-label="Mensagem"
            className="mb-3 w-full resize-y rounded-xl border border-line bg-cream p-3 text-sm text-ink outline-none focus:border-ink"
          />
          {!telefone && <p className="mb-3 text-xs text-ink-soft">Sem telefone cadastrado: o WhatsApp abre pra você escolher o contato.</p>}
        </>
      )}

      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink">
          Agora não
        </button>
        <button
          onClick={enviar}
          disabled={!texto}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          <MessageCircle size={14} /> Mandar no WhatsApp
        </button>
      </div>
    </Modal>
  );
}
