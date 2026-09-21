"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { Avatar } from "@/components/ui/Avatar";
import { vagasPorTurmaIniciais, pagamentosIniciais, type Vaga, type Pagamento } from "@/lib/vagasPorTurma";
import { mensagemCobranca, abrirWhatsAppCobranca } from "@/lib/whatsapp";
import { CreditCard, Check, Users, Clock, Search, X } from "lucide-react";

// Referência de comportamento: demo/AtelieDemo.jsx (Pagamentos). Pendentes
// derivam do roster real de vagas (mesma fonte de Turmas, não uma lista à
// parte) — ver src/lib/vagasPorTurma.ts.
export default function PagamentosPage() {
  const [vagasPorTurma, setVagasPorTurma] = useState<Record<string, Vaga[]>>(vagasPorTurmaIniciais);
  const [busca, setBusca] = useState("");
  const [modalCobranca, setModalCobranca] = useState<Pagamento | null>(null);

  const pagamentos = pagamentosIniciais(vagasPorTurma);

  function marcarPago(id: string) {
    const ultimoHifen = id.lastIndexOf("-");
    const turmaId = id.slice(0, ultimoHifen);
    const numero = Number(id.slice(ultimoHifen + 1));
    setVagasPorTurma((vpt) => ({
      ...vpt,
      [turmaId]: (vpt[turmaId] ?? []).map((v) => (v.numero === numero ? { ...v, status: v.aula === v.total ? "ultima" : "confirmado" } : v)),
    }));
  }

  const buscando = busca.trim().length > 0;
  const pagamentosFiltrados = buscando ? pagamentos.filter((p) => p.nome.toLowerCase().includes(busca.trim().toLowerCase())) : pagamentos;
  const pendentes = pagamentosFiltrados.filter((p) => p.status === "pendente");
  const totalPendente = pagamentos.reduce((s, p) => s + (p.valor || 0), 0);
  const totalRecebido = 0; // TODO(conectar dados reais): sem histórico de pagos ainda, ver PROGRESS.md

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-8 md:pb-10">
      <h1 className="mb-1 font-display text-2xl uppercase tracking-wide text-ink">Pagamentos</h1>
      <p className="mb-5 text-sm text-ink-soft">Histórico de pacotes e aulas avulsas, cobranças pendentes.</p>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={CreditCard} label="Pendente" value={"R$ " + totalPendente} sub={pagamentos.length + " cobranças"} />
        <StatCard icon={Check} label="Recebido" value={"R$ " + totalRecebido} sub="0 pagamentos" />
        <StatCard icon={Users} label="Alunos" value={pagamentos.length} sub="no período" />
        <StatCard icon={Clock} label="Ticket médio" value={"R$ " + Math.round(totalPendente / (pagamentos.length || 1))} />
      </div>

      <div className="mb-5 flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-2.5">
        <Search size={16} className="shrink-0 text-ink-soft" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar pelo nome…"
          className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-ink-soft"
        />
        {buscando && (
          <button onClick={() => setBusca("")} aria-label="Limpar busca" className="shrink-0 text-ink-soft">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="mb-5 rounded-2xl border border-line bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-ink">Pendentes — cobrar</h3>
        {pendentes.length === 0 ? (
          <p className="text-sm text-ink-soft">{buscando ? `Nenhum pendente encontrado para "${busca}".` : "Nenhuma cobrança pendente."}</p>
        ) : (
          <ul className="divide-y divide-line">
            {pendentes.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div className="flex items-center gap-3">
                  <Avatar nome={p.nome} />
                  <div>
                    <div className="text-sm font-medium text-ink">{p.nome}</div>
                    <div className="text-xs text-ink-soft">{p.tipo} · {p.motivo}</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="warning">Pendente</Badge>
                  <button onClick={() => setModalCobranca(p)} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">
                    Cobrar no WhatsApp
                  </button>
                  <button onClick={() => marcarPago(p.id)} className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-cream">
                    Marcar como pago
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-line bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-ink">Histórico</h3>
        {pagamentosFiltrados.length === 0 ? (
          <p className="text-sm text-ink-soft">Nenhum resultado para &quot;{busca}&quot;.</p>
        ) : (
          <ul className="divide-y divide-line">
            {pagamentosFiltrados.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                <div className="flex items-center gap-3">
                  <Avatar nome={p.nome} size={30} />
                  <div>
                    <div className="font-medium text-ink">{p.nome}</div>
                    <div className="text-xs text-ink-soft">{p.tipo} · {p.data}</div>
                  </div>
                </div>
                <Badge tone={p.status === "pago" ? "success" : "warning"}>{p.status === "pago" ? "Pago" : "Pendente"}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>

      {modalCobranca && (
        <Modal onClose={() => setModalCobranca(null)}>
          <h3 className="mb-3 text-base font-semibold text-ink">Cobrar {modalCobranca.nome.split(" ")[0]}</h3>
          <div className="mb-4 rounded-xl bg-cream p-3 text-sm text-ink">{mensagemCobranca(modalCobranca.nome, modalCobranca.valor)}</div>
          <div className="flex gap-2">
            <button onClick={() => setModalCobranca(null)} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink">
              Cancelar
            </button>
            <button
              onClick={() => {
                abrirWhatsAppCobranca(modalCobranca.telefone, modalCobranca.nome, modalCobranca.valor);
                setModalCobranca(null);
              }}
              className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Enviar no WhatsApp
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
