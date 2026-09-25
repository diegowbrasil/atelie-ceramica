"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressRing } from "@/components/ui/ProgressRing";
import {
  calcularPrevisao, ETAPA_LABEL, formatarDuracao,
  type ParametrosQueima,
} from "@/lib/forno";
import {
  iniciarFornada as iniciarFornadaReal,
  atualizarTemperatura as atualizarTemperaturaReal,
  adicionarObservacao as adicionarObservacaoReal,
  finalizarFornada as finalizarFornadaReal,
  cancelarFornada as cancelarFornadaReal,
  editarConteudo as editarConteudoReal,
  type FornadaReal,
} from "@/lib/actions/forno";
import type { FornoFisico, TipoQueima as TipoQueimaDB, ConteudoCategoria } from "@/types/database";
import {
  Flame, Plus, Clock, ShieldCheck, Thermometer, MessageCircle, Pencil, Check,
  School, GraduationCap, Package, Truck, type LucideIcon,
} from "lucide-react";

// Referência de comportamento: demo/AtelieDemo.jsx (PainelForno/FornadaAtivaPainel).
// Ligado aos dados reais (2026-09-24) — a forma local `Fornada` (com
// `Date` de verdade) é mantida igual ao que já existia; só a CASCA (busca
// via getFornadasReal, mutações via Server Actions) mudou. `calcularPrevisao`
// (src/lib/forno.ts) não foi tocado — continua a única fonte do cálculo de
// previsão, igual antes.

type FornoId = FornoFisico;
const FORNOS: { id: FornoId; nome: string }[] = [
  { id: "forno1", nome: "Forno 1" },
  { id: "forno2", nome: "Forno 2" },
];

type TipoQueima = TipoQueimaDB;
const TIPO_LABEL: Record<TipoQueima, string> = { esmalte: "Esmalte", biscoito: "Biscoito", outro: "Outros" };

type CategoriaId = "alunos" | "oficinas" | "encomendas" | "fora";
const CATEGORIAS: { id: CategoriaId; label: string; icon: LucideIcon }[] = [
  { id: "alunos", label: "Peças de alunos", icon: School },
  { id: "oficinas", label: "Peças de oficinas", icon: GraduationCap },
  { id: "encomendas", label: "Encomendas", icon: Package },
  { id: "fora", label: "Queimas por fora", icon: Truck },
];

type FornadaStatus = "andamento" | "finalizada" | "interrompida" | "cancelada";
const STATUS_LABEL: Record<FornadaStatus, string> = {
  andamento: "Em andamento", finalizada: "Finalizada", interrompida: "Interrompida", cancelada: "Cancelada",
};
const STATUS_TONE: Record<FornadaStatus, "warning" | "success" | "info" | "neutral"> = {
  andamento: "warning", finalizada: "success", interrompida: "info", cancelada: "neutral",
};

type ConfigQueima = Omit<ParametrosQueima, "iniciadoEm" | "finalizadoEm" | "ultimaLeitura">;
const PRESETS: Record<TipoQueima, ConfigQueima> = {
  esmalte: { temperaturaInicial: 25, temperaturaMaxima: 1240, velocidadeAquecimento: 3, tempoPatamarMin: 15, velocidadeResfriamento: 2.5, temperaturaSegura: 80 },
  biscoito: { temperaturaInicial: 25, temperaturaMaxima: 980, velocidadeAquecimento: 4, tempoPatamarMin: 20, velocidadeResfriamento: 3, temperaturaSegura: 80 },
  outro: { temperaturaInicial: 25, temperaturaMaxima: 1000, velocidadeAquecimento: 3, tempoPatamarMin: 10, velocidadeResfriamento: 2.5, temperaturaSegura: 80 },
};

interface Fornada {
  id: string;
  fornoId: FornoId;
  tipo: TipoQueima;
  tipoDescricao: string;
  categorias: CategoriaId[];
  detalhesConteudo: string;
  config: ConfigQueima;
  iniciadoEm: Date;
  finalizadoEm: Date | null;
  status: FornadaStatus;
  leituras: { temperatura: number; em: Date }[];
  observacoes: { em: Date; texto: string }[];
}

