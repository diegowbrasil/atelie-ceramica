"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import type { Oficina } from "@/lib/oficinas";

// Criar/editar oficina — mesmo formulário nos dois modos (demo: ModalOficina).
export function ModalOficina({
  oficina, onClose, onSalvar,
}: {
  oficina?: Oficina | null;
  onClose: () => void;
  onSalvar: (dados: Omit<Oficina, "id" | "status" | "statusPecas" | "receita" | "participantes">) => void;
}) {
  const editando = !!oficina;
  const [nome, setNome] = useState(oficina?.nome ?? "");
  const [data, setData] = useState(oficina?.data ?? "");
  const [hora, setHora] = useState(oficina?.hora ?? "");
  const [vagas, setVagas] = useState(oficina?.vagas ?? 12);
  const [valor, setValor] = useState<number | "">(oficina?.valor ?? "");
  const [descricao, setDescricao] = useState(oficina?.descricao ?? "");
  const [observacoes, setObservacoes] = useState(oficina?.observacoes ?? "");

  function submeter(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !data.trim() || !hora.trim()) return;
    onSalvar({
      nome: nome.trim(), data: data.trim(), hora: hora.trim(),
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">Data</label>
            <input value={data} onChange={(e) => setData(e.target.value)} className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-ink" placeholder="10 de Outubro de 2026" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">Horário</label>
            <input value={hora} onChange={(e) => setHora(e.target.value)} className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-ink" placeholder="16:00 às 19:00" />
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
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink">
            Cancelar
          </button>
          <button type="submit" className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover">
            {editando ? "Salvar" : "Criar oficina"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
