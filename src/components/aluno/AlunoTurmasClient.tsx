"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { TURMA_LABEL_COR, type CorIdentidade } from "@/lib/alunos";
import { solicitarVaga, cancelarSolicitacao, type TurmaParaAluno } from "@/lib/actions/alunoPortal";
import { Clock, Send } from "lucide-react";

const PONTO_COR: Record<CorIdentidade, string> = {
  sienna: "bg-sienna", ardosia: "bg-ardosia", musgo: "bg-musgo", cafe: "bg-cafe", ocre: "bg-ocre",
};

// Texto EXATO de "Quer trocar para essa turma" é o que aprovarSolicitacao
// (src/lib/actions/solicitacoes.ts) usa pra decidir fixa vs. provisória —
// mudar esse texto aqui exige mudar o `.startsWith(...)` lá também. Usado
// aqui também pra rotular o status (troca de turma / visita avulsa).
const TIPO_TROCA = "Quer trocar para essa turma";
const TIPO_EXPERIMENTAR = "Quer experimentar essa turma um dia";

export function AlunoTurmasClient({ turmas }: { turmas: TurmaParaAluno[] }) {
  const router = useRouter();
  const [modalTurma, setModalTurma] = useState<TurmaParaAluno | null>(null);
  const [confirmandoTroca, setConfirmandoTroca] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function abrirModal(t: TurmaParaAluno) {
    setErro(null);
    setConfirmandoTroca(false);
    setModalTurma(t);
  }
  function fecharModal() {
    setModalTurma(null);
    setConfirmandoTroca(false);
  }

  async function enviarSolicitacao(tipo: string) {
    if (!modalTurma) return;
    setProcessando(true);
    setErro(null);
    try {
      await solicitarVaga(modalTurma.id, `${tipo} · ${modalTurma.dia} ${modalTurma.hora}`);
      fecharModal();
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu pra enviar a solicitação. Tenta de novo.");
    } finally {
      setProcessando(false);
    }
  }

  async function cancelar(solicitacaoId: string) {
    setProcessando(true);
    setErro(null);
    try {
      await cancelarSolicitacao(solicitacaoId);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu pra cancelar. Tenta de novo.");
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-8">
      <h1 className="mb-5 text-center font-display text-2xl uppercase tracking-wide text-ink">Turmas</h1>
      {erro && !modalTurma && <p className="mb-3 text-center text-sm text-rose-500">{erro}</p>}

      <div className="space-y-3">
        {turmas.map((t) => {
          const cor = TURMA_LABEL_COR[t.nome] ?? "sienna";
          const cheia = t.ocupadas >= t.capacidade;
          const sol = t.minhaSolicitacao;
          const ehTroca = sol?.tipo.startsWith(TIPO_TROCA) ?? false;
          const rotuloTipo = ehTroca ? "troca de turma" : "visita avulsa";

          return (
            <Card key={t.id} className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className={"h-2.5 w-2.5 shrink-0 rounded-full " + PONTO_COR[cor]} />
                <span className="text-sm font-semibold text-ink">{t.dia}</span>
              </div>
              <div className="mb-3 flex items-center gap-1.5 text-xs text-ink-soft">
                <Clock size={13} />
                {t.hora}
              </div>
              <div className="flex items-center justify-between gap-2">
                <Badge tone={cheia ? "danger" : "success"}>{t.ocupadas}/{t.capacidade} vagas</Badge>

                {t.souEuFixo ? (
                  <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">Minha turma</span>
                ) : sol?.status === "pendente" ? (
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-medium text-amber-600">Pendente ({rotuloTipo})</span>
                    <button disabled={processando} onClick={() => cancelar(sol.id)} className="text-xs font-medium text-ink-soft underline disabled:opacity-60">
                      Cancelar
                    </button>
                  </div>
                ) : sol?.status === "aprovada" ? (
                  <span className="text-xs font-medium text-emerald-600">Confirmada ({rotuloTipo})</span>
                ) : (
                  <button
                    onClick={() => abrirModal(t)}
                    className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-cream"
                  >
                    <Send size={13} />
                    Solicitar vaga
                  </button>
                )}
              </div>
              {!t.souEuFixo && sol?.status === "pendente" && <p className="mt-2 text-xs text-ink-soft">Aguarde a confirmação do ateliê antes de ir.</p>}
              {!t.souEuFixo && sol?.status === "aprovada" && <p className="mt-2 text-xs text-ink-soft">Pode ir pra aula!</p>}
              {!t.souEuFixo && sol?.status === "recusada" && <p className="mt-2 text-xs text-rose-500">Sua última solicitação foi recusada. Pode tentar de novo.</p>}
            </Card>
          );
        })}
      </div>

      {modalTurma && (
        <Modal onClose={fecharModal}>
          {!confirmandoTroca ? (
            <>
              <h3 className="mb-1 text-base font-semibold text-ink">Solicitar vaga — {modalTurma.dia}</h3>
              <p className="mb-4 text-sm text-ink-soft">{modalTurma.hora}. O ateliê confirma sua vaga em breve.</p>
              <div className="space-y-2">
                <button
                  disabled={processando}
                  onClick={() => setConfirmandoTroca(true)}
                  className="w-full rounded-xl border border-line px-3 py-2.5 text-left text-sm font-medium text-ink hover:bg-cream disabled:opacity-60"
                >
                  Quero trocar para essa turma
                </button>
                <button
                  disabled={processando}
                  onClick={() => enviarSolicitacao(TIPO_EXPERIMENTAR)}
                  className="w-full rounded-xl border border-line px-3 py-2.5 text-left text-sm font-medium text-ink hover:bg-cream disabled:opacity-60"
                >
                  Quero experimentar essa turma um dia
                </button>
              </div>
              {erro && <p className="mt-3 text-sm text-rose-500">{erro}</p>}
              <button onClick={fecharModal} className="mt-4 w-full rounded-xl border border-line py-2.5 text-sm font-medium text-ink">
                Cancelar
              </button>
            </>
          ) : (
            <>
              <h3 className="mb-1 text-base font-semibold text-ink">Tem certeza que quer trocar de turma?</h3>
              <p className="mb-4 text-sm text-ink-soft">
                Caso sua solicitação seja aprovada, sua vaga na turma atual será liberada.
              </p>
              {erro && <p className="mb-3 text-sm text-rose-500">{erro}</p>}
              <div className="flex gap-2">
                <button
                  disabled={processando}
                  onClick={() => setConfirmandoTroca(false)}
                  className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink disabled:opacity-60"
                >
                  Voltar
                </button>
                <button
                  disabled={processando}
                  onClick={() => enviarSolicitacao(TIPO_TROCA)}
                  className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
                >
                  {processando ? "Enviando…" : "Confirmar troca"}
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
