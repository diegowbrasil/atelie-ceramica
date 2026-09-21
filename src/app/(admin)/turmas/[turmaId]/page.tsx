"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Toggle } from "@/components/ui/Toggle";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { GripVertical, Plus } from "lucide-react";
import { vagasPorTurmaIniciais, type Vaga } from "@/lib/vagasPorTurma";

// Referência de comportamento: demo/AtelieDemo.jsx (Turmas). Arrastar-e-soltar
// NÃO foi portado ainda de propósito (plano aprovado, fase separada) — mover
// aluno usa o mesmo modal de 2 passos que o demo já tinha antes do gesto de
// arrastar existir (escolher turma → provisório/fixo).

type DiaId = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";
interface TurmaInfo {
  id: string;
  dia: string;
  hora: string;
}
interface DiaInfo {
  id: DiaId;
  label: string;
  disponivel: boolean;
  turmas: TurmaInfo[];
}

const TURMAS_DIAS: DiaInfo[] = [
  { id: "seg", label: "Seg", disponivel: false, turmas: [] },
  { id: "ter", label: "Ter", disponivel: true, turmas: [{ id: "ter-1830", dia: "Terça-feira", hora: "18:30 às 20:30" }] },
  { id: "qua", label: "Qua", disponivel: true, turmas: [{ id: "qua-1630", dia: "Quarta-feira", hora: "16:30 às 18:30" }] },
  {
    id: "qui", label: "Qui", disponivel: true,
    turmas: [
      { id: "qui-1430", dia: "Quinta-feira", hora: "14:30 às 16:30" },
      { id: "qui-1830", dia: "Quinta-feira", hora: "18:30 às 20:30" },
    ],
  },
  { id: "sex", label: "Sex", disponivel: false, turmas: [] },
  { id: "sab", label: "Sáb", disponivel: false, turmas: [] },
  { id: "dom", label: "Dom", disponivel: false, turmas: [] },
];

type CorIdentidade = "sienna" | "ardosia" | "musgo" | "cafe";
const TURMA_COR: Record<string, CorIdentidade> = {
  "ter-1830": "sienna", "qua-1630": "ardosia", "qui-1430": "musgo", "qui-1830": "cafe",
};
function corTurma(turmaId: string): CorIdentidade {
  return TURMA_COR[turmaId] ?? "sienna";
}
function turmaPorId(turmaId: string): TurmaInfo | null {
  for (const d of TURMAS_DIAS) {
    const t = d.turmas.find((t) => t.id === turmaId);
    if (t) return t;
  }
  return null;
}
// Classes completas e literais (Tailwind só gera CSS pra strings que
// consegue ler direto no arquivo — nunca construir nome de classe por
// concatenação em runtime, ver CLAUDE.md).
const PILL_ATIVA: Record<CorIdentidade, string> = {
  sienna: "bg-sienna text-white", ardosia: "bg-ardosia text-white", musgo: "bg-musgo text-white", cafe: "bg-cafe text-white",
};
const PILL_INATIVA: Record<CorIdentidade, string> = {
  sienna: "bg-sienna/15 text-sienna", ardosia: "bg-ardosia/15 text-ardosia", musgo: "bg-musgo/15 text-musgo", cafe: "bg-cafe/15 text-cafe",
};
const BORDA_CARD: Record<CorIdentidade, string> = {
  sienna: "border-sienna/60", ardosia: "border-ardosia/60", musgo: "border-musgo/60", cafe: "border-cafe/60",
};
const PONTO_COR: Record<CorIdentidade, string> = {
  sienna: "bg-sienna", ardosia: "bg-ardosia", musgo: "bg-musgo", cafe: "bg-cafe",
};
const ANEL_COR: Record<CorIdentidade, string> = {
  sienna: "rgb(var(--sienna))", ardosia: "rgb(var(--ardosia))", musgo: "rgb(var(--musgo))", cafe: "rgb(var(--cafe))",
};
const ANEL_TRACK: Record<CorIdentidade, string> = {
  sienna: "rgb(var(--sienna) / 0.18)", ardosia: "rgb(var(--ardosia) / 0.18)", musgo: "rgb(var(--musgo) / 0.18)", cafe: "rgb(var(--cafe) / 0.18)",
};

