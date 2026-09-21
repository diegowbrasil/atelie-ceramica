"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { vagasPorTurmaIniciais, type Vaga } from "@/lib/vagasPorTurma";

// Referência de comportamento: demo/AtelieDemo.jsx (Solicitacoes). Dado
// mockado (nunca fez parte da leva de dados reais do Diego, só as 4 turmas
// fixas/roster são reais) — "Aprovar" insere de verdade na vaga livre da
// turma (mesmo roster local de vagasPorTurma, ver limitação de fontes
// separadas por rota no PROGRESS.md).

interface Solicitacao {
  id: string;
  nome: string;
  tipo: string;
  quando: string;
  turmaId: string;
}

const TURMA_LABEL: Record<string, string> = {
  "ter-1830": "Terça · 18:30 às 20:30",
  "qua-1630": "Quarta · 16:30 às 18:30",
  "qui-1430": "Quinta · 14:30 às 16:30",
  "qui-1830": "Quinta · 18:30 às 20:30",
};

function solicitacoesIniciais(): Solicitacao[] {
  return [
    { id: "sol1", nome: "Beatriz Almeida", tipo: "Quer participar da turma", quando: "12/05 às 10:23", turmaId: "ter-1830" },
    { id: "sol2", nome: "Felipe Martins", tipo: "Quer participar da turma", quando: "12/05 às 09:15", turmaId: "qua-1630" },
    { id: "sol3", nome: "Lucas Mendes", tipo: "Solicitou reposição · Quinta 18:30", quando: "11/05 às 20:02", turmaId: "qui-1830" },
  ];
}

export default function SolicitacoesPage() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(solicitacoesIniciais);
  const [vagasPorTurma, setVagasPorTurma] = useState<Record<string, Vaga[]>>(vagasPorTurmaIniciais);
  const [modalAprovar, setModalAprovar] = useState<Solicitacao | null>(null);

  function recusar(sol: Solicitacao) {
    setSolicitacoes((ss) => ss.filter((s) => s.id !== sol.id));
  }
  function aprovar(sol: Solicitacao, total: number) {
    setVagasPorTurma((vpt) => {
      const destino = vpt[sol.turmaId] ?? [];
      const vazia = destino.find((v) => !v.nome);
      const novoNumero = vazia?.numero ?? Math.max(0, ...destino.map((v) => v.numero)) + 1;
      const nova: Vaga = { numero: novoNumero, nome: sol.nome, aula: 0, total, status: "confirmado", statusAula: "confirmado", presente: false };
      const atualizada = vazia ? destino.map((v) => (v.numero === novoNumero ? nova : v)) : [...destino, nova];
      return { ...vpt, [sol.turmaId]: atualizada };
    });
    setSolicitacoes((ss) => ss.filter((s) => s.id !== sol.id));
    setModalAprovar(null);
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
          onClose={() => setModalAprovar(null)}
          onConfirmar={(total) => aprovar(modalAprovar, total)}
        />
      )}
    </div>
  );
}

function ModalAprovarSolicitacao({
  solicitacao, onClose, onConfirmar,
}: {
  solicitacao: Solicitacao;
  onClose: () => void;
  onConfirmar: (total: number) => void;
}) {
  const [total, setTotal] = useState(4);
  return (
    <Modal onClose={onClose}>
      <h3 className="mb-1 text-base font-semibold text-ink">Aprovar {solicitacao.nome}</h3>
      <p className="mb-3 text-sm text-ink-soft">Turma: {TURMA_LABEL[solicitacao.turmaId] ?? solicitacao.turmaId}</p>
      <label className="mb-1 block text-xs font-medium text-ink-soft">Pacote</label>
      <div className="mb-4 flex gap-2">
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
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink">
          Cancelar
        </button>
        <button onClick={() => onConfirmar(total)} className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover">
          Confirmar
        </button>
      </div>
    </Modal>
  );
}
