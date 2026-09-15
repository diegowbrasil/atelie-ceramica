"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { Plus, MoreVertical } from "lucide-react";

export interface VagaOcupada {
  numero: number;
  aluno: { nome: string; fotoUrl?: string | null };
  aulaAtual: number;
  totalAulas: number;
  status: "confirmado" | "pendente" | "ultima_aula";
}

export interface VagaVazia {
  numero: number;
  vazia: true;
}

const STATUS_LABEL: Record<VagaOcupada["status"], string> = {
  confirmado: "Confirmado",
  pendente: "Pendente",
  ultima_aula: "Última aula",
};
const STATUS_TONE: Record<VagaOcupada["status"], "success" | "warning" | "danger"> = {
  confirmado: "success",
  pendente: "warning",
  ultima_aula: "danger",
};

export function VagaCard(props: (VagaOcupada | VagaVazia) & { onSolicitar?: () => void }) {
  if ("vazia" in props) {
    return (
      <button
        onClick={props.onSolicitar}
        className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink-200 bg-transparent px-3 py-6 text-center transition-colors hover:border-clay-400 hover:bg-clay-50/50 dark:border-ink-700"
      >
        <span className="text-xs text-ink-300">{props.numero}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-ink-300 text-ink-300">
          <Plus size={16} />
        </span>
        <span className="text-sm text-ink-400">Vaga disponível</span>
        <span className="rounded-lg border border-clay-300 px-2 py-1 text-xs font-medium text-clay-600">
          Solicitar vaga
        </span>
      </button>
    );
  }

  const destaque = props.status === "ultima_aula";

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-2xl border p-3 transition-colors",
        destaque ? "border-rose-500/30 bg-rose-500/[0.04]" : "border-ink-100 bg-white dark:border-ink-700 dark:bg-surface-dark"
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs text-ink-300">{props.numero}</span>
        <button className="text-ink-300 hover:text-ink-500">
          <MoreVertical size={15} />
        </button>
      </div>
      <Avatar nome={props.aluno.nome} fotoUrl={props.aluno.fotoUrl} size={44} />
      <div>
        <div className="truncate text-sm font-medium text-ink-700 dark:text-ink-100">{props.aluno.nome}</div>
        <div className="text-xs text-ink-400">
          {props.aulaAtual}/{props.totalAulas} aulas
        </div>
      </div>
      <Badge tone={STATUS_TONE[props.status]} className="w-fit">
        {STATUS_LABEL[props.status]}
      </Badge>
    </div>
  );
}
