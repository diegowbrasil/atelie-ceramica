"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { OficinaParaAluno } from "@/lib/actions/alunoPortal";
import type { StatusPecas } from "@/types/database";
import { CalendarDays, Clock, Check } from "lucide-react";

const ETAPAS_PECAS: { id: StatusPecas; label: string }[] = [
  { id: "secagem", label: "Em secagem" },
  { id: "biscoitadas", label: "Peças biscoitadas" },
  { id: "esmaltadas", label: "Peças esmaltadas" },
  { id: "prontas", label: "Prontas para retirada" },
];

export function AlunoOficinasClient({ oficinas }: { oficinas: OficinaParaAluno[] }) {
  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-8">
      <h1 className="mb-5 text-center font-display text-2xl uppercase tracking-wide text-ink">Oficinas</h1>

      {oficinas.length === 0 ? (
        <p className="text-center text-sm text-ink-soft">Nenhuma oficina agendada ainda.</p>
      ) : (
        <div className="space-y-3">
          {oficinas.map((o) => {
            const cheia = o.ocupadas >= o.vagas;
            const idxAtual = ETAPAS_PECAS.findIndex((e) => e.id === o.statusPecas);
            return (
              <Card key={o.id} className="p-4">
                <h3 className="mb-1 text-sm font-semibold text-ink">{o.nome}</h3>
                <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-soft">
                  <span className="flex items-center gap-1"><CalendarDays size={12} />{o.data}</span>
                  <span className="flex items-center gap-1"><Clock size={12} />{o.hora}</span>
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <Badge tone={cheia ? "danger" : "success"}>{o.ocupadas}/{o.vagas} vagas</Badge>
                  {o.valor != null && <span className="text-xs text-ink-soft">R$ {o.valor} por pessoa</span>}
                </div>
                {o.descricao && <p className="mb-2 text-xs text-ink-soft">{o.descricao}</p>}

                {o.minhaParticipacao && (
                  <div className="mt-3 rounded-xl border border-line bg-cream p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-ink">Você está inscrito</span>
                      <Badge tone={o.minhaParticipacao.pagamento === "pendente" ? "warning" : "success"}>
                        {o.minhaParticipacao.pagamento === "pendente" ? "Pagamento pendente" : "Pago"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {ETAPAS_PECAS.map((e, i) => {
                        const concluida = i <= idxAtual;
                        const atual = i === idxAtual;
                        return (
                          <span
                            key={e.id}
                            className={
                              "rounded-full border px-2 py-1 text-[11px] font-medium " +
                              (atual ? "border-accent bg-accent-soft text-accent" : concluida ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-line bg-white text-ink-soft")
                            }
                          >
                            {concluida && !atual && <Check size={10} className="mr-0.5 inline" />}
                            {e.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
