import { Card } from "@/components/ui/Card";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  mono,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  mono?: boolean;
}) {
  return (
    <Card className="min-w-0 p-4">
      <div className="mb-2 flex items-center gap-1.5 text-ink-soft">
        <Icon size={15} />
        <span className="truncate text-xs">{label}</span>
      </div>
      <div className={"truncate text-lg font-semibold text-ink " + (mono ? "font-mono" : "")}>{value}</div>
      {sub && <div className="truncate text-xs text-ink-soft">{sub}</div>}
    </Card>
  );
}
