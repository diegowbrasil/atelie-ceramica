"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  salvarConfigLembretes, previaLembretes, enviarTesteAgora, marcarRespostasComoLidas, type PainelLembretes, type RespostaAluno,
} from "@/lib/actions/lembretes";
import type { LembretePlanejado } from "@/lib/lembretesServidor";
import { hojeNoAtelie } from "@/lib/lembretes";
import { mensagemDeErro } from "@/lib/resultado";
import type { LembretesModo } from "@/types/database";
import { MessageCircle, Check, Circle, Send } from "lucide-react";

const MODOS: { id: LembretesModo; label: string; dica: string }[] = [
  { id: "desligado", label: "Desligado", dica: "Nada é enviado." },
  { id: "teste", label: "Teste", dica: "Todo dia, até 3 lembretes vão só pro número de teste. Aluno nenhum recebe." },
  { id: "ativo", label: "Ligado", dica: "Os alunos recebem os lembretes todo dia, por volta das 8h." },
];

const BADGE_MODO: Record<LembretesModo, { tone: "neutral" | "warning" | "success"; label: string }> = {
  desligado: { tone: "neutral", label: "Desligado" },
  teste: { tone: "warning", label: "Em teste" },
  ativo: { tone: "success", label: "Ligado" },
};

const BADGE_ENVIO = {
  enviado: { tone: "success", label: "Enviado" },
  erro: { tone: "danger", label: "Erro" },
  enviando: { tone: "warning", label: "Enviando" },
} as const;

function diaMes(dataISO: string) {
  return `${dataISO.slice(8, 10)}/${dataISO.slice(5, 7)}`;
}

