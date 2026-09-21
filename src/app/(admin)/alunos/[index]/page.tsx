"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Toggle } from "@/components/ui/Toggle";
import { alunosIniciais, TURMA_LABEL_COR, TURMAS_ORDEM_LABELS, type AlunoReal, type CorIdentidade } from "@/lib/alunos";
import { abrirWhatsAppCobranca } from "@/lib/whatsapp";
import { ChevronLeft, Phone, Pencil, Trash2 } from "lucide-react";

const COR_HEX: Record<CorIdentidade, string> = {
  sienna: "rgb(var(--sienna))", ardosia: "rgb(var(--ardosia))", musgo: "rgb(var(--musgo))", cafe: "rgb(var(--cafe))",
};
const COR_TRACK: Record<CorIdentidade, string> = {
  sienna: "rgb(var(--sienna) / 0.18)", ardosia: "rgb(var(--ardosia) / 0.18)", musgo: "rgb(var(--musgo) / 0.18)", cafe: "rgb(var(--cafe) / 0.18)",
};
const PONTO_COR: Record<CorIdentidade, string> = {
  sienna: "bg-sienna", ardosia: "bg-ardosia", musgo: "bg-musgo", cafe: "bg-cafe",
};

// Referência de comportamento: demo/AtelieDemo.jsx (AlunoDetalhe) — versão
// simplificada pra fonte de dado da tela Alunos (sem turmaAtualId/
// provisorio, que só existem no formato de vagasPorTurma de Turmas; ver
// nota no CLAUDE.md sobre as duas fontes ficarem deliberadamente separadas).
export default function AlunoDetalhePage({ params }: { params: { index: string } }) {
  const router = useRouter();
  const [alunos, setAlunos] = useState<AlunoReal[]>(alunosIniciais);
  const idx = Number(params.index);
  const aluno = alunos[idx];

  const [editando, setEditando] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [turmaForm, setTurmaForm] = useState(aluno?.turma);
  const [totalForm, setTotalForm] = useState(aluno?.total);
  const [aulaForm, setAulaForm] = useState(aluno?.aula);
  const [pagoForm, setPagoForm] = useState(aluno ? aluno.status !== "pendente" : true);

  if (!aluno) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-6 md:px-8 md:pb-10">
        <p className="text-sm text-ink-soft">Aluno não encontrado.</p>
      </div>
    );
  }

  const cor = TURMA_LABEL_COR[aluno.turma] ?? "sienna";
  const pct = aluno.total ? (aluno.aula / aluno.total) * 100 : 0;

  function iniciarEdicao() {
    setTurmaForm(aluno.turma);
    setTotalForm(aluno.total);
    setAulaForm(aluno.aula);
    setPagoForm(aluno.status !== "pendente");
    setEditando(true);
  }
  function mudarTotalForm(n: number) {
    setTotalForm(n);
    setAulaForm((a) => Math.min(a, n));
  }
  function salvarEdicao(patch: { turma: string; total: number; aula: number; pago: boolean }) {
    const status: AlunoReal["status"] = !patch.pago ? "pendente" : patch.aula === patch.total ? "ultima" : "confirmado";
    setAlunos((as) => as.map((a, i) => (i === idx ? { ...a, turma: patch.turma, total: patch.total, aula: patch.aula, status } : a)));
    setEditando(false);
  }
  function excluir() {
    setAlunos((as) => as.filter((_, i) => i !== idx));
    router.push("/alunos");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6 md:px-8 md:pb-10">
      <button onClick={() => router.push("/alunos")} className="mb-4 flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink">
        <ChevronLeft size={16} />
        Voltar
      </button>

      <div className="mb-4 flex items-center gap-4 rounded-2xl border border-line bg-white p-5">
        <Avatar nome={aluno.nome} size={56} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-xl uppercase tracking-wide text-ink">{aluno.nome}</h1>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
            <span className={"h-2 w-2 shrink-0 rounded-full " + PONTO_COR[cor]} />
            {aluno.turma}
          </div>
        </div>
        <div className="relative shrink-0">
          <ProgressRing percentual={pct} size={52} stroke={5} color={COR_HEX[cor]} trackColor={COR_TRACK[cor]} />
          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold" style={{ color: COR_HEX[cor] }}>
            {aluno.aula}/{aluno.total}
          </span>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-line bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-ink">Dados de contato</h3>
        <div className="flex items-center gap-2.5 text-sm text-ink">
          <Phone size={15} className="shrink-0 text-ink-soft" />
          {aluno.tel || <span className="text-ink-soft">Telefone não informado</span>}
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-line bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">Pacote e pagamento</h3>
          {!editando && (
            <button onClick={iniciarEdicao} className="flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-ink">
              <Pencil size={13} /> Editar
            </button>
          )}
        </div>

        {!editando ? (
          <>
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-ink-soft">Aula atual</dt>
              <dd className="text-right font-medium">{aluno.aula} de {aluno.total}</dd>
              <dt className="text-ink-soft">Pagamento</dt>
              <dd className="text-right">
                {aluno.status === "pendente" ? <Badge tone="warning">Pendente</Badge> : aluno.status === "ultima" ? <Badge tone="danger">Renovar</Badge> : <Badge tone="success">Em dia</Badge>}
              </dd>
            </dl>
            {aluno.status === "pendente" && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => abrirWhatsAppCobranca(aluno.tel, aluno.nome, null)} className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700">
                  Cobrar no WhatsApp
                </button>
                <button
                  onClick={() => salvarEdicao({ turma: aluno.turma, total: aluno.total, aula: aluno.aula, pago: true })}
                  className="flex-1 rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink hover:bg-cream"
                >
                  Marcar como pago
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Turma</label>
              <select value={turmaForm} onChange={(e) => setTurmaForm(e.target.value)} className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-ink">
                {TURMAS_ORDEM_LABELS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Pacote</label>
              <div className="flex gap-2">
                {[4, 8, 12].map((n) => (
                  <button type="button" key={n} onClick={() => mudarTotalForm(n)} className={"flex-1 rounded-lg border px-3 py-2 text-sm font-medium " + (totalForm === n ? "border-ink bg-cream-soft text-ink" : "border-line text-ink-soft")}>
                    {n} aulas
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-ink-soft">Aula atual</label>
                <input
                  type="number"
                  min={0}
                  max={totalForm}
                  value={aulaForm}
                  onChange={(e) => setAulaForm(Math.max(0, Math.min(totalForm, Number(e.target.value) || 0)))}
                  className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
                />
              </div>
              <div className="flex items-center gap-2 pb-2.5">
                <Toggle checked={pagoForm} onChange={() => setPagoForm((p) => !p)} title="Pagamento em dia" />
                <span className="text-sm text-ink">{pagoForm ? "Em dia" : "Pendente"}</span>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setEditando(false)} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink">
                Cancelar
              </button>
              <button
                onClick={() => salvarEdicao({ turma: turmaForm, total: totalForm, aula: aulaForm, pago: pagoForm })}
                className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
              >
                Salvar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mb-4 rounded-2xl border border-line bg-white p-4">
        <h3 className="mb-1 text-sm font-semibold text-ink">Presença</h3>
        <p className="text-xs text-ink-soft">Histórico de presença por data ainda não existe — mostrando só o estado do pacote atual.</p>
      </div>

      <button onClick={() => setConfirmandoExclusao(true)} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-200 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50">
        <Trash2 size={15} /> Excluir aluno
      </button>

      {confirmandoExclusao && (
        <Modal onClose={() => setConfirmandoExclusao(false)}>
          <h3 className="mb-1 text-base font-semibold text-ink">Excluir {aluno.nome}?</h3>
          <p className="mb-4 text-sm text-ink-soft">Remove {aluno.nome} do cadastro por completo. Essa ação não pode ser desfeita.</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmandoExclusao(false)} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink">
              Cancelar
            </button>
            <button onClick={excluir} className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-medium text-white hover:bg-rose-700">
              Excluir
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
