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
}: {
  percentual: number;
  size?: number;
  stroke?: number;
  className?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentual / 100) * circumference;

  return (
    <svg width={size} height={size} className={cn("-rotate-90", className)}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={stroke}
        className="fill-none stroke-ink-100 dark:stroke-ink-700"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="fill-none stroke-clay-500 transition-[stroke-dashoffset] duration-700 ease-out animate-pulse-flame"
      />
    </svg>
  );
}
