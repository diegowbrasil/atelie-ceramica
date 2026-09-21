import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

// Tons semânticos de status (emerald/amber/rose) continuam Tailwind core —
// são informação de estado, não identidade de marca (CLAUDE.md §6.1).
const TONE_STYLES: Record<Tone, string> = {
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-600",
  info: "border border-ink text-ink",
  neutral: "bg-cream-soft text-ink-soft",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 whitespace-normal break-words rounded-full px-2.5 py-1 text-xs font-medium",
        TONE_STYLES[tone],
        className
      )}
      {...props}
    />
  );
}
