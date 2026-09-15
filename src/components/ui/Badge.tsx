import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_STYLES: Record<Tone, string> = {
  success: "bg-glaze-100 text-glaze-700",
  warning: "bg-amber-500/10 text-amber-500",
  danger: "bg-rose-500/10 text-rose-500",
  info: "bg-clay-100 text-clay-700",
  neutral: "bg-ink-100 text-ink-500",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        TONE_STYLES[tone],
        className
      )}
      {...props}
    />
  );
}
