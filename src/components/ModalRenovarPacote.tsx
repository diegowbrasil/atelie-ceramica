"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useConfigAtelie } from "@/components/ConfigAtelieProvider";
import { RENOVACAO, formatarReais, precoDe, type TipoRenovacao } from "@/lib/pacotes";
import type { Resultado } from "@/lib/resultado";
import { mensagemDeErro } from "@/lib/resultado";

// Mesmo modal pros dois lados (aluno na Minha Turma, admin na página do
// aluno) — muda só o texto e a ação chamada.
export function ModalRenovarPacote({
  titulo,
  explicacao,
  onConfirmar,
  onClose,
}: {
  titulo: string;
  explicacao: string;
  onConfirmar: (tipo: TipoRenovacao) => Promise<Resultado<object>>;
  onClose: () => void;
}) {
  const config = useConfigAtelie();
  const [tipo, setTipo] = useState<TipoRenovacao>("pacote");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function confirmar() {
    setEnviando(true);
    setErro(null);
    try {
      const r = await onConfirmar(tipo);
      if (!r.ok) setErro(r.erro);
    } catch (e) {
      setErro(mensagemDeErro(e, "Não deu pra renovar. Tenta de novo."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <h3 className="mb-1 text-base font-semibold text-ink">{titulo}</h3>
      <p className="mb-4 text-sm text-ink-soft">{explicacao}</p>

      <div className="mb-4 space-y-2" role="radiogroup" aria-label="Escolha o pacote">
        {(Object.keys(RENOVACAO) as TipoRenovacao[]).map((t) => {
          const ativo = tipo === t;
          return (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={ativo}
              onClick={() => setTipo(t)}
              className={
                "flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-colors " +
                (ativo ? "border-accent bg-accent-soft" : "border-line bg-white hover:border-ink-soft")
              }
            >
              <span>
                <span className="block text-sm font-semibold text-ink">{RENOVACAO[t].descricao}</span>
                <span className="text-xs text-ink-soft">
                  {RENOVACAO[t].aulas === 1 ? "Uma aula, sem pacote" : `${formatarReais(precoDe(t, config) / RENOVACAO[t].aulas)} por aula`}
                </span>
              </span>
              <span className={"text-base font-semibold " + (ativo ? "text-accent" : "text-ink")}>{formatarReais(precoDe(t, config))}</span>
            </button>
          );
        })}
      </div>

      {erro && <p className="mb-3 text-sm text-rose-600">{erro}</p>}

      <div className="flex gap-2">
        <button onClick={onClose} disabled={enviando} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink disabled:opacity-60">
          Cancelar
        </button>
        <button onClick={confirmar} disabled={enviando} className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60">
          {enviando ? "Renovando…" : "Renovar"}
        </button>
      </div>
    </Modal>
  );
}
