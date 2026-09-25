import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FornoResumoCard, type FornadaResumo } from "@/components/dashboard/FornoResumoCard";
import { AgendaSemanaCard, type AulaAgenda, type DiaId } from "@/components/dashboard/AgendaSemanaCard";
import { AvisosCard } from "@/components/dashboard/AvisosCard";
import { getAvisosReal } from "@/lib/actions/avisos";
import { getFornadasReal, type FornadaReal } from "@/lib/actions/forno";
import { getSolicitacoesReal } from "@/lib/actions/solicitacoes";
import { getPagamentosReal } from "@/lib/actions/pagamentos";
import { getOficinasReal, type OficinaReal } from "@/lib/actions/oficinas";
import { getTurmaPorSlug, getRosterTurma, listarTurmas } from "@/lib/actions/turmas";
import { TURMAS_DIAS } from "@/lib/turmasDias";
import { FUNDOS_ARGILA } from "@/lib/fundosArgila";
import { GraduationCap, Users, RotateCcw, CreditCard, CalendarDays } from "lucide-react";

// Última peça ligada aos dados reais (2026-09-24) — os 7 domínios já
// existiam de verdade, o Dashboard só agregava mock por cima deles.
// Referência de comportamento: demo/AtelieDemo.jsx (Dashboard).

const TIPO_LABEL: Record<string, string> = { esmalte: "Esmalte", biscoito: "Biscoito", outro: "Outros" };

/** Resumo da fornada ATIVA (se houver) de um forno, no formato que
 *  FornoResumoCard espera — mesma conversão ISO→Date de FornoClient,
 *  só que reduzida (não precisa do histórico inteiro aqui). */
function fornadaResumo(fornadas: FornadaReal[]): FornadaResumo | null {
  const ativa = fornadas.find((f) => f.status === "andamento");
  if (!ativa || !ativa.iniciadoEm) return null;
  const ultima = ativa.leituras[ativa.leituras.length - 1];
  return {
    tipoLabel: TIPO_LABEL[ativa.tipo] + (ativa.tipoDescricao ? ` (${ativa.tipoDescricao})` : ""),
    params: {
      ...ativa.config,
      iniciadoEm: new Date(ativa.iniciadoEm),
      finalizadoEm: ativa.finalizadoEm ? new Date(ativa.finalizadoEm) : null,
      ultimaLeitura: ultima ? { temperatura: ultima.temperatura, em: new Date(ultima.em) } : null,
    },
  };
}

const ORDEM_DIAS: DiaId[] = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
function diaIdDeHoje(): DiaId {
  return ORDEM_DIAS[(new Date().getDay() + 6) % 7]; // getDay(): 0=dom
}
function datasDaSemana(): Record<DiaId, string> {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const offsetSegunda = hoje.getDay() === 0 ? -6 : 1 - hoje.getDay();
  const segunda = new Date(hoje);
  segunda.setDate(hoje.getDate() + offsetSegunda);
  const mapa = {} as Record<DiaId, string>;
  ORDEM_DIAS.forEach((id, i) => {
    const d = new Date(segunda);
    d.setDate(segunda.getDate() + i);
    mapa[id] = d.toISOString().slice(0, 10);
  });
  return mapa;
}

/** Turmas fixas (roster real, uma busca por turma) + oficinas reais desta
 *  semana (casadas pela data ISO) — mesma fonte que Turmas/Oficinas, sem
 *  duplicar lógica de negócio, só agregando pro card da semana. */
async function getAgendaSemana(oficinas: OficinaReal[]): Promise<Partial<Record<DiaId, AulaAgenda[]>>> {
  const aulasPorDia: Partial<Record<DiaId, AulaAgenda[]>> = {};

  const diasComTurma = TURMAS_DIAS.filter((d) => d.turmas.length > 0);
  await Promise.all(
    diasComTurma.flatMap((d) =>
      d.turmas.map(async (t) => {
        const real = await getTurmaPorSlug(t.id);
        if (!real) return;
        const roster = await getRosterTurma(real.id, d.id, real.capacidade);
        const aula: AulaAgenda = {
          hora: t.hora,
          ocupados: roster.filter((v) => v.nome).length,
          total: real.capacidade,
          nomes: roster.filter((v) => v.nome).map((v) => v.nome!),
        };
        aulasPorDia[d.id as DiaId] = [...(aulasPorDia[d.id as DiaId] ?? []), aula];
      })
    )
  );

  const datas = datasDaSemana();
  for (const o of oficinas) {
    const diaMatch = ORDEM_DIAS.find((id) => datas[id] === o.dataISO);
    if (diaMatch) {
      const aula: AulaAgenda = { hora: o.hora, oficina: o.nome, inscritos: o.participantes.filter((p) => p.nome).length };
      aulasPorDia[diaMatch] = [...(aulasPorDia[diaMatch] ?? []), aula];
    }
  }

  return aulasPorDia;
}