export function LembretesCard({ painel }: { painel: PainelLembretes }) {
  const router = useRouter();
  const [numeroTeste, setNumeroTeste] = useState(painel.numeroTeste);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmandoLigar, setConfirmandoLigar] = useState(false);
  const [testando, setTestando] = useState(false);
  const [resultadoTeste, setResultadoTeste] = useState<{ tipo: string; ok: boolean; erro?: string }[] | null>(null);
  const [dataPrevia, setDataPrevia] = useState(() => hojeNoAtelie());
  const [previa, setPrevia] = useState<LembretePlanejado[] | null>(null);
  const [carregandoPrevia, setCarregandoPrevia] = useState(false);
  const [erroPrevia, setErroPrevia] = useState<string | null>(null);

  useEffect(() => setNumeroTeste(painel.numeroTeste), [painel.numeroTeste]);

  const contaPronta = painel.instalado && painel.apiConfigurada;

  async function salvar(modo: LembretesModo) {
    setSalvando(true);
    setErro(null);
    try {
      const r = await salvarConfigLembretes({ modo, numeroTeste });
      if (!r.ok) return setErro(r.erro);
      setConfirmandoLigar(false);
      router.refresh();
    } catch (e) {
      setErro(mensagemDeErro(e, "Não deu pra salvar. Tenta de novo."));
    } finally {
      setSalvando(false);
    }
  }

  async function testarAgora() {
    setTestando(true);
    setResultadoTeste(null);
    setErro(null);
    try {
      const r = await enviarTesteAgora();
      if (!r.ok) return setErro(r.erro);
      setResultadoTeste(r.resultados);
    } catch (e) {
      setErro(mensagemDeErro(e, "Não deu pra enviar o teste. Tenta de novo."));
    } finally {
      setTestando(false);
    }
  }

  async function verPrevia() {
    setCarregandoPrevia(true);
    setErroPrevia(null);
    try {
      const r = await previaLembretes(dataPrevia);
      if (!r.ok) return setErroPrevia(r.erro);
      setPrevia(r.lembretes);
    } catch (e) {
      setErroPrevia(mensagemDeErro(e, "Não deu pra montar a prévia. Tenta de novo."));
    } finally {
      setCarregandoPrevia(false);
    }
  }

  const exemplos = previa
    ? (["aula", "oficina"] as const).map((tipo) => previa.find((l) => l.tipo === tipo)).filter((l): l is LembretePlanejado => !!l)
    : [];
  const recebem = previa?.filter((l) => !l.motivoSemEnvio).length ?? 0;

  return (
    <section>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink">
            <MessageCircle size={15} /> Lembretes por WhatsApp
          </h2>
          <p className="text-xs text-ink-soft">Aula: no próprio dia, por volta das 8h. Oficina: na véspera, no mesmo horário.</p>
        </div>
        <Badge tone={BADGE_MODO[painel.modo].tone} className="shrink-0">{BADGE_MODO[painel.modo].label}</Badge>
      </div>

      <div className="space-y-4 rounded-2xl border border-line bg-white p-4">
        {!painel.instalado && (
          <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            Ainda falta instalar os lembretes no banco de dados. A prévia abaixo já funciona; o resto liga depois disso.
          </p>
        )}

        <ul className="space-y-1.5 text-sm">
          <ItemConfig ok={painel.apiConfigurada} label="Conta do WhatsApp (Meta)" okLabel="Conectada" />
          <ItemConfig ok={painel.agendamentoConfigurado} label="Envio diário automático" okLabel="Agendado" />
          <ItemConfig ok={painel.respostasConfigurado} label="Receber respostas dos alunos" okLabel="Conectado" />
        </ul>

        <div>
          <p className="mb-1.5 text-xs font-medium text-ink-soft">Modo</p>
          <div className="flex gap-2">
            {MODOS.map((m) => {
              const bloqueado = salvando || !painel.instalado || (m.id !== "desligado" && !contaPronta);
              return (
                <button
                  key={m.id}
                  type="button"
                  disabled={bloqueado}
                  onClick={() => (m.id === "ativo" ? setConfirmandoLigar(true) : salvar(m.id))}
                  aria-pressed={painel.modo === m.id}
                  className={
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 " +
                    (painel.modo === m.id ? "border-ink bg-cream-soft text-ink" : "border-line text-ink-soft hover:bg-cream")
                  }
                >
                  {m.label}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-xs text-ink-soft">
            {painel.instalado && !painel.apiConfigurada
              ? "Teste e Ligado ficam disponíveis depois que a conta do WhatsApp estiver conectada."
              : MODOS.find((m) => m.id === painel.modo)?.dica}
          </p>
        </div>

        <div>
          <label htmlFor="numero-teste" className="mb-1.5 block text-xs font-medium text-ink-soft">Número de teste (o seu)</label>
          <div className="flex gap-2">
            <input
              id="numero-teste"
              type="tel"
              value={numeroTeste}
              onChange={(e) => setNumeroTeste(e.target.value)}
              disabled={!painel.instalado}
              placeholder="(14) 99999-9999"
              className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-ink disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => salvar(painel.modo)}
              disabled={salvando || !painel.instalado || numeroTeste.trim() === painel.numeroTeste}
              className="shrink-0 rounded-xl border border-line px-3 py-2 text-sm font-medium text-ink hover:bg-cream disabled:opacity-50"
            >
              Salvar
            </button>
          </div>
          <button
            type="button"
            onClick={testarAgora}
            disabled={testando || !contaPronta || !painel.numeroTeste}
            className="mt-2 flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-sm font-medium text-ink hover:bg-cream disabled:opacity-50"
          >
            <Send size={14} /> {testando ? "Enviando…" : "Enviar teste agora"}
          </button>
          {resultadoTeste && (
            <ul className="mt-2 space-y-1 text-sm">
              {resultadoTeste.map((r) => (
                <li key={r.tipo} className={r.ok ? "text-emerald-700" : "text-rose-600"}>
                  {r.tipo}: {r.ok ? "enviado, confere no seu WhatsApp" : r.erro}
                </li>
              ))}
            </ul>
          )}
        </div>

        {erro && <p className="text-sm text-rose-600">{erro}</p>}

        <div className="border-t border-line pt-4">
          <p className="mb-1.5 text-xs font-medium text-ink-soft">Prévia: quem recebe no envio de um dia</p>
          <div className="flex gap-2">
            <input
              type="date"
              value={dataPrevia}
              onChange={(e) => setDataPrevia(e.target.value)}
              aria-label="Dia do envio"
              className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-ink"
            />
            <button
              type="button"
              onClick={verPrevia}
              disabled={carregandoPrevia || !dataPrevia}
              className="shrink-0 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
            >
              {carregandoPrevia ? "Montando…" : "Ver prévia"}
            </button>
          </div>
          {erroPrevia && <p className="mt-2 text-sm text-rose-600">{erroPrevia}</p>}

          {previa && (
            <div className="mt-3 space-y-3">
              {previa.length === 0 ? (
                <p className="text-sm text-ink-soft">Nenhum lembrete nesse dia: sem aula no dia e sem oficina no dia seguinte.</p>
              ) : (
                <>
                  <p className="text-sm text-ink">
                    {recebem} de {previa.length} {previa.length === 1 ? "pessoa recebe" : "pessoas recebem"}.
                  </p>
                  {exemplos.map((l) => (
                    <blockquote key={l.tipo} className="rounded-xl bg-cream p-3 text-sm text-ink">
                      <span className="mb-1 block text-xs font-medium text-ink-soft">Exemplo ({l.tipo === "aula" ? "aula" : "oficina"})</span>
                      {l.texto}
                    </blockquote>
                  ))}
                  <ul className="divide-y divide-line rounded-xl border border-line">
                    {previa.map((l, i) => (
                      <li key={`${l.tipo}-${l.referenciaId}-${l.alunoId ?? l.nome}-${i}`} className="flex items-start justify-between gap-3 p-2.5 text-sm">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">{l.nome}</p>
                          <p className="truncate text-xs text-ink-soft">{l.titulo}</p>
                        </div>
                        {l.motivoSemEnvio ? (
                          <span className="shrink-0 text-right text-xs text-ink-soft">Não recebe: {l.motivoSemEnvio}</span>
                        ) : (
                          <Badge tone="success" className="shrink-0">Recebe</Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>

        {painel.instalado && <RespostasAlunos respostas={painel.respostas} />}

        {painel.instalado && (
          <div className="border-t border-line pt-4">
            <p className="mb-1.5 text-xs font-medium text-ink-soft">Últimos envios</p>
            {painel.ultimosEnvios.length === 0 ? (
              <p className="text-sm text-ink-soft">Nenhum lembrete enviado ainda.</p>
            ) : (
              <ul className="divide-y divide-line rounded-xl border border-line">
                {painel.ultimosEnvios.map((e) => (
                  <li key={e.id} className="flex items-start justify-between gap-3 p-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="truncate text-ink">
                        {diaMes(e.data_referencia)} · {e.nome}
                      </p>
                      <p className="text-xs text-ink-soft">{e.tipo === "aula" ? "Aula" : "Oficina"}{e.erro ? ` — ${e.erro}` : ""}</p>
                    </div>
                    <Badge tone={BADGE_ENVIO[e.status].tone} className="shrink-0">{BADGE_ENVIO[e.status].label}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {confirmandoLigar && (
        <Modal onClose={() => setConfirmandoLigar(false)}>
          <h3 className="mb-1 text-base font-semibold text-ink">Ligar os lembretes?</h3>
          <p className="mb-4 text-sm text-ink-soft">
            A partir do próximo envio, por volta das 8h, quem tem aula no dia e quem está inscrito em oficina no dia seguinte recebe a mensagem no WhatsApp.
          </p>
          {erro && <p className="mb-3 text-sm text-rose-600">{erro}</p>}
          <div className="flex gap-2">
            <button onClick={() => setConfirmandoLigar(false)} disabled={salvando} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink disabled:opacity-60">
              Voltar
            </button>
            <button onClick={() => salvar("ativo")} disabled={salvando} className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60">
              {salvando ? "Ligando…" : "Ligar"}
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}

const ROTULO_TIPO: Record<string, string> = {
  audio: "áudio", image: "foto", video: "vídeo", document: "documento", sticker: "figurinha", location: "localização", contacts: "contato",
};

function RespostasAlunos({ respostas }: { respostas: RespostaAluno[] }) {
  const router = useRouter();
  const [marcando, setMarcando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const naoLidas = respostas.filter((r) => !r.lida).length;

  async function marcarLidas() {
    setMarcando(true);
    setErro(null);
    try {
      const r = await marcarRespostasComoLidas();
      if (!r.ok) return setErro(r.erro);
      router.refresh();
    } catch (e) {
      setErro(mensagemDeErro(e, "Não deu pra marcar como lidas. Tenta de novo."));
    } finally {
      setMarcando(false);
    }
  }

  return (
    <div id="respostas" className="scroll-mt-28 border-t border-line pt-4">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-ink-soft">
          Respostas dos alunos{naoLidas > 0 ? ` · ${naoLidas} ${naoLidas === 1 ? "nova" : "novas"}` : ""}
        </p>
        {naoLidas > 0 && (
          <button onClick={marcarLidas} disabled={marcando} className="shrink-0 text-xs font-medium text-ink-soft hover:text-ink disabled:opacity-60">
            {marcando ? "Marcando…" : "Marcar todas como lidas"}
          </button>
        )}
      </div>
      {erro && <p className="mb-2 text-sm text-rose-600">{erro}</p>}
      {respostas.length === 0 ? (
        <p className="text-sm text-ink-soft">
          Nenhuma resposta ainda. Quem responder um lembrete aparece aqui, e recebe na hora um aviso pra falar com a Hanna no número dela.
        </p>
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line">
          {respostas.map((r) => (
            <li key={r.id} className={"p-2.5 text-sm " + (r.lida ? "" : "bg-accent-soft")}>
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 truncate font-medium text-ink">{r.nome ?? r.telefoneFormatado}</p>
                <span className="shrink-0 text-xs text-ink-soft">{r.quando}</span>
              </div>
              <p className="mt-0.5 whitespace-pre-wrap break-words text-ink">{r.texto ?? `[${ROTULO_TIPO[r.tipo] ?? "mensagem"}]`}</p>
              <a
                href={`https://wa.me/${r.telefone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-xs font-medium text-accent hover:underline"
              >
                Responder pelo seu WhatsApp
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ItemConfig({ ok, label, okLabel }: { ok: boolean; label: string; okLabel: string }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-ink">{label}</span>
      <span className={"flex shrink-0 items-center gap-1 text-xs font-medium " + (ok ? "text-emerald-700" : "text-ink-soft")}>
        {ok ? <Check size={13} /> : <Circle size={11} />}
        {ok ? okLabel : "Falta configurar"}
      </span>
    </li>
  );
}
