"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { calcularPrevisao, ETAPA_LABEL, type ParametrosQueima } from "@/lib/forno";
import { Flame } from "lucide-react";

// Substitui o antigo KilnLiveCard (card único, grande, com gráfico embutido)
// — o demo removeu o gráfico e trocou por 2 cards compactos, um por forno
// físico, só o essencial (CLAUDE.md, Dashboard).

const COR_FORNO_FRIO = "68 121 173";
const TEMP_FORNO_QUENTE = 250;

function corIncandescente(temp: number): string {
  const pontos = [
    { t: 100, rgb: [58, 30, 22] },
    { t: 500, rgb: [130, 30, 14] },
    { t: 700, rgb: [199, 51, 18] },
    { t: 900, rgb: [230, 96, 15] },
    { t: 1100, rgb: [244, 154, 28] },
    { t: 1300, rgb: [255, 214, 120] },
  ];
  if (temp <= pontos[0].t) return pontos[0].rgb.join(" ");
  for (let i = 1; i < pontos.length; i++) {
    if (temp <= pontos[i].t) {
      const a = pontos[i - 1];
      const b = pontos[i];
      const f = (temp - a.t) / (b.t - a.t);
      return a.rgb.map((v, idx) => Math.round(v + (b.rgb[idx] - v) * f)).join(" ");
    }
  }
  return pontos[pontos.length - 1].rgb.join(" ");
}
function fmtDuracaoCurta(seg: number) {
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}min` : `${m}min`;
}

export interface FornadaResumo {
  tipoLabel: string;
  params: ParametrosQueima;
}

export function FornoResumoCard({ nome, fornada, href }: { nome: string; fornada: FornadaResumo | null; href: string }) {
  const [agora, setAgora] = useState(() => new Date());

  useEffect(() => {
    if (!fornada) return;
    const id = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(id);
  }, [fornada]);

  if (!fornada) {
    return (
      <Link
        href={href}
        style={{ ["--glow-rgb" as string]: COR_FORNO_FRIO }}
        className="forno-fresco flex min-w-0 items-center gap-3 rounded-2xl border border-line bg-white p-4"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream-soft text-ink-soft">
          <Flame size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-ink">{nome}</div>
          <div className="text-xs text-ink-soft">Nenhuma fornada ativa</div>
        </div>
      </Link>
    );
  }

  const p = calcularPrevisao(fornada.params, agora);
  const quente = p.temperaturaEstimada >= TEMP_FORNO_QUENTE;

  return (
    <Link
      href={href}
      style={{ ["--glow-rgb" as string]: quente ? corIncandescente(p.temperaturaEstimada) : COR_FORNO_FRIO }}
      className={"flex min-w-0 items-center gap-3 rounded-2xl border border-line bg-white p-4 " + (quente ? "forno-brasa" : "forno-fresco")}
    >
      <div className="relative shrink-0">
        <ProgressRing percentual={p.percentualAteMaxima} size={48} stroke={5} />
        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-ink">{p.temperaturaEstimada}°</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-ink">{nome}</div>
        <div className="truncate text-xs text-ink-soft">
          {fornada.tipoLabel} · {ETAPA_LABEL[p.etapaAtual]}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="font-mono text-sm font-semibold text-ink">{fmtDuracaoCurta(p.tempoRestanteSeg)}</div>
        <div className="text-[11px] text-ink-soft">restante</div>
      </div>
    </Link>
  );
}