function fmtFaltamDias(dataISO: string): string {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(dataISO + "T00:00:00");
  const dias = Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
  if (dias <= 0) return "Hoje";
  if (dias === 1) return "Amanhã";
  return `Faltam ${dias} dias`;
}

export default async function DashboardPage() {
  const hoje = new Date();
  const hojeDiaId = diaIdDeHoje();

  const [avisos, forno1, forno2, solicitacoes, pagamentos, oficinas, turmasLista] = await Promise.all([
    getAvisosReal(),
    getFornadasReal("forno1"),
    getFornadasReal("forno2"),
    getSolicitacoesReal(),
    getPagamentosReal(),
    getOficinasReal(),
    listarTurmas(),
  ]);

  const diaHojeInfo = TURMAS_DIAS.find((d) => d.id === hojeDiaId);
  const turmasHoje = diaHojeInfo?.turmas ?? [];
  const rostersHoje = await Promise.all(
    turmasHoje.map(async (t) => {
      const real = await getTurmaPorSlug(t.id);
      if (!real) return [];
      return getRosterTurma(real.id, hojeDiaId, real.capacidade);
    })
  );
  const alunosConfirmadosHoje = rostersHoje.flat().filter((v) => v.nome && v.statusAula !== "ausente").length;

  const agendaSemana = await getAgendaSemana(oficinas);

  const kpis = [
    { icon: CalendarDays, value: turmasHoje.length, label: "Aulas hoje", href: turmasHoje[0] ? `/turmas/${turmasHoje[0].id}` : "/turmas", tone: "bg-cream-soft text-ink" },
    { icon: Users, value: alunosConfirmadosHoje, label: "Alunos confirmados", href: "/alunos", tone: "bg-emerald-50 text-emerald-700" },
    { icon: RotateCcw, value: solicitacoes.length, label: "Reposições pendentes", href: "/solicitacoes", tone: "bg-amber-100 text-amber-600" },
    { icon: CreditCard, value: pagamentos.filter((p) => p.status === "pendente").length, label: "Pagamentos pendentes", href: "/pagamentos", tone: "bg-rose-100 text-rose-600" },
  ];

  const hojeISO = hoje.toISOString().slice(0, 10);
  const oficinasFuturas = oficinas.filter((o) => o.dataISO >= hojeISO).slice(0, 2);
  const solicitacoesPreview = solicitacoes.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-24 pt-6 md:px-8 md:pb-10">
      <p className="text-sm text-ink-soft">{hoje.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</p>

      <AvisosCard avisosIniciais={avisos} />

      <div className="grid min-w-0 gap-3 lg:grid-cols-[300px_1fr]">
        <div className="grid min-w-0 grid-cols-2 gap-2">
          {kpis.map((k) => (
            <Link key={k.label} href={k.href} className="min-w-0">
              <Card className="flex items-center gap-2 p-2.5 hover:border-ink-soft">
                <div className={"flex h-8 w-8 shrink-0 items-center justify-center rounded-lg " + k.tone}>
                  <k.icon size={14} />
                </div>
                <div className="min-w-0">
                  <div className="text-base font-semibold leading-tight text-ink">{k.value}</div>
                  <div className="truncate text-[11px] leading-tight text-ink-soft">{k.label}</div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
          <FornoResumoCard nome="Forno 1" href="/forno" fornada={fornadaResumo(forno1)} />
          <FornoResumoCard nome="Forno 2" href="/forno" fornada={fornadaResumo(forno2)} />
        </div>
      </div>

      <AgendaSemanaCard aulasPorDia={agendaSemana} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card
          className="border-carvao/40 bg-cream p-0"
          style={{ backgroundImage: `url(${FUNDOS_ARGILA.carvao})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div className="m-3 rounded-xl bg-white p-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">Próximas oficinas</h3>
              <Link href="/oficinas" className="text-xs font-medium text-accent hover:underline">Ver todas</Link>
            </div>
            {oficinasFuturas.length === 0 ? (
              <p className="text-sm text-ink-soft">Nenhuma oficina agendada.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {oficinasFuturas.map((o) => (
                  <li key={o.id} className="flex justify-between">
                    <span>
                      <span className="block font-medium text-ink">{o.nome}</span>
                      <span className="text-ink-soft">{o.data} · {o.hora}</span>
                    </span>
                    <Badge tone="warning">{fmtFaltamDias(o.dataISO)}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Solicitações pendentes</h3>
            <Link href="/solicitacoes" className="text-xs font-medium text-accent hover:underline">Ver todas</Link>
          </div>
          {solicitacoesPreview.length === 0 ? (
            <p className="text-sm text-ink-soft">Nenhuma solicitação pendente.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {solicitacoesPreview.map((s) => (
                <li key={s.id} className="flex items-center justify-between">
                  <span>
                    <span className="block font-medium text-ink">{s.nome}</span>
                    <span className="text-ink-soft">{s.tipo} · {turmasLista.find((t) => t.id === s.turmaId)?.nome ?? ""}</span>
                  </span>
                  <GraduationCap size={16} className="text-ink-soft/70" />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
