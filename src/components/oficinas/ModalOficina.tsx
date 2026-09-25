"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import type { OficinaReal } from "@/lib/actions/oficinas";

export interface DadosOficina {
  nome: string;
  data: string; // YYYY-MM-DD
  horaInicio: string; // HH:MM
  horaFim: string; // HH:MM
  vagas: number;
  valor: number | null;
  descricao: string;
  observacoes: string;
}

// Criar/editar oficina — mesmo formulário nos dois modos (demo: ModalOficina).
// Ligado aos dados reais (2026-09-24): data/hora viraram inputs
// estruturados (date/time) em vez de texto livre — o schema real guarda
// `date`/`time` de verdade, diferente do mock (que só tinha uma string de
// exibição). A EXIBIÇÃO continua formatada por extenso em português em
// qualquer outro lugar do app (`formatarData`/`formatarHora` em
// actions/oficinas.ts) — só a ENTRADA de dado no formulário mudou.
export function ModalOficina({
  oficina, pendente, erro, onClose, onSalvar,
}: {
  oficina?: OficinaReal | null;
  pendente?: boolean;
  erro?: string | null;
  onClose: () => void;
  onSalvar: (dados: DadosOficina) => void;
}) {
  const editando = !!oficina;
  const [nome, setNome] = useState(oficina?.nome ?? "");
  const [data, setData] = useState(oficina?.dataISO ?? "");
  const [horaInicio, setHoraInicio] = useState(oficina?.horaInicioRaw ?? "");
  const [horaFim, setHoraFim] = useState(oficina?.horaFimRaw ?? "");
  const [vagas, setVagas] = useState(oficina?.vagas ?? 12);
  const [valor, setValor] = useState<number | "">(oficina?.valor ?? "");
  const [descricao, setDescricao] = useState(oficina?.descricao ?? "");
  const [observacoes, setObservacoes] = useState(oficina?.observacoes ?? "");

  function submeter(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !data || !horaInicio || !horaFim) return;
    onSalvar({
      nome: nome.trim(), data, horaInicio, horaFim,
      vagas: Math.max(1, Number(vagas) || 12),
      valor: valor === "" ? null : Math.max(0, Number(valor) || 0),
      descricao: descricao.trim(), observacoes: observacoes.trim(),
    });
  }

  return (
    <Modal onClose={onClose}>
      <h3 className="mb-3 text-base font-semibold text-ink">{editando ? "Editar oficina" : "Nova oficina"}</h3>
      <form onSubmit={submeter} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft">Nome</label>
          <input autoFocus value={nome} onChange={(e) => setNome(e.target.value)} className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-ink" placeholder="Ex: Kit Café da Manhã" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">Data</label>
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-ink" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">Início</label>
            <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-ink" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">Fim</label>
            <input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-ink" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">Vagas</label>
            <input type="number" min={1} value={vagas} onChange={(e) => setVagas(Number(e.target.value))} className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-ink" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">Valor por pessoa (R$)</label>
            <input type="number" min={0} value={valor} onChange={(e) => setValor(e.target.value === "" ? "" : Number(e.target.value))} className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-ink" placeholder="Opcional" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft">Descrição</label>
          <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-ink" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft">Observações</label>
          <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={2} className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-ink" />
        </div>
        {erro && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{erro}</p>}
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink">
            Cancelar
          </button>
          <button type="submit" disabled={pendente} className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60">
            {pendente ? "Salvando…" : editando ? "Salvar" : "Criar oficina"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
