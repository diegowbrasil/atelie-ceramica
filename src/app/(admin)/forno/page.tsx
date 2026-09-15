"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { calcularPrevisao, ETAPA_LABEL, formatarDuracao, type EtapaQueima, type ParametrosQueima } from "@/lib/forno";
import { format } from "date-fns";
import { Thermometer } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const ETAPAS_ORDEM: EtapaQueima[] = [
  "aquecendo", "maxima_atingida", "patamar", "resfriando", "aguardando_segura", "liberado_abrir", "finalizada",
];

// TODO(conectar dados reais): substituir pelos parâmetros da queima ativa
// vindos de `select * from queimas where etapa_atual <> 'finalizada' limit 1`
// e das leituras de `queima_leituras` para o gráfico estimado x real.
const PARAMS: ParametrosQueima = {
  temperaturaInicial: 25,
  temperaturaMaxima: 1240,
  velocidadeAquecimento: 3,
  tempoPatamarMin: 15,
  velocidadeResfriamento: 2.5,
  temperaturaSegura: 80,
  iniciadoEm: new Date(Date.now() - 6.7 * 3600 * 1000),
};

export default function FornoPage() {
  const [agora, setAgora] = useState(() => new Date());
  const [temperaturaInput, setTemperaturaInput] = useState("");

  useEffect(() => {
    const id = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const previsao = calcularPrevisao(PARAMS, agora);
  const dadosGrafico = useMemo(() => gerarDadosGrafico(PARAMS), []);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-8 md:pb-10">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink-800 dark:text-ink-50">Forno</h1>
          <p className="text-sm text-ink-400">Queima de Esmalte · iniciada em {format(PARAMS.iniciadoEm, "dd/MM 'às' HH:mm")}</p>
        </div>
        <button className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-medium text-rose-500 hover:bg-rose-500/5">
          Encerrar queima
        </button>
      </header>

      <div className="mb-5 flex gap-2 border-b border-ink-100 text-sm dark:border-ink-700">
        {["Em andamento", "Histórico", "Nova queima"].map((tab, i) => (
          <button
            key={tab}
            className={
              "border-b-2 px-3 pb-2.5 font-medium " +
              (i === 0 ? "border-clay-500 text-clay-600" : "border-transparent text-ink-400")
            }
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card className="p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <ProgressRing percentual={previsao.percentualAteMaxima} size={104} stroke={9} />
                  <span className="absolute inset-0 flex items-center justify-center font-display text-lg text-ink-800 dark:text-ink-50">
                    {previsao.percentualAteMaxima}%
                  </span>
                </div>
                <div>
                  <div className="font-display text-3xl text-ink-800 dark:text-ink-50">
                    {previsao.temperaturaEstimada}°C
                  </div>
                  <div className="text-sm text-ink-400">Temperatura atual (estimada)</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-xl text-ink-700 dark:text-ink-100">{PARAMS.temperaturaMaxima}°C</div>
                <div className="text-sm text-ink-400">
                  Faltam {previsao.grausRestantesAteMaxima}°C para a temperatura máxima
                </div>
              </div>
            </div>

            <EtapaTimeline etapaAtual={previsao.etapaAtual} />

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniStat label="Tempo decorrido" value={formatarDuracao(previsao.tempoDecorridoSeg)} mono />
              <MiniStat label="Tempo restante (estimado)" value={formatarDuracao(previsao.tempoRestanteSeg)} mono />
              <MiniStat label="Previsão máx. temp." value={format(previsao.horarioMaxima, "HH:mm")} />
              <MiniStat label="Previsão segura para abrir" value={format(previsao.horarioSeguroParaAbrir, "dd/MM 'às' HH:mm")} />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-ink-50 px-3 py-2.5 dark:bg-ink-800">
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  // TODO: persistir em `queima_leituras` + atualizar `queimas.temperatura_real`
                  // — isso recalibra automaticamente toda a previsão (ver lib/forno.ts).
                  setTemperaturaInput("");
                }}
              >
                <Thermometer size={16} className="text-clay-500" />
                <input
                  value={temperaturaInput}
                  onChange={(e) => setTemperaturaInput(e.target.value)}
                  placeholder="Temperatura real (°C)"
                  className="w-40 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-clay-400 dark:border-ink-600 dark:bg-surface-dark"
                />
                <button className="rounded-lg bg-clay-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-clay-600">
                  Atualizar temperatura
                </button>
              </form>
              <span className="text-xs text-ink-400">
                Última leitura real: {PARAMS.ultimaLeitura ? `${PARAMS.ultimaLeitura.temperatura}°C` : "— (usando estimativa)"}
              </span>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-ink-700 dark:text-ink-100">Gráfico da queima</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--tw-ink-100, #E7E0D6)" />
                  <XAxis dataKey="hora" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="°C" width={50} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="estimada" name="Temperatura estimada" stroke="#DE8E60" strokeDasharray="4 3" dot={false} />
                  <Line type="monotone" dataKey="real" name="Temperatura real" stroke="#B85A2C" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-ink-700 dark:text-ink-100">Informações da queima</h3>
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-ink-400">Tipo</dt><dd className="text-right font-medium">Esmalte</dd>
              <dt className="text-ink-400">Vel. aquecimento</dt><dd className="text-right font-medium">{PARAMS.velocidadeAquecimento}°C/min</dd>
              <dt className="text-ink-400">Temp. inicial</dt><dd className="text-right font-medium">{PARAMS.temperaturaInicial}°C</dd>
              <dt className="text-ink-400">Vel. resfriamento</dt><dd className="text-right font-medium">{PARAMS.velocidadeResfriamento}°C/min</dd>
              <dt className="text-ink-400">Temp. máxima</dt><dd className="text-right font-medium">{PARAMS.temperaturaMaxima}°C</dd>
              <dt className="text-ink-400">Temp. segura</dt><dd className="text-right font-medium">{PARAMS.temperaturaSegura}°C</dd>
              <dt className="text-ink-400">Tempo de patamar</dt><dd className="text-right font-medium">{PARAMS.tempoPatamarMin} minutos</dd>
              <dt className="text-ink-400">Conteúdo</dt><dd className="text-right font-medium">Misturado</dd>
            </dl>
          </Card>

          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-100">Conteúdo do forno</h3>
              <button className="text-xs font-medium text-clay-600 hover:underline">Ver detalhes</button>
            </div>
            <ul className="space-y-2.5 text-sm">
              <li className="flex justify-between"><span className="text-ink-400">Peças de alunos</span><span className="font-medium">10 alunos · 32 peças</span></li>
              <li className="flex justify-between"><span className="text-ink-400">Peças de oficinas</span><span className="font-medium">18 peças</span></li>
              <li className="flex justify-between"><span className="text-ink-400">Encomendas</span><span className="font-medium">3 · 12 peças</span></li>
              <li className="flex justify-between"><span className="text-ink-400">Queimas por fora</span><span className="font-medium">2 · 15 peças</span></li>
              <li className="mt-1 flex justify-between border-t border-ink-100 pt-2 font-semibold text-ink-700 dark:border-ink-700 dark:text-ink-100">
                <span>Total geral</span><span>77 peças</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function EtapaTimeline({ etapaAtual }: { etapaAtual: EtapaQueima }) {
  const idxAtual = ETAPAS_ORDEM.indexOf(etapaAtual);
  return (
    <div className="flex items-center gap-1">
      {ETAPAS_ORDEM.map((etapa, i) => (
        <div key={etapa} className="flex flex-1 items-center gap-1">
          <div
            className={
              "flex h-7 flex-1 items-center justify-center rounded-lg text-center text-[11px] font-medium leading-tight " +
              (i === idxAtual
                ? "bg-clay-500 text-white"
                : i < idxAtual
                ? "bg-clay-100 text-clay-600"
                : "bg-ink-50 text-ink-300 dark:bg-ink-800")
            }
            title={ETAPA_LABEL[etapa]}
          >
            {ETAPA_LABEL[etapa]}
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniStat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl bg-ink-50 px-3 py-2.5 dark:bg-ink-800">
      <div className={"text-base font-semibold text-ink-700 dark:text-ink-100 " + (mono ? "font-mono" : "")}>{value}</div>
      <div className="text-xs text-ink-400">{label}</div>
    </div>
  );
}

/** Gera pontos de amostra (estimada x real) para o gráfico, a partir dos parâmetros. */
function gerarDadosGrafico(params: ParametrosQueima) {
  const pontos = [];
  const passos = 12;
  for (let i = 0; i <= passos; i++) {
    const t = new Date(params.iniciadoEm.getTime() + (i / passos) * 16 * 3600 * 1000);
    const p = calcularPrevisao(params, t);
    pontos.push({
      hora: format(t, "HH:mm"),
      estimada: p.temperaturaEstimada,
      real: t <= new Date() ? p.temperaturaEstimada + (Math.random() * 20 - 10) : null,
    });
  }
  return pontos;
}