export default function TurmaPage({ params }: { params: { turmaId: string } }) {
  const diaValido = useMemo(() => {
    return TURMAS_DIAS.find((d) => d.turmas.some((t) => t.id === params.turmaId) && d.disponivel) ?? TURMAS_DIAS.find((d) => d.id === "ter")!;
  }, [params.turmaId]);

  const [diaAtivo, setDiaAtivo] = useState<DiaId>(diaValido.id);
  const [turmaAtiva, setTurmaAtiva] = useState(
    diaValido.turmas.find((t) => t.id === params.turmaId)?.id ?? diaValido.turmas[0].id
  );
  const [vagasPorTurma, setVagasPorTurma] = useState<Record<string, Vaga[]>>(vagasPorTurmaIniciais);
  const [modalVaga, setModalVaga] = useState<number | null>(null);
  const [modalMover, setModalMover] = useState<Vaga | null>(null);

  const diaInfo = TURMAS_DIAS.find((d) => d.id === diaAtivo) ?? TURMAS_DIAS[1];
  const turmaInfo = diaInfo.turmas.find((t) => t.id === turmaAtiva) ?? diaInfo.turmas[0];
  const cor = corTurma(turmaInfo.id);
  const vagas = vagasPorTurma[turmaAtiva] ?? [];
  const ocupadas = vagas.filter((v) => v.nome).length;

  function setVagas(atualizar: (vs: Vaga[]) => Vaga[]) {
    setVagasPorTurma((vpt) => ({ ...vpt, [turmaAtiva]: atualizar(vpt[turmaAtiva] ?? []) }));
  }
  function selecionarDia(dia: DiaInfo) {
    if (!dia.disponivel) return;
    setDiaAtivo(dia.id);
    setTurmaAtiva(dia.turmas[0].id);
  }
  function cadastrarAluno(numero: number, dados: { nome: string; total: number }) {
    setVagas((vs) => vs.map((v) => (v.numero === numero ? { ...v, nome: dados.nome, aula: 0, total: dados.total, status: "confirmado", statusAula: "confirmado", presente: false } : v)));
    setModalVaga(null);
  }
  function toggleStatusAula(numero: number) {
    setVagas((vs) => vs.map((v) => (v.numero === numero ? { ...v, statusAula: v.statusAula === "confirmado" ? "ausente" : "confirmado" } : v)));
  }
  function marcarPresenca(numero: number) {
    setVagas((vs) =>
      vs.map((v) => {
        if (v.numero !== numero) return v;
        if (v.presente) {
          const aula = Math.max(v.aula - 1, 0);
          return { ...v, presente: false, aula, status: v.status === "ultima" ? "confirmado" : v.status };
        }
        const aula = Math.min(v.aula + 1, v.total);
        const ultima = aula === v.total;
        return { ...v, presente: true, aula, status: ultima ? "ultima" : v.status };
      })
    );
  }
  /** Move o aluno pra outra turma — mesma regra do demo: esvazia a vaga de
   *  origem (nunca some sem deixar rastro) e insere no próximo número livre
   *  do destino. "provisorio" é fora de escopo desta rodada (exige rastrear
   *  turma de origem/visitante, ver CLAUDE.md) — só transferência fixa. */
  function moverAluno(aluno: Vaga, destinoTurmaId: string) {
    setVagasPorTurma((vpt) => {
      const origem = (vpt[turmaAtiva] ?? []).map((v) => (v.numero === aluno.numero ? { ...v, nome: null } : v));
      const destino = vpt[destinoTurmaId] ?? [];
      const novoNumero = Math.max(0, ...destino.map((v) => v.numero)) + 1;
      const movido: Vaga = { ...aluno, numero: novoNumero };
      return { ...vpt, [turmaAtiva]: origem, [destinoTurmaId]: [...destino, movido] };
    });
    setModalMover(null);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-8 md:pb-10">
      <h1 className="mb-5 text-center font-display text-2xl uppercase tracking-wide text-ink">Turmas</h1>

      <div className="relative mb-3 flex w-full gap-1.5">
        {TURMAS_DIAS.map((d) => {
          const ativo = diaAtivo === d.id;
          const corDia = d.turmas[0] ? corTurma(d.turmas[0].id) : null;
          return (
            <button
              key={d.id}
              onClick={() => selecionarDia(d)}
              disabled={!d.disponivel}
              className={
                "min-w-0 flex-1 rounded-full px-1.5 py-1.5 text-center text-xs font-medium " +
                (ativo ? PILL_ATIVA[corDia ?? "sienna"] : d.disponivel ? PILL_INATIVA[corDia ?? "sienna"] : "bg-cream-soft text-ink-soft/50")
              }
            >
              {d.label}
            </button>
          );
        })}
      </div>

      {diaInfo.turmas.length > 1 && (
        <div className="mb-5 flex gap-2">
          {diaInfo.turmas.map((t) => {
            const corPill = corTurma(t.id);
            const ativa = turmaAtiva === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTurmaAtiva(t.id)}
                className={"rounded-full px-3 py-1.5 text-xs font-medium " + (ativa ? PILL_ATIVA[corPill] : PILL_INATIVA[corPill])}
              >
                {t.hora}
              </button>
            );
          })}
        </div>
      )}
      {diaInfo.turmas.length <= 1 && <div className="mb-5" />}

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-white px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-ink">{turmaInfo.dia} · {turmaInfo.hora}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge tone="success">{ocupadas}/12 alunos</Badge>
                <span className={"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium " + PILL_ATIVA[cor]}>
                  {turmaInfo.dia.split("-")[0]}
                </span>
              </div>
            </div>
          </div>

          <div className={"divide-y divide-line overflow-hidden rounded-2xl border-2 bg-white " + BORDA_CARD[cor]}>
            {vagas.map((v) =>
              v.nome ? (
                <div key={v.numero} className="flex w-full min-w-0 items-center gap-2 p-3">
                  <Avatar nome={v.nome} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <button
                        onClick={() => toggleStatusAula(v.numero)}
                        title={v.statusAula === "confirmado" ? "Confirmado p/ próxima aula — toque p/ marcar ausente" : "Ausente na próxima aula — toque p/ confirmar"}
                        className={"h-2.5 w-2.5 shrink-0 rounded-full " + (v.statusAula === "confirmado" ? "bg-emerald-500" : "bg-rose-500")}
                      />
                      <span className="truncate text-sm font-medium text-ink">{v.nome}</span>
                      {v.status !== "confirmado" && (
                        <Badge tone={v.status === "ultima" ? "danger" : "warning"}>{v.status === "ultima" ? "Renovar" : "Pendente"}</Badge>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setModalMover(v)}
                    title={`Mover ${v.nome} para outra turma`}
                    className="shrink-0 rounded-full p-1.5 text-ink-soft hover:bg-cream"
                  >
                    <GripVertical size={15} />
                  </button>
                  <div className="relative shrink-0">
                    <ProgressRing percentual={(v.aula / v.total) * 100} size={40} stroke={5} color={ANEL_COR[cor]} trackColor={ANEL_TRACK[cor]} />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold" style={{ color: ANEL_COR[cor] }}>
                      {v.aula}/{v.total}
                    </span>
                  </div>
                  <Toggle checked={v.presente} onChange={() => marcarPresenca(v.numero)} title={v.presente ? "Presente — toque para desfazer" : "Marcar presença"} />
                </div>
              ) : (
                <button key={v.numero} onClick={() => setModalVaga(v.numero)} className="flex w-full items-center gap-3 p-3 text-left hover:bg-cream">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-ink-soft text-ink-soft">
                    <Plus size={16} />
                  </span>
                  <span className="min-w-0 flex-1 text-sm text-ink-soft">Vaga {v.numero} disponível</span>
                  <span className="shrink-0 rounded-lg border border-ink-soft px-2 py-1 text-xs font-medium text-ink">Cadastrar aluno</span>
                </button>
              )
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-ink">Detalhes da turma</h3>
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-ink-soft">Dia</dt>
              <dd className="text-right font-medium">{turmaInfo.dia}</dd>
              <dt className="text-ink-soft">Horário</dt>
              <dd className="text-right font-medium">{turmaInfo.hora}</dd>
              <dt className="text-ink-soft">Capacidade</dt>
              <dd className="text-right font-medium">12 alunos</dd>
              <dt className="text-ink-soft">Confirmados</dt>
              <dd className="text-right font-medium">{vagas.filter((v) => v.status === "confirmado").length} alunos</dd>
            </dl>
          </div>
          <div className="rounded-2xl border border-line bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-ink">Solicitações pendentes</h3>
            <p className="text-sm text-ink-soft">Nenhuma solicitação pendente pra esta turma.</p>
          </div>
        </div>
      </div>

      {modalVaga !== null && (
        <ModalCadastrarAluno numero={modalVaga} onClose={() => setModalVaga(null)} onSalvar={(dados) => cadastrarAluno(modalVaga, dados)} />
      )}
      {modalMover && (
        <ModalMoverAluno
          aluno={modalMover}
          turmaAtualId={turmaAtiva}
          onClose={() => setModalMover(null)}
          onConfirmar={(destinoId) => moverAluno(modalMover, destinoId)}
        />
      )}
    </div>
  );
}

function ModalCadastrarAluno({ numero, onClose, onSalvar }: { numero: number; onClose: () => void; onSalvar: (dados: { nome: string; total: number }) => void }) {
  const [nome, setNome] = useState("");
  const [total, setTotal] = useState(4);
  return (
    <Modal onClose={onClose}>
      <h3 className="mb-3 text-base font-semibold text-ink">Cadastrar aluno — vaga {numero}</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!nome.trim()) return;
          onSalvar({ nome: nome.trim(), total });
        }}
      >
        <label className="mb-1 block text-xs font-medium text-ink-soft">Nome do aluno</label>
        <input
          autoFocus
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="mb-3 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
          placeholder="Nome completo"
        />
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
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink">
            Cancelar
          </button>
          <button type="submit" className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover">
            Cadastrar
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ModalMoverAluno({
  aluno, turmaAtualId, onClose, onConfirmar,
}: {
  aluno: Vaga;
  turmaAtualId: string;
  onClose: () => void;
  onConfirmar: (destinoId: string) => void;
}) {
  const opcoesDestino = TURMAS_DIAS.flatMap((d) => d.turmas).filter((t) => t.id !== turmaAtualId);
  return (
    <Modal onClose={onClose}>
      <h3 className="mb-1 text-base font-semibold text-ink">Mover {aluno.nome}</h3>
      <p className="mb-3 text-sm text-ink-soft">Para qual turma?</p>
      <div className="space-y-2">
        {opcoesDestino.map((t) => {
          const corPonto = corTurma(t.id);
          return (
            <button
              key={t.id}
              onClick={() => onConfirmar(t.id)}
              className="flex w-full items-center gap-3 rounded-lg border border-line px-3 py-2.5 text-left text-sm font-medium hover:bg-cream"
            >
              <span className={"h-2.5 w-2.5 shrink-0 rounded-full " + PONTO_COR[corPonto]} />
              {t.dia.split("-")[0]} · {t.hora}
            </button>
          );
        })}
      </div>
      <button onClick={onClose} className="mt-4 w-full rounded-xl border border-line py-2.5 text-sm font-medium text-ink">
        Cancelar
      </button>
    </Modal>
  );
}
