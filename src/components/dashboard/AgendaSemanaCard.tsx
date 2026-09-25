"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { FUNDOS_ARGILA } from "@/lib/fundosArgila";
import { Coffee, ChevronRight } from "lucide-react";

// "Turmas da semana" — lista vertical, um card por dia (sem scroll lateral),
// data real calculada a partir de hoje. Referência de comportamento: demo,
// AgendaSemanaCard. Cada card usa a foto de mesclagem de argila do seu dia
// (FUNDOS_ARGILA, mesma cor de identidade já usada no selo/Turmas) — dias
// sem cor própria (Seg/Sex/Dom) ou sem foto correspondente (falta "café")
// ficam no tom neutro de sempre.
//
// Ligado aos dados reais (2026-09-24) — `aulasPorDia` vem do Server
// Component (dashboard/page.tsx), que busca roster real (getRosterTurma,
// mesma fonte de Turmas) pras 4 turmas fixas e casa oficinas reais
// (getOficinasReal) contra as 7 datas desta semana. Só a estrutura
// ESTÁTICA da semana (quais dias existem, label, cor de identidade) fica
// aqui — isso nunca muda, não é "dado", é layout.

export type DiaId = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";
type CorIdentidade = "sienna" | "ardosia" | "musgo" | "cafe" | "carvao" | "ocre";

export interface AulaAgenda {
  hora: string;
  oficina?: string;
  inscritos?: number;
  ocupados?: number;
  total?: number;
  nomes?: string[];
}

const DIAS_SEMANA: { diaId: DiaId; label: string; cor?: CorIdentidade }[] = [
  { diaId: "seg", label: "SEG", cor: "ocre" },
  { diaId: "ter", label: "TER", cor: "sienna" },
  { diaId: "qua", label: "QUA", cor: "ardosia" },
  { diaId: "qui", label: "QUI", cor: "musgo" },
  { diaId: "sex", label: "SEX" },
  { diaId: "sab", label: "SÁB", cor: "carvao" },
  { diaId: "dom", label: "DOM" },
];

const MENSAGEM_DIA_VAZIO: Partial<Record<DiaId, string>> = {
  seg: "Aproveite para se inspirar!",
  sex: "Final de semana criativo!",
  sab: "Oficinas voltam em outubro!",
  dom: "Dia de descanso.",
};

const SELO_COR: Record<CorIdentidade, string> = {
  sienna: "bg-sienna text-white", ardosia: "bg-ardosia text-white", musgo: "bg-musgo text-white", cafe: "bg-cafe text-white", carvao: "bg-carvao text-white", ocre: "bg-ocre text-white",
};
const BORDA_COR: Record<CorIdentidade, string> = {
  sienna: "border-sienna/40", ardosia: "border-ardosia/40", musgo: "border-musgo/40", cafe: "border-cafe/40", carvao: "border-carvao/40", ocre: "border-ocre/40",
};

const ORDEM_DIAS: DiaId[] = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
function datasDaSemanaAtual(referencia = new Date()) {
  const hoje = new Date(referencia);
  hoje.setHours(0, 0, 0, 0);
  const offsetSegunda = hoje.getDay() === 0 ? -6 : 1 - hoje.getDay();
  const segunda = new Date(hoje);
  segunda.setDate(hoje.getDate() + offsetSegunda);
  const mapa: Record<DiaId, Date> = {} as Record<DiaId, Date>;
  ORDEM_DIAS.forEach((id, i) => {
    const d = new Date(segunda);
    d.setDate(segunda.getDate() + i);
    mapa[id] = d;
  });
  return mapa;
}
function formatarDiaMes(data: Date) {
  return `${String(data.getDate()).padStart(2, "0")}/${String(data.getMonth() + 1).padStart(2, "0")}`;
}

const TURMA_ABERTURA: Partial<Record<DiaId, string>> = {
  ter: "ter-1830", qua: "qua-1630", qui: "qui-1430",
};

