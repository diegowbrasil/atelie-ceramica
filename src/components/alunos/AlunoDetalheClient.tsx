"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Toggle } from "@/components/ui/Toggle";
import { TURMA_LABEL_COR, type CorIdentidade } from "@/lib/alunos";
import { abrirWhatsAppCobranca } from "@/lib/whatsapp";
import { editarAluno, excluirAluno, type AlunoReal } from "@/lib/actions/alunos";
import { gerarConvite } from "@/lib/actions/convite";
import { ChevronLeft, Phone, Pencil, Trash2, UserPlus, Copy, Check } from "lucide-react";

const COR_HEX: Record<CorIdentidade, string> = {
  sienna: "rgb(var(--sienna))", ardosia: "rgb(var(--ardosia))", musgo: "rgb(var(--musgo))", cafe: "rgb(var(--cafe))", ocre: "rgb(var(--ocre))",
};
const COR_TRACK: Record<CorIdentidade, string> = {
  sienna: "rgb(var(--sienna) / 0.18)", ardosia: "rgb(var(--ardosia) / 0.18)", musgo: "rgb(var(--musgo) / 0.18)", cafe: "rgb(var(--cafe) / 0.18)", ocre: "rgb(var(--ocre) / 0.18)",
};
const PONTO_COR: Record<CorIdentidade, string> = {
  sienna: "bg-sienna", ardosia: "bg-ardosia", musgo: "bg-musgo", cafe: "bg-cafe", ocre: "bg-ocre",
};

interface Props {
  alunoInicial: AlunoReal;
  turmas: { id: string; nome: string }[];
}