function paraFornadaLocal(f: FornadaReal): Fornada {
  return {
    id: f.id,
    fornoId: f.fornoId,
    tipo: f.tipo,
    tipoDescricao: f.tipoDescricao,
    categorias: f.categorias as CategoriaId[], // banco aceita "misturado" também, mas a UI nunca produz esse valor (CLAUDE.md — removida a pedido)
    detalhesConteudo: f.detalhesConteudo,
    config: f.config,
    iniciadoEm: f.iniciadoEm ? new Date(f.iniciadoEm) : new Date(),
    finalizadoEm: f.finalizadoEm ? new Date(f.finalizadoEm) : null,
    status: f.status,
    leituras: f.leituras.map((l) => ({ temperatura: l.temperatura, em: new Date(l.em) })),
    observacoes: f.observacoes.map((o) => ({ em: new Date(o.em), texto: o.texto })),
  };
}

function fmtDuracaoCurta(seg: number) {
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}min` : `${m}min`;
}
function fmtHora(d: Date) {
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
function fmtDiaHora(d: Date) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " às " + fmtHora(d);
}
function fmtRelativo(d: Date, agora: Date) {
  const min = Math.round((agora.getTime() - d.getTime()) / 60000);
  if (min < 1) return "agora mesmo";
  if (min < 60) return `há ${min} min`;
  return `há ${Math.floor(min / 60)}h`;
}
function paramsDe(f: Fornada): ParametrosQueima {
  const ultima = f.leituras[f.leituras.length - 1];
  return {
    ...f.config,
    iniciadoEm: f.iniciadoEm,
    finalizadoEm: f.finalizadoEm,
    ultimaLeitura: ultima ? { temperatura: ultima.temperatura, em: ultima.em } : null,
  };
}

export function FornoClient({ fornadasIniciais }: { fornadasIniciais: FornadaReal[] }) {
  const router = useRouter();
  const [fornadasReais, setFornadasReais] = useState<FornadaReal[]>(fornadasIniciais);
  const fornadas = fornadasReais.map(paraFornadaLocal);
  const [fornoSel, setFornoSel] = useState<FornoId>(
    () => fornadas.find((f) => f.status === "andamento")?.fornoId ?? FORNOS[0].id
  );
  const [agora, setAgora] = useState(() => new Date());
  const [modalTemp, setModalTemp] = useState(false);
  const [modalObs, setModalObs] = useState(false);
  const [modalFinalizar, setModalFinalizar] = useState(false);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [modalEditarConteudo, setModalEditarConteudo] = useState(false);
  const [modalNovaFornada, setModalNovaFornada] = useState(false);
  const [inputTemp, setInputTemp] = useState("");
  const [inputObs, setInputObs] = useState("");
  const [pendente, setPendente] = useState(false);

  // Esta tela não remonta sozinha ao navegar (sem param dinâmico na rota)
  // — mesmo padrão de resync já usado nos outros domínios.
  useEffect(() => setFornadasReais(fornadasIniciais), [fornadasIniciais]);

  useEffect(() => {
    const id = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const ativa = fornadas.find((f) => f.status === "andamento" && f.fornoId === fornoSel) ?? null;
  const historico = fornadas.filter((f) => f.fornoId === fornoSel);

  async function atualizarTemperatura(valor: number) {
    if (!ativa) return;
    setPendente(true);
    try {
      await atualizarTemperaturaReal(ativa.id, valor);
      router.refresh();
    } finally {
      setPendente(false);
    }
  }
  async function adicionarObservacao(texto: string) {
    if (!ativa) return;
    setPendente(true);
    try {
      await adicionarObservacaoReal(ativa.id, texto);
      router.refresh();
    } finally {
      setPendente(false);
    }
  }
  async function finalizarFornada() {
    if (!ativa) return;
    setPendente(true);
    try {
      await finalizarFornadaReal(ativa.id);
      router.refresh();
    } finally {
      setPendente(false);
    }
  }
  async function cancelarFornada() {
    if (!ativa) return;
    setPendente(true);
    try {
      await cancelarFornadaReal(ativa.id);
      router.refresh();
    } finally {
      setPendente(false);
    }
  }
  async function editarConteudo(categorias: CategoriaId[], detalhesConteudo: string) {
    if (!ativa) return;
    setPendente(true);
    try {
      await editarConteudoReal(ativa.id, categorias as ConteudoCategoria[], detalhesConteudo);
      router.refresh();
    } finally {
      setPendente(false);
    }
  }
  /** O servidor já interrompe sozinho qualquer fornada 'andamento' nesse
   *  forno antes de criar a nova (mesma regra do demo) — não precisa mais
   *  de lógica client-side pra isso. */
  async function iniciarFornada(dados: { tipo: TipoQueima; tipoDescricao: string; categorias: CategoriaId[]; detalhesConteudo: string; config: ConfigQueima }) {
    setPendente(true);
    try {
      await iniciarFornadaReal(fornoSel, { ...dados, categorias: dados.categorias as ConteudoCategoria[] });
      router.refresh();
    } finally {
      setPendente(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-8 md:pb-10">
      <div className="relative mb-5 flex min-h-[2.75rem] items-center justify-end gap-3">
        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-2xl uppercase tracking-wide text-ink">
          Forno
        </h1>
        <button
          onClick={() => setModalNovaFornada(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-accent-hover"
        >
          <Plus size={16} strokeWidth={2.5} />
          Nova fornada
        </button>
      </div>

      <div className="mb-5 flex gap-2">
        {FORNOS.map((forno) => {
          const temAtiva = fornadas.some((f) => f.status === "andamento" && f.fornoId === forno.id);
          const ativoTab = fornoSel === forno.id;
          return (
            <button
              key={forno.id}
              onClick={() => setFornoSel(forno.id)}
              className={"flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium " + (ativoTab ? "bg-accent text-white" : "bg-cream-soft text-ink-soft")}
            >
              {forno.nome}
              {temAtiva && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
            </button>
          );
        })}
      </div>

      {!ativa ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-white px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cream-soft text-ink-soft">
            <Flame size={26} />
          </div>
          <h2 className="text-lg font-semibold text-ink">Nenhuma fornada em andamento no {FORNOS.find((f) => f.id === fornoSel)?.nome}</h2>
          <p className="max-w-sm text-sm text-ink-soft">
            Inicie uma nova fornada para começar o acompanhamento em tempo real da temperatura, etapas e previsões.
          </p>
          <button
            onClick={() => setModalNovaFornada(true)}
            className="mt-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-accent-hover"
          >
            + Nova fornada
          </button>
        </div>
      ) : (
        <FornadaAtivaPainel
          fornada={ativa}
          agora={agora}
          onAtualizarTemp={() => setModalTemp(true)}
          onAdicionarObs={() => setModalObs(true)}
          onFinalizar={() => setModalFinalizar(true)}
          onCancelar={() => setModalCancelar(true)}
          onEditarConteudo={() => setModalEditarConteudo(true)}
        />
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div />
        <Card className="p-4 lg:col-start-2">
          <h3 className="mb-3 text-sm font-semibold text-ink">Histórico — {FORNOS.find((f) => f.id === fornoSel)?.nome}</h3>
          <ul className="space-y-3">
            {historico.map((f) => (
              <li key={f.id} className="rounded-xl border border-line p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-ink-soft">{fmtDiaHora(f.iniciadoEm)}</span>
                  <Badge tone={STATUS_TONE[f.status]}>{STATUS_LABEL[f.status]}</Badge>
                </div>
                <div className="text-sm font-medium text-ink">
                  {TIPO_LABEL[f.tipo]}
                  {f.tipoDescricao ? ` (${f.tipoDescricao})` : ""}
                </div>
                <div className="text-xs text-ink-soft">
                  {f.categorias.map((c) => CATEGORIAS.find((x) => x.id === c)?.label).join(", ") || "—"}
                </div>
                <div className="mt-1 text-xs text-ink-soft">Temp. máx: {f.config.temperaturaMaxima}°C</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {modalTemp && (
        <Modal onClose={() => setModalTemp(false)}>
          <h3 className="mb-3 text-base font-semibold text-ink">Atualizar temperatura</h3>
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              const v = parseFloat(inputTemp);
              if (!isNaN(v)) {
                atualizarTemperatura(v);
                setModalTemp(false);
                setInputTemp("");
              }
            }}
          >
            <label className="mb-1 block text-xs font-medium text-ink-soft">Temperatura real (°C)</label>
            <input
              autoFocus
              value={inputTemp}
              onChange={(e) => setInputTemp(e.target.value)}
              type="number"
              className="mb-4 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
              placeholder="Ex: 920"
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setModalTemp(false)} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink">
                Cancelar
              </button>
              <button type="submit" disabled={pendente} className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60">
                {pendente ? "Atualizando…" : "Atualizar"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modalObs && (
        <Modal onClose={() => setModalObs(false)}>
          <h3 className="mb-3 text-base font-semibold text-ink">Adicionar observação</h3>
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              if (inputObs.trim()) {
                adicionarObservacao(inputObs.trim());
                setModalObs(false);
                setInputObs("");
              }
            }}
          >
            <textarea
              autoFocus
              value={inputObs}
              onChange={(e) => setInputObs(e.target.value)}
              rows={3}
              className="mb-4 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
              placeholder="Ex: Patamar iniciado."
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setModalObs(false)} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink">
                Cancelar
              </button>
              <button type="submit" disabled={pendente} className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60">
                {pendente ? "Adicionando…" : "Adicionar"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modalFinalizar && (
        <Modal onClose={() => setModalFinalizar(false)}>
          <h3 className="mb-2 text-base font-semibold text-ink">Finalizar fornada?</h3>
          <p className="mb-5 text-sm text-ink-soft">
            A fornada será marcada como Finalizada e todo o histórico (temperaturas, observações e conteúdo) será salvo.
          </p>
          <div className="flex gap-2">
            <button onClick={() => setModalFinalizar(false)} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink">
              Cancelar
            </button>
            <button
              disabled={pendente}
              onClick={() => {
                finalizarFornada();
                setModalFinalizar(false);
              }}
              className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
            >
              Finalizar
            </button>
          </div>
        </Modal>
      )}

      {modalCancelar && (
        <Modal onClose={() => setModalCancelar(false)}>
          <h3 className="mb-2 text-base font-semibold text-ink">Cancelar fornada?</h3>
          <p className="mb-5 text-sm text-ink-soft">
            A fornada será marcada como Cancelada e sai do acompanhamento ativo. O histórico (temperaturas, observações registradas até agora) continua salvo.
          </p>
          <div className="flex gap-2">
            <button onClick={() => setModalCancelar(false)} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink">
              Voltar
            </button>
            <button
              disabled={pendente}
              onClick={() => {
                cancelarFornada();
                setModalCancelar(false);
              }}
              className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
            >
              Cancelar fornada
            </button>
          </div>
        </Modal>
      )}

      {modalEditarConteudo && ativa && (
        <ModalEditarConteudoForno
          fornada={ativa}
          pendente={pendente}
          onClose={() => setModalEditarConteudo(false)}
          onSalvar={(categorias, detalhes) => {
            editarConteudo(categorias, detalhes);
            setModalEditarConteudo(false);
          }}
        />
      )}

      {modalNovaFornada && (
        <ModalNovaFornada
          fornoNome={FORNOS.find((f) => f.id === fornoSel)?.nome ?? ""}
          temFornadaAtiva={!!ativa}
          pendente={pendente}
          onClose={() => setModalNovaFornada(false)}
          onIniciar={(dados) => {
            iniciarFornada(dados);
            setModalNovaFornada(false);
          }}
        />
      )}
    </div>
  );
}

function FornadaAtivaPainel({
  fornada, agora, onAtualizarTemp, onAdicionarObs, onFinalizar, onCancelar, onEditarConteudo,
}: {
  fornada: Fornada;
  agora: Date;
  onAtualizarTemp: () => void;
  onAdicionarObs: () => void;
  onFinalizar: () => void;
  onCancelar: () => void;
  onEditarConteudo: () => void;
}) {
  const ultima = fornada.leituras[fornada.leituras.length - 1] ?? null;
  const p = calcularPrevisao(paramsDe(fornada), agora);
  const restantePatamarSeg = Math.max((p.horarioFimPatamar.getTime() - agora.getTime()) / 1000, 0);
  const emAquecimentoOuPatamar = p.etapaAtual === "aquecendo" || p.etapaAtual === "patamar" || p.etapaAtual === "maxima_atingida";

  return (
    <>
      <Card className="p-5">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <ProgressRing percentual={p.percentualAteMaxima} size={176} stroke={12} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-semibold leading-none text-ink">{p.temperaturaEstimada}°</div>
                <div className="mt-1.5 text-xs text-ink-soft">de {fornada.config.temperaturaMaxima}°C</div>
              </div>
            </div>
            {ultima && (
              <div className="text-center text-xs text-ink-soft">
                Última informada: <span className="font-medium text-ink">{ultima.temperatura}°C</span> · {fmtRelativo(ultima.em, agora)}
              </div>
            )}
          </div>
          <div className="grid w-full flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-1 sm:items-start">
              <span className="flex items-center gap-1 text-xs text-ink-soft">
                <Flame size={13} />
                Etapa atual
              </span>
              <Badge tone="warning">{ETAPA_LABEL[p.etapaAtual]}</Badge>
            </div>
            <div className="flex flex-col items-center gap-0.5 sm:items-start">
              <span className="flex items-center gap-1 text-xs text-ink-soft">
                <Clock size={13} />
                Previsão temp. máxima
              </span>
              <span className="text-sm font-semibold text-ink">{fmtDiaHora(p.horarioMaxima)}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 sm:items-start">
              <span className="flex items-center gap-1 text-xs text-ink-soft">
                <ShieldCheck size={13} />
                Previsão abertura segura
              </span>
              <span className="text-sm font-semibold text-ink">{fmtDiaHora(p.horarioSeguroParaAbrir)}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={Clock} label="Tempo decorrido" value={formatarDuracao(p.tempoDecorridoSeg)} mono />
        <StatCard icon={Thermometer} label="Temp. máxima" value={fornada.config.temperaturaMaxima + "°C"} />
        <StatCard icon={Clock} label="Tempo restante" value={formatarDuracao(p.tempoRestanteSeg)} mono />
        <StatCard
          icon={Thermometer}
          label="Patamar"
          value={fmtHora(p.horarioFimPatamar)}
          sub={emAquecimentoOuPatamar ? `restam ${fmtDuracaoCurta(restantePatamarSeg)}` : undefined}
        />
        <StatCard icon={ShieldCheck} label="Abertura segura" value={fmtDiaHora(p.horarioSeguroParaAbrir)} />
        <StatCard icon={Flame} label="Etapa atual" value={ETAPA_LABEL[p.etapaAtual]} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr_280px]">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Conteúdo do forno</h3>
            <button onClick={onEditarConteudo} className="flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-ink">
              <Pencil size={13} />
              Editar
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {fornada.categorias.map((c) => {
              const cat = CATEGORIAS.find((x) => x.id === c);
              if (!cat) return null;
              return (
                <span key={c} className="inline-flex items-center gap-1 rounded-full bg-cream-soft px-2.5 py-1 text-xs font-medium text-ink">
                  <cat.icon size={13} />
                  {cat.label}
                </span>
              );
            })}
          </div>
          {fornada.detalhesConteudo && <p className="mt-3 text-sm text-ink-soft">{fornada.detalhesConteudo}</p>}
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold text-ink">Observações</h3>
          <ul className="max-h-44 space-y-3 overflow-y-auto pr-1 text-sm">
            {[...fornada.observacoes].reverse().map((o, i) => (
              <li key={i}>
                <span className="mr-2 font-mono text-xs text-ink-soft">{fmtHora(o.em)}</span>
                <span className="text-ink">{o.texto}</span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex flex-col gap-2.5">
          <button onClick={onAtualizarTemp} className="flex items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-semibold text-white shadow-soft hover:bg-accent-hover">
            <Thermometer size={17} />
            Atualizar temperatura
          </button>
          <button onClick={onAdicionarObs} className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white py-3.5 text-sm font-semibold text-ink hover:bg-cream">
            <MessageCircle size={17} />
            Adicionar observação
          </button>
          <button onClick={onFinalizar} className="flex items-center justify-center gap-2 rounded-xl bg-rose-50 py-3.5 text-sm font-semibold text-rose-600 hover:bg-rose-100">
            Finalizar fornada
          </button>
          {/* Discreto de propósito — CLAUDE.md documenta "3 botões grandes" como
             regra do painel; cancelar é bem menos comum, não compete com eles. */}
          <button onClick={onCancelar} className="py-1.5 text-xs font-medium text-ink-soft hover:text-rose-600">
            Cancelar fornada
          </button>
        </div>
      </div>
    </>
  );
}

function ModalEditarConteudoForno({
  fornada, pendente, onClose, onSalvar,
}: {
  fornada: Fornada;
  pendente: boolean;
  onClose: () => void;
  onSalvar: (categorias: CategoriaId[], detalhes: string) => void;
}) {
  const [categorias, setCategorias] = useState<CategoriaId[]>(fornada.categorias);
  const [detalhes, setDetalhes] = useState(fornada.detalhesConteudo || "");

  function toggleCategoria(id: CategoriaId) {
    setCategorias((cs) => (cs.includes(id) ? cs.filter((c) => c !== id) : [...cs, id]));
  }

  return (
    <Modal onClose={onClose}>
      <h3 className="mb-3 text-base font-semibold text-ink">Editar conteúdo do forno</h3>
      <div className="mb-4 grid grid-cols-2 gap-2.5">
        {CATEGORIAS.map((c) => {
          const ativo = categorias.includes(c.id);
          return (
            <button
              type="button"
              key={c.id}
              onClick={() => toggleCategoria(c.id)}
              className={
                "relative flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-4 text-center text-xs font-medium transition-all " +
                (ativo ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-soft hover:border-ink-soft")
              }
            >
              {ativo && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
              <c.icon size={18} />
              {c.label}
            </button>
          );
        })}
      </div>
      <label className="mb-1 block text-xs font-medium text-ink-soft">Detalhes do conteúdo (opcional)</label>
      <textarea
        value={detalhes}
        onChange={(e) => setDetalhes(e.target.value)}
        rows={2}
        className="mb-4 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
        placeholder="Ex: Peças da turma de terça junto com uma encomenda da Marina."
      />
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink">
          Cancelar
        </button>
        <button
          disabled={pendente}
          onClick={() => onSalvar(categorias, detalhes.trim())}
          className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {pendente ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </Modal>
  );
}

function ModalNovaFornada({
  fornoNome, temFornadaAtiva, pendente, onClose, onIniciar,
}: {
  fornoNome: string;
  temFornadaAtiva: boolean;
  pendente: boolean;
  onClose: () => void;
  onIniciar: (dados: { tipo: TipoQueima; tipoDescricao: string; categorias: CategoriaId[]; detalhesConteudo: string; config: ConfigQueima }) => void;
}) {
  const [tipo, setTipo] = useState<TipoQueima>("esmalte");
  const [tipoDescricao, setTipoDescricao] = useState("");
  const [categorias, setCategorias] = useState<CategoriaId[]>([]);
  const [detalhes, setDetalhes] = useState("");
  const [temperaturaMaxima, setTemperaturaMaxima] = useState(PRESETS.esmalte.temperaturaMaxima);
  const [confirmarSubstituicao, setConfirmarSubstituicao] = useState(false);

  function selecionarTipo(t: TipoQueima) {
    setTipo(t);
    setTemperaturaMaxima(PRESETS[t].temperaturaMaxima);
  }
  function toggleCategoria(id: CategoriaId) {
    setCategorias((cs) => (cs.includes(id) ? cs.filter((c) => c !== id) : [...cs, id]));
  }
  function confirmar() {
    onIniciar({
      tipo,
      tipoDescricao,
      categorias,
      detalhesConteudo: detalhes.trim(),
      config: { ...PRESETS[tipo], temperaturaMaxima },
    });
  }

  if (confirmarSubstituicao) {
    return (
      <Modal onClose={onClose}>
        <h3 className="mb-2 text-base font-semibold text-ink">{fornoNome} já tem uma fornada em andamento</h3>
        <p className="mb-5 text-sm leading-relaxed text-ink-soft">
          Esse forno já está sendo acompanhado. Ao iniciar uma nova fornada nele, a atual será marcada como Interrompida e salva no histórico — nenhuma informação será perdida.
        </p>
        <div className="flex gap-2">
          <button onClick={() => setConfirmarSubstituicao(false)} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink">
            Voltar
          </button>
          <button disabled={pendente} onClick={confirmar} className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60">
            {pendente ? "Salvando…" : "Salvar e criar nova"}
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <h3 className="mb-3 text-base font-semibold text-ink">Nova fornada — {fornoNome}</h3>

      <label className="mb-1.5 block text-xs font-medium text-ink-soft">Tipo de queima</label>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {(Object.keys(TIPO_LABEL) as TipoQueima[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => selecionarTipo(t)}
            className={
              "rounded-xl border-2 px-2 py-2.5 text-center text-xs font-medium " +
              (tipo === t ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-soft hover:border-ink-soft")
            }
          >
            {TIPO_LABEL[t]}
          </button>
        ))}
      </div>

      {tipo === "outro" && (
        <input
          value={tipoDescricao}
          onChange={(e) => setTipoDescricao(e.target.value)}
          placeholder="Descreva o tipo (ex: Lustre)"
          className="mb-4 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
        />
      )}

      <label className="mb-1.5 block text-xs font-medium text-ink-soft">Temperatura máxima (°C)</label>
      <input
        type="number"
        value={temperaturaMaxima}
        onChange={(e) => setTemperaturaMaxima(Number(e.target.value))}
        className="mb-4 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
      />

      <label className="mb-1.5 block text-xs font-medium text-ink-soft">Conteúdo do forno</label>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {CATEGORIAS.map((c) => {
          const ativo = categorias.includes(c.id);
          return (
            <button
              type="button"
              key={c.id}
              onClick={() => toggleCategoria(c.id)}
              className={
                "relative flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-4 text-center text-xs font-medium transition-all " +
                (ativo ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-soft hover:border-ink-soft")
              }
            >
              {ativo && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
              <c.icon size={18} />
              {c.label}
            </button>
          );
        })}
      </div>

      <label className="mb-1 block text-xs font-medium text-ink-soft">Detalhes do conteúdo (opcional)</label>
      <textarea
        value={detalhes}
        onChange={(e) => setDetalhes(e.target.value)}
        rows={2}
        className="mb-4 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
        placeholder="Ex: Peças da turma de terça junto com uma encomenda da Marina."
      />

      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink">
          Cancelar
        </button>
        <button
          disabled={pendente}
          onClick={() => (temFornadaAtiva ? setConfirmarSubstituicao(true) : confirmar())}
          className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {pendente ? "Salvando…" : "Iniciar fornada"}
        </button>
      </div>
    </Modal>
  );
}