export function AgendaSemanaCard({ aulasPorDia }: { aulasPorDia: Partial<Record<DiaId, AulaAgenda[]>> }) {
  const router = useRouter();
  const datas = useMemo(() => datasDaSemanaAtual(), []);
  const hojeFmt = formatarDiaMes(new Date());

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-ink">Turmas da semana</h3>
      </div>
      <div className="space-y-3">
        {DIAS_SEMANA.map((dMeta) => {
          const d = { ...dMeta, aulas: aulasPorDia[dMeta.diaId] ?? [] };
          const dataFmt = formatarDiaMes(datas[d.diaId]);
          const isHoje = dataFmt === hojeFmt;
          const vazio = d.aulas.length === 0;
          const temOficina = d.aulas.some((a) => a.oficina);
          function clicarDia() {
            if (vazio) return;
            if (temOficina) router.push("/oficinas");
            else router.push(`/turmas/${TURMA_ABERTURA[d.diaId] ?? "ter-1830"}`);
          }
          const fotoDia = d.cor ? (FUNDOS_ARGILA as Record<string, string | undefined>)[d.cor] : undefined;
          return (
            <div
              key={d.diaId}
              className={
                "flex w-full min-w-0 items-start gap-3 rounded-2xl border p-3.5 " +
                (d.cor ? BORDA_COR[d.cor] : "border-line") +
                (fotoDia ? "" : " bg-cream-soft/40")
              }
              style={fotoDia ? { backgroundImage: `url(${fotoDia})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
            >
              <div className={"flex w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl py-2.5 " + (d.cor ? SELO_COR[d.cor] : "border border-line bg-white text-ink-soft")}>
                <span className="text-[10px] font-bold uppercase tracking-wide">{d.label}</span>
                <span className="text-sm font-semibold">{dataFmt}</span>
                {isHoje && <span className="text-[9px] font-semibold uppercase tracking-wide opacity-85">Hoje</span>}
              </div>
              <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                {vazio && (
                  <div className="flex min-w-0 items-center gap-2.5 rounded-2xl border border-line bg-white p-3">
                    <Coffee size={18} className="shrink-0 text-ink-soft" />
                    <div className="min-w-0">
                      <div className="text-sm text-ink-soft">Sem aulas</div>
                      <div className="text-xs italic text-ink-soft">{MENSAGEM_DIA_VAZIO[d.diaId]}</div>
                    </div>
                  </div>
                )}
                {d.aulas.map((a, i) =>
                  a.oficina ? (
                    <button key={i} onClick={clicarDia} className="flex w-full min-w-0 items-center gap-2 rounded-2xl border border-line bg-white p-3 text-left">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-ink">{a.hora}</div>
                        <div className="mt-0.5 truncate text-sm font-semibold text-ink">{a.oficina}</div>
                        <div className="mt-0.5 text-xs text-ink-soft">{a.inscritos} inscritos</div>
                      </div>
                      <ChevronRight size={16} className="shrink-0 text-ink-soft" />
                    </button>
                  ) : (
                    <button key={i} onClick={clicarDia} className="flex w-full min-w-0 items-center gap-2 rounded-2xl border border-line bg-white p-3 text-left">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-ink">{a.hora}</div>
                        <div className="mt-0.5 text-xs text-ink-soft">{a.ocupados}/{a.total} alunos</div>
                        <div className="mt-2.5 flex items-center -space-x-1">
                          {(a.nomes ?? []).slice(0, 4).map((n) => (
                            <Avatar key={n} nome={n} size={30} className="ring-2 ring-white" />
                          ))}
                          {(a.nomes?.length ?? 0) > 4 && (
                            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-cream-soft text-[11px] font-semibold text-ink ring-2 ring-white">
                              +{(a.nomes?.length ?? 0) - 4}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={16} className="shrink-0 text-ink-soft" />
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
