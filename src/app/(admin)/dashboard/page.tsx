import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FornoResumoCard } from "@/components/dashboard/FornoResumoCard";
import { AgendaSemanaCard } from "@/components/dashboard/AgendaSemanaCard";
import { GraduationCap, Users, RotateCcw, CreditCard, CalendarDays } from "lucide-react";

// TODO(conectar dados reais): as queries abaixo estão comentadas como guia;
// hoje a página renderiza com dados de exemplo para não depender do projeto
// Supabase estar provisionado. Basta descomentar + remover os mocks abaixo.
//
// const supabase = createClient();
// const { data: aulasHoje } = await supabase.from("aulas").select("*").eq("data", hoje);
// const { data: queimaAtiva } = await supabase.from("queimas").select("*").neq("etapa_atual", "finalizada").maybeSingle();

// Referência de comportamento: demo/AtelieDemo.jsx (Dashboard). Layout
// KPIs (coluna estreita) + 2 cards de forno lado a lado, mesma proporção
// do demo — não o grid 2x4 de largura total que existia antes aqui.
export default async function DashboardPage() {
  const hoje = new Date();

  const kpis = [
    { icon: CalendarDays, value: 4, label: "Aulas hoje", href: "/turmas/ter-1830", tone: "bg-cream-soft text-ink" },
    { icon: Users, value: 28, label: "Alunos confirmados", href: "/alunos", tone: "bg-emerald-50 text-emerald-700" },
    { icon: RotateCcw, value: 2, label: "Reposições pendentes", href: "/solicitacoes", tone: "bg-amber-100 text-amber-600" },
    { icon: CreditCard, value: 5, label: "Pagamentos pendentes", href: "/pagamentos", tone: "bg-rose-100 text-rose-600" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-24 pt-6 md:px-8 md:pb-10">
      <p className="text-sm text-ink-soft">{hoje.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</p>

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
          <FornoResumoCard
            nome="Forno 1"
            href="/forno"
            fornada={{
              tipoLabel: "Esmalte",
              params: {
                temperaturaInicial: 25, temperaturaMaxima: 1240, velocidadeAquecimento: 3,
                tempoPatamarMin: 15, velocidadeResfriamento: 2.5, temperaturaSegura: 80,
                iniciadoEm: new Date(hoje.getTime() - 6.7 * 3600 * 1000),
                ultimaLeitura: { temperatura: 920, em: new Date(hoje.getTime() - 15 * 60 * 1000) },
              },
            }}
          />
          <FornoResumoCard nome="Forno 2" href="/forno" fornada={null} />
        </div>
      </div>

      <AgendaSemanaCard />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Próximas oficinas</h3>
            <Link href="/oficinas" className="text-xs font-medium text-accent hover:underline">Ver todas</Link>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between">
              <span>
                <span className="block font-medium text-ink">Kit Café da Manhã</span>
                <span className="text-ink-soft">10 de outubro · 16:00–19:00</span>
              </span>
              <Badge tone="warning">Faltam 23 dias</Badge>
            </li>
            <li className="flex justify-between">
              <span>
                <span className="block font-medium text-ink">Kit Café da Manhã</span>
                <span className="text-ink-soft">24 de outubro · 16:00–19:00</span>
              </span>
              <Badge tone="warning">Faltam 37 dias</Badge>
            </li>
          </ul>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Solicitações pendentes</h3>
            <Link href="/solicitacoes" className="text-xs font-medium text-accent hover:underline">Ver todas</Link>
          </div>
          <ul className="space-y-3 text-sm">
            {[
              { nome: "Lucas Mendes", info: "Quinta 15 · 18:30" },
              { nome: "Juliana Costa", info: "Quinta 15 · 14:30" },
              { nome: "Pedro Santos", info: "Quinta 15 · 18:30" },
            ].map((s) => (
              <li key={s.nome} className="flex items-center justify-between">
                <span>
                  <span className="block font-medium text-ink">{s.nome}</span>
                  <span className="text-ink-soft">Solicitou reposição · {s.info}</span>
                </span>
                <GraduationCap size={16} className="text-ink-soft/70" />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
