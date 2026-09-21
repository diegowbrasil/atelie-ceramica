"use client";
import { cn } from "@/lib/utils";

/**
 * Anel de progresso do forno — o elemento-assinatura do produto.
 * Usa um arco em vez de um círculo fechado para reforçar a ideia de
 * "subindo até a máxima", com o traço acendendo em tom de chama.
 */
export function ProgressRing({
  percentual,
  size = 128,
  stroke = 10,
  className,
  color = "rgb(var(--accent))",
  trackColor = "rgb(var(--cream-soft))",
}: {
  percentual: number;
  size?: number;
  stroke?: number;
  className?: string;
  /** Cor do traço — customizável (ex: cor da turma de origem em AlunoDetalhe). */
  color?: string;
  trackColor?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(percentual, 0), 100) / 100) * circumference;

  return (
    <svg width={size} height={size} className={cn("-rotate-90", className)}>
      <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} fill="none" style={{ stroke: trackColor }} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        fill="none"
        style={{ stroke: color }}
        className="transition-[stroke-dashoffset] duration-700 ease-out animate-pulse-flame"
      />
    </svg>
  );
}
