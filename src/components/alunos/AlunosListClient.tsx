"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { TURMA_LABEL_COR, TURMAS_ORDEM_LABELS, type CorIdentidade } from "@/lib/alunos";
import { cadastrarAluno } from "@/lib/actions/turmas";
import type { AlunoReal } from "@/lib/actions/alunos";
import { Search, X, ChevronDown, GraduationCap } from "lucide-react";

// Referência de comportamento: demo/AtelieDemo.jsx (Alunos/LinhaAluno).
// Ligado aos dados reais (2026-09-24) — lista/busca/acordeão vêm do
// servidor; cadastrar aluno chama a mesma Server Action de Turmas
// (cadastrarAluno já existia lá, turma-scoped, reaproveitada aqui em vez
// de duplicar a lógica de criar profile+pacote+matrícula+cobrança).

const ANEL_COR: Record<CorIdentidade, string> = {
  sienna: "rgb(var(--sienna))", ardosia: "rgb(var(--ardosia))", musgo: "rgb(var(--musgo))", cafe: "rgb(var(--cafe))", ocre: "rgb(var(--ocre))",
};
const ANEL_TRACK: Record<CorIdentidade, string> = {
  sienna: "rgb(var(--sienna) / 0.18)", ardosia: "rgb(var(--ardosia) / 0.18)", musgo: "rgb(var(--musgo) / 0.18)", cafe: "rgb(var(--cafe) / 0.18)", ocre: "rgb(var(--ocre) / 0.18)",
};
const PONTO_COR: Record<CorIdentidade, string> = {
  sienna: "bg-sienna", ardosia: "bg-ardosia", musgo: "bg-musgo", cafe: "bg-cafe", ocre: "bg-ocre",
};

interface Props {
  alunosIniciais: AlunoReal[];
  turmas: { id: string; nome: string }[];
}

