"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { TURMA_LABEL_COR, type CorIdentidade } from "@/lib/alunos";
import { solicitarVaga, type TurmaParaAluno } from "@/lib/actions/alunoPortal";
import { Clock, Send } from "lucide-react";

const PONTO_COR: Record<CorIdentidade, string> = {
  sienna: "bg-sienna", ardosia: "bg-ardosia", musgo: "bg-musgo", cafe: "bg-cafe", ocre: "bg-ocre",
};

export function AlunoTurmasClient({ turmas }: { turmas: TurmaParaAluno[] }) {
  const router = useRouter();
  const [modalTurma, setModalTurma] = useState<TurmaParaAluno | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function enviarSolicitacao(tipo: string) {
    if (!modalTurma) return;
    setEnviando(true);
    setErro(null);
    try {
      await solicitarVaga(modalTurma.id, tipo);
      setEnviado(modalTurma.id);
      setModalTurma(null);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu pra enviar a solicitação. Tenta de novo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-8">
      <h1 className="mb-5 text-center font-display text-2xl uppercase tracking-wide text-ink">Turmas</h1>

      <div className="space-y-3">
        {turmas.map((t) => {
          const cor = TURMA_LABEL_COR[t.nome] ?? "sienna";
          const cheia = t.ocupadas >= t.capacidade;
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
                {enviado === t.id ? (
                  <span className="text-xs font-medium text-emerald-600">Solicitação enviada!</span>
                ) : (
                  <button
                    onClick={() => { setErro(null); setModalTurma(t); }}
                    className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-cream"
                  >
                    <Send size={13} />
                    Solicitar vaga
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {modalTurma && (
        <Modal onClose={() => setModalTurma(null)}>
          <h3 className="mb-1 text-base font-semibold text-ink">Solicitar vaga — {modalTurma.dia}</h3>
          <p className="mb-4 text-sm text-ink-soft">{modalTurma.hora}. O ateliê confirma sua vaga em breve.</p>
          <div className="space-y-2">
            <button
              disabled={enviando}
              onClick={() => enviarSolicitacao("Quer participar da turma")}
              className="w-full rounded-xl border border-line px-3 py-2.5 text-left text-sm font-medium text-ink hover:bg-cream disabled:opacity-60"
            >
              Quero participar dessa turma
            </button>
            <button
              disabled={enviando}
              onClick={() => enviarSolicitacao(`Solicitou reposição · ${modalTurma.dia} ${modalTurma.hora}`)}
              className="w-full rounded-xl border border-line px-3 py-2.5 text-left text-sm font-medium text-ink hover:bg-cream disabled:opacity-60"
            >
              Preciso repor uma aula aqui
            </button>
          </div>
          {erro && <p className="mt-3 text-sm text-rose-500">{erro}</p>}
          <button onClick={() => setModalTurma(null)} className="mt-4 w-full rounded-xl border border-line py-2.5 text-sm font-medium text-ink">
            Cancelar
          </button>
        </Modal>
      )}
    </div>
  );
}
