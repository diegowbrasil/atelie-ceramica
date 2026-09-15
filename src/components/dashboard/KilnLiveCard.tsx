"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { calcularPrevisao, ETAPA_LABEL, formatarDuracao, type ParametrosQueima } from "@/lib/forno";
import { Flame } from "lucide-react";
import { format } from "date-fns";

/**
 * Card grande de "Forno em andamento" no Dashboard.
 * Recebe os parâmetros crus da queima e faz o próprio cálculo em tempo
 * real (re-renderiza a cada segundo), então o servidor nunca precisa
 * enviar um número de temperatura já "congelado".
 */
export function KilnLiveCard({ params, nomeQueima }: { params: ParametrosQueima; nomeQueima: string }) {
  const [agora, setAgora] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const previsao = calcularPrevisao(params, agora);

  return (
    <Card className="overflow-hidden border-clay-200/70 bg-gradient-to-br from-clay-50 to-paper dark:from-clay-900/30 dark:to-paper-dark animate-fade-up">
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="flex items-center gap-2 text-clay-600">
          <Flame size={16} className="animate-pulse-flame" />
          <span className="text-sm font-semibold">Forno em andamento</span>
        </div>
        <Link
          href="/forno"
          className="inline-flex h-8 items-center rounded-xl bg-ink-100 px-3 text-sm font-medium text-ink-700 hover:bg-ink-200 dark:bg-ink-700 dark:text-ink-100"
        >
          Ver detalhes
        </Link>
      </div>

      <div className="px-5 pb-5 pt-3">
        <p className="mb-3 font-display text-base text-ink-700 dark:text-ink-100">{nomeQueima}</p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <div className="font-display text-3xl text-ink-800 dark:text-ink-50">
              {previsao.temperaturaEstimada}°C
            </div>
            <div className="text-xs text-ink-400">Temperatura atual (estimada)</div>
          </div>
          <div>
            <div className="font-display text-xl text-ink-700 dark:text-ink-100">
              {params.temperaturaMaxima}°C
            </div>
            <div className="text-xs text-ink-400">
              Faltam {previsao.grausRestantesAteMaxima}°C para a máxima
            </div>
          </div>
          <div>
            <div className="font-mono text-lg text-ink-700 dark:text-ink-100">
              {formatarDuracao(previsao.tempoDecorridoSeg)}
            </div>
            <div className="text-xs text-ink-400">Tempo decorrido</div>
          </div>
          <div>
            <div className="font-mono text-lg text-ink-700 dark:text-ink-100">
              {formatarDuracao(previsao.tempoRestanteSeg)}
            </div>
            <div className="text-xs text-ink-400">Tempo restante (estimado)</div>
          </div>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-700">
          <div
            className="h-full rounded-full bg-clay-500 transition-all duration-700"
            style={{ width: `${previsao.percentualAteMaxima}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between rounded-xl bg-white/60 px-3 py-2 text-sm dark:bg-black/10">
          <span className="font-medium text-clay-700">Etapa atual: {ETAPA_LABEL[previsao.etapaAtual]}</span>
          <span className="text-ink-400">
            Segura para abrir: {format(previsao.horarioSeguroParaAbrir, "dd/MM 'às' HH:mm")}
          </span>
        </div>
      </div>
    </Card>
  );
}