export function AlunosListClient({ alunosIniciais, turmas }: Props) {
  const router = useRouter();
  const [alunos, setAlunos] = useState<AlunoReal[]>(alunosIniciais);
  const [busca, setBusca] = useState("");
  const [turmaAberta, setTurmaAberta] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [pendente, setPendente] = useState(false);

  // Esta tela não remonta sozinha ao navegar (sem param dinâmico na rota)
  // — sem isso, `router.refresh()` buscar dado novo no servidor não
  // atualizaria o state local (mesmo padrão de AvisosCard).
  useEffect(() => setAlunos(alunosIniciais), [alunosIniciais]);

  async function cadastrar(dados: { nome: string; tel: string | null; turmaId: string; total: number }) {
    setPendente(true);
    try {
      await cadastrarAluno(dados.turmaId, { nome: dados.nome, total: dados.total, telefone: dados.tel });
      setModal(false);
      router.refresh();
    } finally {
      setPendente(false);
    }
  }
  function abrirAluno(a: AlunoReal) {
    router.push(`/alunos/${a.id}`);
  }

  const buscando = busca.trim().length > 0;
  const resultados = buscando ? alunos.filter((a) => a.nome.toLowerCase().includes(busca.trim().toLowerCase())) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-8 md:pb-10">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-wide text-ink">Alunos</h1>
          <p className="text-sm text-ink-soft">Cadastro e histórico dos alunos do ateliê.</p>
        </div>
        <button onClick={() => setModal(true)} className="hidden rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white shadow-soft hover:bg-accent-hover sm:block">
          + Cadastrar aluno
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-2.5">
        <Search size={16} className="shrink-0 text-ink-soft" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar aluno pelo nome…"
          className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-ink-soft"
        />
        {buscando && (
          <button onClick={() => setBusca("")} aria-label="Limpar busca" className="shrink-0 text-ink-soft">
            <X size={16} />
          </button>
        )}
      </div>

      <button onClick={() => setModal(true)} className="mb-4 w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-accent-hover sm:hidden">
        + Cadastrar aluno
      </button>

      {buscando ? (
        resultados.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white px-6 py-10 text-center text-sm text-ink-soft">
            Nenhum aluno encontrado para &quot;{busca}&quot;.
          </div>
        ) : (
          <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
            {resultados.map((a) => (
              <LinhaAluno key={a.id} a={a} onClick={() => abrirAluno(a)} />
            ))}
          </div>
        )
      ) : (
        <div className="space-y-3">
          {[...TURMAS_ORDEM_LABELS, "Sem turma"].map((label) => {
            const doGrupo = alunos.filter((a) => a.turma === label);
            if (doGrupo.length === 0) return null;
            const cor = TURMA_LABEL_COR[label] ?? "sienna";
            const aberta = turmaAberta === label;
            return (
              <div key={label} className="overflow-hidden rounded-2xl border border-line bg-white">
                <button onClick={() => setTurmaAberta(aberta ? null : label)} className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left">
                  <span className="flex items-center gap-2.5">
                    <span className={"h-2.5 w-2.5 shrink-0 rounded-full " + PONTO_COR[cor]} />
                    <span className="text-sm font-semibold text-ink">{label}</span>
                    <span className="text-xs text-ink-soft">
                      {doGrupo.length} aluno{doGrupo.length !== 1 ? "s" : ""}
                    </span>
                  </span>
                  <ChevronDown size={18} className={"shrink-0 text-ink-soft transition-transform " + (aberta ? "rotate-180" : "")} />
                </button>
                {aberta && (
                  <div className="divide-y divide-line border-t border-line">
                    {doGrupo.map((a) => (
                      <LinhaAluno key={a.id} a={a} onClick={() => abrirAluno(a)} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {alunos.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-white px-6 py-16 text-center">
          <GraduationCap size={26} className="text-ink-soft" />
          <h2 className="text-base font-semibold text-ink">Nenhum aluno cadastrado ainda</h2>
        </div>
      )}

      {modal && (
        <Modal onClose={() => setModal(false)}>
          <h3 className="mb-3 text-base font-semibold text-ink">Cadastrar aluno</h3>
          <FormAluno turmas={turmas} pendente={pendente} onCancelar={() => setModal(false)} onSalvar={cadastrar} />
        </Modal>
      )}
    </div>
  );
}

function LinhaAluno({ a, onClick }: { a: AlunoReal; onClick: () => void }) {
  const cor = TURMA_LABEL_COR[a.turma] ?? "sienna";
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-cream">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar nome={a.nome} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="truncate text-sm font-medium text-ink">{a.nome}</span>
            {a.status === "pendente" && <Badge tone="warning">Pendente</Badge>}
            {a.status === "ultima" && <Badge tone="danger">Renovar</Badge>}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-ink-soft">
            <span className={"h-1.5 w-1.5 shrink-0 rounded-full " + PONTO_COR[cor]} />
            {a.turma}
            {a.tel ? ` · ${a.tel}` : ""}
          </div>
        </div>
      </div>
      <div className="relative shrink-0">
        <ProgressRing percentual={(a.aula / a.total) * 100} size={40} stroke={5} color={ANEL_COR[cor]} trackColor={ANEL_TRACK[cor]} />
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold" style={{ color: ANEL_COR[cor] }}>
          {a.aula}/{a.total}
        </span>
      </div>
    </button>
  );
}

function FormAluno({
  turmas, pendente, onCancelar, onSalvar,
}: {
  turmas: { id: string; nome: string }[];
  pendente: boolean;
  onCancelar: () => void;
  onSalvar: (dados: { nome: string; tel: string | null; turmaId: string; total: number }) => void;
}) {
  const [nome, setNome] = useState("");
  const [tel, setTel] = useState("");
  const [turmaId, setTurmaId] = useState(turmas[0]?.id ?? "");
  const [total, setTotal] = useState(4);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!nome.trim() || !turmaId) return;
        onSalvar({ nome: nome.trim(), tel: tel.trim() || null, turmaId, total });
      }}
    >
      <label className="mb-1 block text-xs font-medium text-ink-soft">Nome completo</label>
      <input autoFocus value={nome} onChange={(e) => setNome(e.target.value)} className="mb-3 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-ink" placeholder="Nome do aluno" />
      <label className="mb-1 block text-xs font-medium text-ink-soft">Telefone</label>
      <input value={tel} onChange={(e) => setTel(e.target.value)} className="mb-3 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-ink" placeholder="(14) 99999-9999" />
      <label className="mb-1 block text-xs font-medium text-ink-soft">Turma fixa</label>
      <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)} className="mb-3 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-ink">
        {turmas.map((t) => (
          <option key={t.id} value={t.id}>{t.nome}</option>
        ))}
      </select>
      <label className="mb-1 block text-xs font-medium text-ink-soft">Pacote</label>
      <div className="mb-4 flex gap-2">
        {[4, 8, 12].map((n) => (
          <button type="button" key={n} onClick={() => setTotal(n)} className={"flex-1 rounded-lg border px-3 py-2 text-sm font-medium " + (total === n ? "border-ink bg-cream-soft text-ink" : "border-line text-ink-soft")}>
            {n} aulas
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onCancelar} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink">
          Cancelar
        </button>
        <button type="submit" disabled={pendente} className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60">
          {pendente ? "Cadastrando…" : "Cadastrar"}
        </button>
      </div>
    </form>
  );
}
