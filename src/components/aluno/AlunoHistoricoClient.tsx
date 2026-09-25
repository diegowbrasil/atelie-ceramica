"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { AulaHistorico, PagamentoHistorico } from "@/lib/actions/alunoPortal";
import { CalendarCheck, Receipt } from "lucide-react";

const STATUS_AULA: Record<AulaHistorico["status"], { label: string; tone: "success" | "danger" | "neutral" }> = {
  presente: { label: "Presença confirmada", tone: "success" },
  falta: { label: "Faltou", tone: "danger" },
  reposicao: { label: "Reposição", tone: "neutral" },
  pendente: { label: "Aguardando confirmação", tone: "neutral" },
};

interface Props {
  aulas: AulaHistorico[];
  pagamentos: PagamentoHistorico[];
}

export function AlunoHistoricoClient({ aulas, pagamentos }: Props) {
  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-8">
      <h1 className="mb-5 text-center font-display text-2xl uppercase tracking-wide text-ink">Histórico</h1>

      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
        <CalendarCheck size={16} /> Minhas aulas
      </h2>
      {aulas.length === 0 ? (
        <p className="mb-6 text-sm text-ink-soft">
          Nenhuma aula registrada ainda — o histórico só passou a ser gravado a partir de 24/09/2026.
        </p>
      ) : (
        <div className="mb-6 space-y-2">
          {aulas.map((a, i) => {
            const info = STATUS_AULA[a.status];
            return (
              <Card key={i} className="flex items-center justify-between gap-2 p-3.5">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-ink">{a.turma}</div>
                  <div className="text-xs text-ink-soft">{a.dataFormatada}</div>
                </div>
                <Badge tone={info.tone}>{info.label}</Badge>
              </Card>
            );
          })}
        </div>
      )}

      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
        <Receipt size={16} /> Pagamentos
      </h2>
      {pagamentos.length === 0 ? (
        <p className="text-sm text-ink-soft">Nenhum pagamento registrado ainda.</p>
      ) : (
        <div className="space-y-2">
          {pagamentos.map((p) => (
            <Card key={p.id} className="flex items-center justify-between gap-2 p-3.5">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-ink">{p.descricao ?? "Pagamento"}</div>
                <div className="text-xs text-ink-soft">
                  {p.dataFormatada}
                  {p.valor != null ? ` · R$ ${p.valor}` : ""}
                </div>
              </div>
              <Badge tone={p.status === "pago" ? "success" : "warning"}>{p.status === "pago" ? "Pago" : "Pendente"}</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
