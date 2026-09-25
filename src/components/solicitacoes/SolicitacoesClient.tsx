"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { aprovarSolicitacao, recusarSolicitacao, type SolicitacaoReal } from "@/lib/actions/solicitacoes";

// Referência de comportamento: demo/AtelieDemo.jsx (Solicitacoes). Ligado
// aos dados reais (2026-09-24) — "Aprovar" chama a mesma Server Action de
// Turmas por baixo (cadastrarAluno), "Recusar" só marca status='recusada'
// (nunca apaga, mesmo padrão do resto do app).

interface Props {
  solicitacoesIniciais: SolicitacaoReal[];
  turmas: { id: string; nome: string }[];
}

export function SolicitacoesClient({ solicitacoesIniciais, turmas }: Props) {
  const router = useRouter();
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoReal[]>(solicitacoesIniciais);
  const [modalAprovar, setModalAprovar] = useState<SolicitacaoReal | null>(null);
  const [pendente, setPendente] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Esta tela não remonta sozinha ao navegar (sem param dinâmico na rota)
  // — mesmo padrão de resync de AvisosCard/AlunosListClient/PagamentosClient.
  useEffect(() => setSolicitacoes(solicitacoesIniciais), [solicitacoesIniciais]);

  function labelTurma(turmaId: string) {
    return turmas.find((t) => t.id === turmaId)?.nome ?? turmaId;
  }

  async function recusar(sol: SolicitacaoReal) {
    setSolicitacoes((ss) => ss.filter((s) => s.id !== sol.id));
    await recusarSolicitacao(sol.id);
    router.refresh();
  }
  async function aprovar(sol: SolicitacaoReal, total: number) {
    setPendente(true);
    setErro(null);
    try {
      await aprovarSolicitacao(sol.id, sol.alunoId, sol.nome, sol.turmaId, total);
      setSolicitacoes((ss) => ss.filter((s) => s.id !== sol.id));
      setModalAprovar(null);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu pra aprovar essa solicitação. Tenta de novo.");
    } finally {
      setPendente(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6 md:px-8 md:pb-10">
      <h1 className="mb-1 font-display text-2xl uppercase tracking-wide text-ink">Solicitações</h1>
      <p className="mb-5 text-sm text-ink-soft">Vagas e reposições aguardando aprovação.</p>

      {solicitacoes.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white px-6 py-10 text-center text-sm text-ink-soft">Nenhuma solicitação pendente.</div>
      ) : (
        <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
          {solicitacoes.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3">
                <Avatar nome={s.nome} />
                <div>
                  <div className="text-sm font-medium text-ink">{s.nome}</div>
                  <div className="text-xs text-ink-soft">{s.tipo} · {s.quando}</div>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setModalAprovar(s)} className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700">
                  Aprovar
                </button>
                <button onClick={() => recusar(s)} className="rounded-lg bg-rose-100 px-2.5 py-1.5 text-xs font-medium text-rose-600">
                  Recusar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalAprovar && (
        <ModalAprovarSolicitacao
          solicitacao={modalAprovar}
          labelTurma={labelTurma(modalAprovar.turmaId)}
          pendente={pendente}
          erro={erro}
          onClose={() => { setModalAprovar(null); setErro(null); }}
          onConfirmar={(total) => aprovar(modalAprovar, total)}
        />
      )}
    </div>
  );
}

function ModalAprovarSolicitacao({
  solicitacao, labelTurma, pendente, erro, onClose, onConfirmar,
}: {
  solicitacao: SolicitacaoReal;
  labelTurma: string;
  pendente: boolean;
  erro: string | null;
  onClose: () => void;
  onConfirmar: (total: number) => void;
}) {
  const [total, setTotal] = useState(4);
  return (
    <Modal onClose={onClose}>
      <h3 className="mb-1 text-base font-semibold text-ink">Aprovar {solicitacao.nome}</h3>
      <p className="mb-3 text-sm text-ink-soft">Turma: {labelTurma}</p>
      <label className="mb-1 block text-xs font-medium text-ink-soft">Pacote</label>
      <div className="mb-1 flex gap-2">
        {[4, 8, 12].map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => setTotal(n)}
            className={"flex-1 rounded-lg border px-3 py-2 text-sm font-medium " + (total === n ? "border-ink bg-cream-soft text-ink" : "border-line text-ink-soft")}
          >
            {n} aulas
          </button>
        ))}
      </div>
      {solicitacao.alunoId && (
        <p className="mb-3 text-xs text-ink-soft">Se ela já tiver um pacote em outra turma, o pacote atual dela é reaproveitado — esse número só vale pra matrícula nova.</p>
      )}
      {erro && <p className="mb-3 mt-2 text-sm text-rose-500">{erro}</p>}
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink">
          Cancelar
        </button>
        <button disabled={pendente} onClick={() => onConfirmar(total)} className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60">
          {pendente ? "Confirmando…" : "Confirmar"}
        </button>
      </div>
    </Modal>
  );
}
