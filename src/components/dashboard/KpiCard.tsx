import { Card } from "@/components/ui/Card";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export function KpiCard({
  icon: Icon,
  value,
  label,
  href,
  linkLabel,
  tone = "clay",
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
  href: string;
  linkLabel: string;
  tone?: "clay" | "glaze" | "amber" | "rose";
}) {
  return (
    <Card className="p-4 animate-fade-up">
      <div
        className={{
          clay: "bg-clay-50 text-clay-600",
          glaze: "bg-glaze-50 text-glaze-700",
          amber: "bg-amber-500/10 text-amber-500",
          rose: "bg-rose-500/10 text-rose-500",
        }[tone] + " mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl"}
      >
        <Icon size={18} strokeWidth={2} />
      </div>
      <div className="font-display text-2xl text-ink-800 dark:text-ink-50">{value}</div>
      <div className="text-sm text-ink-400">{label}</div>
      <Link href={href} className="mt-2 inline-block text-xs font-medium text-clay-600 hover:underline">
        {linkLabel}
      </Link>
    </Card>
  );
}
