"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { StatCard } from "@/components/ui/StatCard";
import { Avatar } from "@/components/ui/Avatar";
import { corOficina, oficinasIniciais, type Oficina, type Participante, type CorIdentidade } from "@/lib/oficinas";
import { ModalOficina } from "@/components/oficinas/ModalOficina";
import { ChevronLeft, CalendarDays, Clock, CreditCard, Users, Check, Plus } from "lucide-react";

const PILL_COR: Record<CorIdentidade, string> = {
  sienna: "bg-sienna/15 text-sienna", ardosia: "bg-ardosia/15 text-ardosia", musgo: "bg-musgo/15 text-musgo", cafe: "bg-cafe/15 text-cafe",
};

const ETAPAS_PECAS: { id: Oficina["statusPecas"]; label: string }[] = [
  { id: "secagem", label: "Em secagem" },
  { id: "biscoitadas", label: "Peças biscoitadas" },
  { id: "esmaltadas", label: "Peças esmaltadas" },
  { id: "prontas", label: "Prontas para retirada" },
];

export default function OficinaDetalhePage({ params }: { params: { oficinaId: string } }) {
  const router = useRouter();
  const [oficinas, setOficinas] = useState<Oficina[]>(oficinasIniciais);
  const [modalNumero, setModalNumero] = useState<number | null>(null);
  const [modalEditar, setModalEditar] = useState(false);
  const [verComoAluno, setVerComoAluno] = useState(false);

  const oficina = oficinas.find((o) => o.id === params.oficinaId);
  if (!oficina) {
    return (
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-8 md:pb-10">
        <p className="text-sm text-ink-soft">Oficina não encontrada.</p>
      </div>
    );
  }

  function atualizar(patch: Partial<Oficina>) {
    setOficinas((os) => os.map((o) => (o.id === oficina!.id ? { ...o, ...patch } : o)));
  }
  function cadastrarParticipante(numero: number, dados: Omit<Participante, "numero">) {
    atualizar({ participantes: oficina!.participantes.map((p) => (p.numero === numero ? { numero, ...dados } : p)) });
    setModalNumero(null);
  }
  function removerParticipante(numero: number) {
    atualizar({ participantes: oficina!.participantes.map((p) => (p.numero === numero ? { numero, nome: null } : p)) });
    setModalNumero(null);
  }
  function atualizarStatusPecas(status: Oficina["statusPecas"]) {
    atualizar({ statusPecas: status });
  }

  const preenchidos = oficina.participantes.filter((p) => p.nome);
  const pagos = preenchidos.filter((p) => p.pagamento === "pago").length;
  const pendentes = preenchidos.filter((p) => p.pagamento === "pendente").length;
  const duplas = preenchidos.filter((p) => p.tipo === "dupla").length;
  const opcoesDupla = preenchidos.filter((p) => p.tipo !== "dupla").map((p) => p.nome!);
  const idxAtual = ETAPAS_PECAS.findIndex((e) => e.id === oficina.statusPecas);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-8 md:pb-10">
      <button onClick={() => router.push("/oficinas")} className="mb-4 flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink">
        <ChevronLeft size={16} />
        Voltar para oficinas
      </button>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl uppercase tracking-wide text-ink">{oficina.nome}</h1>
            <Badge tone="success">{oficina.status}</Badge>
            <span className={"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium " + PILL_COR[corOficina(oficina.id)]}>Oficina</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-soft">
            <span className="flex items-center gap-1.5"><CalendarDays size={14} />{oficina.data}</span>
            <span className="flex items-center gap-1.5"><Clock size={14} />{oficina.hora}</span>
            {oficina.valor != null && <span className="flex items-center gap-1.5"><CreditCard size={14} />R$ {oficina.valor} por pessoa</span>}
            <span className="flex items-center gap-1.5"><Users size={14} />{oficina.vagas} vagas</span>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
          <button
            type="button"
            role="checkbox"
            aria-checked={verComoAluno}
            onClick={() => setVerComoAluno((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2.5 text-xs font-medium text-ink-soft"
          >
            <span className={"flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border " + (verComoAluno ? "border-accent bg-accent text-white" : "border-ink-soft")}>
              {verComoAluno && <Check size={10} strokeWidth={3} />}
            </span>
            Ver como aluno
          </button>
          <button onClick={() => setModalEditar(true)} className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink hover:bg-cream">
            Editar oficina
          </button>
          <button className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover">Enviar lembrete</button>
        </div>
      </div>

      <Card className="mb-5 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">Status das peças</h3>
          {verComoAluno && <Badge tone="info">Visualização do aluno</Badge>}
        </div>
        <div className="flex flex-wrap gap-2">
          {ETAPAS_PECAS.map((e, i) => {
            const concluida = i <= idxAtual;
            const atual = i === idxAtual;
            return (
              <button
                key={e.id}
                disabled={verComoAluno}
                onClick={() => !verComoAluno && atualizarStatusPecas(e.id)}
                className={
                  "min-w-[140px] flex-1 rounded-xl border px-3 py-3 text-left text-xs font-medium transition-all " +
                  (atual ? "border-accent bg-accent-soft text-accent" : concluida ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-line bg-cream text-ink-soft") +
                  (verComoAluno ? " cursor-default" : " cursor-pointer hover:border-ink-soft")
                }
              >
                <div
                  className="mb-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ background: atual ? "#C2410C" : concluida ? "#059669" : "#DEDAD1" }}
                >
                  {concluida && !atual ? <Check size={12} /> : i + 1}
                </div>
                {e.label}
              </button>
            );
          })}
        </div>
        {verComoAluno && <p className="mt-2 text-xs text-ink-soft">O aluno só visualiza — apenas o administrador altera o status.</p>}
      </Card>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Users} label="Participantes" value={`${preenchidos.length} / ${oficina.vagas}`} sub="inscritos" />
        <StatCard icon={Check} label="Pagos" value={pagos} sub="confirmados" />
        <StatCard icon={Clock} label="Pendentes" value={pendentes} sub="aguardando" />
        <StatCard icon={Users} label="Duplas" value={duplas} sub="participantes em dupla" />
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <Card className="p-4">
          <h3 className="mb-2 text-sm font-semibold text-ink">Sobre a oficina</h3>
          <p className="text-sm text-ink-soft">{oficina.descricao || "Sem descrição."}</p>
        </Card>
        <Card className="p-4">
          <h3 className="mb-2 text-sm font-semibold text-ink">Receita da oficina</h3>
          {oficina.receita.length === 0 ? (
            <p className="text-sm text-ink-soft">Sem receita cadastrada.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {oficina.receita.map((r) => (
                <li key={r.item} className="flex items-center justify-between">
                  <span className="text-ink">{r.item}</span>
                  <span className="text-ink-soft">{r.peso}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-4">
          <h3 className="mb-2 text-sm font-semibold text-ink">Observações</h3>
          <p className="text-sm text-ink">{oficina.observacoes || "Nenhuma observação registrada."}</p>
        </Card>
      </div>

      <h3 className="mb-3 text-sm font-semibold text-ink">Participantes ({oficina.vagas} vagas)</h3>
      <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
        {oficina.participantes.map((p) =>
          p.nome ? (
            <button key={p.numero} onClick={() => setModalNumero(p.numero)} className="flex w-full min-w-0 items-center gap-3 p-3 text-left hover:bg-cream">
              <Avatar nome={p.nome} size={40} />
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{p.nome}</span>
                <span className="text-xs text-ink-soft">{p.tipo === "dupla" ? (p.duplaCom ? `Dupla com ${p.duplaCom}` : "Dupla") : "Individual"}</span>
              </div>
              <Badge tone={p.pagamento === "pago" ? "success" : "warning"}>{p.pagamento === "pago" ? "Pago" : "Pendente"}</Badge>
            </button>
          ) : (
            <button key={p.numero} onClick={() => setModalNumero(p.numero)} className="flex w-full items-center gap-3 p-3 text-left hover:bg-cream">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-ink-soft text-ink-soft">
                <Plus size={16} />
              </span>
              <span className="min-w-0 flex-1 text-sm text-ink-soft">Vaga {p.numero} disponível</span>
              <span className="shrink-0 rounded-lg border border-ink-soft px-2 py-1 text-xs font-medium text-ink">Cadastrar participante</span>
            </button>
          )
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-cream px-3 py-2.5 text-sm text-ink-soft">
        Os lembretes serão enviados via WhatsApp um dia antes da oficina.
      </div>

      {modalNumero !== null && (
        <ModalCadastrarParticipante
          numero={modalNumero}
          participante={oficina.participantes.find((p) => p.numero === modalNumero)?.nome ? oficina.participantes.find((p) => p.numero === modalNumero)! : null}
          opcoesDupla={opcoesDupla}
          onClose={() => setModalNumero(null)}
          onSalvar={(dados) => cadastrarParticipante(modalNumero, dados)}
          onRemover={() => removerParticipante(modalNumero)}
        />
      )}

      {modalEditar && (
        <ModalOficina
          oficina={oficina}
          onClose={() => setModalEditar(false)}
          onSalvar={(dados) => {
            atualizar(dados);
            setModalEditar(false);
          }}
        />
      )}
    </div>
  );
}

function ModalCadastrarParticipante({
  numero, participante, opcoesDupla, onClose, onSalvar, onRemover,
}: {
  numero: number;
  participante: Participante | null;
  opcoesDupla: string[];
  onClose: () => void;
  onSalvar: (dados: Omit<Participante, "numero">) => void;
  onRemover: () => void;
}) {
  const editando = !!participante;
  const [nome, setNome] = useState(participante?.nome ?? "");
  const [tipo, setTipo] = useState<"individual" | "dupla">(participante?.tipo ?? "individual");
  const [duplaCom, setDuplaCom] = useState(participante?.duplaCom ?? "");
  const [pagamento, setPagamento] = useState<"pendente" | "pago">(participante?.pagamento ?? "pendente");

  return (
    <Modal onClose={onClose}>
      <h3 className="mb-3 text-base font-semibold text-ink">{editando ? `Editar participante — vaga ${numero}` : `Cadastrar participante — vaga ${numero}`}</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!nome.trim()) return;
          onSalvar({ nome: nome.trim(), tipo, duplaCom: tipo === "dupla" ? duplaCom || null : null, pagamento });
        }}
      >
        <label className="mb-1 block text-xs font-medium text-ink-soft">Nome</label>
        <input autoFocus value={nome} onChange={(e) => setNome(e.target.value)} className="mb-3 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-ink" placeholder="Nome do participante" />

        <label className="mb-1 block text-xs font-medium text-ink-soft">Tipo</label>
        <div className="mb-3 flex gap-2">
          {(["individual", "dupla"] as const).map((t) => (
            <button type="button" key={t} onClick={() => setTipo(t)} className={"flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize " + (tipo === t ? "border-ink bg-cream-soft text-ink" : "border-line text-ink-soft")}>
              {t}
            </button>
          ))}
        </div>

        {tipo === "dupla" && opcoesDupla.length > 0 && (
          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-ink-soft">Dupla com (opcional)</label>
            <select value={duplaCom ?? ""} onChange={(e) => setDuplaCom(e.target.value)} className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-ink">
              <option value="">Selecionar...</option>
              {opcoesDupla.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        )}

        <label className="mb-1 block text-xs font-medium text-ink-soft">Pagamento</label>
        <div className="mb-4 flex gap-2">
          {([["pendente", "Pendente"], ["pago", "Pago"]] as const).map(([id, label]) => (
            <button type="button" key={id} onClick={() => setPagamento(id)} className={"flex-1 rounded-lg border px-3 py-2 text-sm font-medium " + (pagamento === id ? "border-ink bg-cream-soft text-ink" : "border-line text-ink-soft")}>
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink">
            Cancelar
          </button>
          <button type="submit" className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover">
            {editando ? "Salvar" : "Cadastrar"}
          </button>
        </div>
        {editando && (
          <button type="button" onClick={onRemover} className="mt-2 w-full rounded-xl border border-rose-200 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50">
            Remover participante
          </button>
        )}
      </form>
    </Modal>
  );
}