// Referência de comportamento: demo/AtelieDemo.jsx (AlunoDetalhe). Ligado
// aos dados reais (2026-09-24) — turma agora é escolhida por id (uuid),
// não mais por label livre; editar turma encerra a matrícula antiga e
// cria uma nova (mesma lógica de moverAluno em turmas.ts, ver
// src/lib/actions/alunos.ts).
export function AlunoDetalheClient({ alunoInicial, turmas }: Props) {
  const router = useRouter();
  const [aluno, setAluno] = useState<AlunoReal>(alunoInicial);
  const [pendente, setPendente] = useState(false);

  // Editar não muda a rota (id continua o mesmo) — sem isso,
  // `router.refresh()` buscar dado novo no servidor não atualizaria o
  // state local (mesmo padrão de AvisosCard/AlunosListClient).
  useEffect(() => setAluno(alunoInicial), [alunoInicial]);

  const [editando, setEditando] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [gerandoConvite, setGerandoConvite] = useState(false);
  const [linkConvite, setLinkConvite] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [turmaIdForm, setTurmaIdForm] = useState(aluno.turmaId ?? turmas[0]?.id ?? "");
  const [totalForm, setTotalForm] = useState(aluno.total);
  const [aulaForm, setAulaForm] = useState(aluno.aula);
  const [pagoForm, setPagoForm] = useState(aluno.status !== "pendente");

  const cor = TURMA_LABEL_COR[aluno.turma] ?? "sienna";
  const pct = aluno.total ? (aluno.aula / aluno.total) * 100 : 0;

  function iniciarEdicao() {
    setTurmaIdForm(aluno.turmaId ?? turmas[0]?.id ?? "");
    setTotalForm(aluno.total);
    setAulaForm(aluno.aula);
    setPagoForm(aluno.status !== "pendente");
    setEditando(true);
  }
  function mudarTotalForm(n: number) {
    setTotalForm(n);
    setAulaForm((a) => Math.min(a, n));
  }
  async function salvarEdicao(patch: { turmaId: string; total: number; aula: number; pago: boolean }) {
    if (!patch.turmaId) return;
    setPendente(true);
    try {
      await editarAluno(aluno.id, { turmaId: patch.turmaId, total: patch.total, aulaAtual: patch.aula, pago: patch.pago });
      setEditando(false);
      router.refresh();
    } finally {
      setPendente(false);
    }
  }
  async function convidar() {
    setGerandoConvite(true);
    try {
      const { token } = await gerarConvite(aluno.id);
      setLinkConvite(`${window.location.origin}/convite/${token}`);
      setCopiado(false);
    } finally {
      setGerandoConvite(false);
    }
  }
  function copiarLink() {
    if (!linkConvite) return;
    navigator.clipboard.writeText(linkConvite);
    setCopiado(true);
  }
  function enviarConviteWhatsApp() {
    if (!linkConvite) return;
    const mensagem = `Oi ${aluno.nome.split(" ")[0]}! Agora você pode acompanhar suas aulas pelo app do ateliê. Cria sua senha aqui: ${linkConvite}`;
    window.open(`https://wa.me/${aluno.tel || ""}?text=${encodeURIComponent(mensagem)}`, "_blank");
  }
  async function excluir() {
    setPendente(true);
    try {
      await excluirAluno(aluno.id);
      router.push("/alunos");
    } finally {
      setPendente(false);
    }
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

        <div className="mt-3 border-t border-line pt-3">
          {aluno.temContaAtiva ? (
            <Badge tone="success">Já usa o app</Badge>
          ) : !aluno.tel ? (
            <p className="text-xs text-ink-soft">Adicione um telefone pra poder convidar {aluno.nome.split(" ")[0]} pro app.</p>
          ) : (
            <button
              onClick={convidar}
              disabled={gerandoConvite}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink hover:bg-cream disabled:opacity-60"
            >
              <UserPlus size={14} />
              {gerandoConvite ? "Gerando link…" : "Convidar pro app"}
            </button>
          )}
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
                  disabled={pendente}
                  onClick={() => salvarEdicao({ turmaId: aluno.turmaId ?? turmas[0]?.id ?? "", total: aluno.total, aula: aluno.aula, pago: true })}
                  className="flex-1 rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink hover:bg-cream disabled:opacity-60"
                >
                  {pendente ? "Salvando…" : "Marcar como pago"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Turma</label>
              <select value={turmaIdForm} onChange={(e) => setTurmaIdForm(e.target.value)} className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-ink">
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
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
                disabled={pendente}
                onClick={() => salvarEdicao({ turmaId: turmaIdForm, total: totalForm, aula: aulaForm, pago: pagoForm })}
                className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
              >
                {pendente ? "Salvando…" : "Salvar"}
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

      {linkConvite && (
        <Modal onClose={() => setLinkConvite(null)}>
          <h3 className="mb-1 text-base font-semibold text-ink">Convite pra {aluno.nome.split(" ")[0]}</h3>
          <p className="mb-3 text-sm text-ink-soft">Válido por 7 dias. Manda esse link — {aluno.nome.split(" ")[0]} define a própria senha e já entra direto.</p>
          <div className="mb-4 break-all rounded-xl bg-cream p-3 text-xs text-ink">{linkConvite}</div>
          <div className="flex gap-2">
            <button onClick={copiarLink} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-line py-2.5 text-sm font-medium text-ink hover:bg-cream">
              {copiado ? <Check size={15} /> : <Copy size={15} />}
              {copiado ? "Copiado!" : "Copiar link"}
            </button>
            <button onClick={enviarConviteWhatsApp} className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700">
              Enviar no WhatsApp
            </button>
          </div>
        </Modal>
      )}

      {confirmandoExclusao && (
        <Modal onClose={() => setConfirmandoExclusao(false)}>
          <h3 className="mb-1 text-base font-semibold text-ink">Excluir {aluno.nome}?</h3>
          <p className="mb-4 text-sm text-ink-soft">Remove {aluno.nome} do cadastro por completo. Essa ação não pode ser desfeita.</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmandoExclusao(false)} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink">
              Cancelar
            </button>
            <button disabled={pendente} onClick={excluir} className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60">
              {pendente ? "Excluindo…" : "Excluir"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
