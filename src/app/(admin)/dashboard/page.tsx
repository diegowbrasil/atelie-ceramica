import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { KilnLiveCard } from "@/components/dashboard/KilnLiveCard";
import { GraduationCap, Users, RotateCcw, CreditCard, CalendarDays } from "lucide-react";

// TODO(conectar dados reais): as queries abaixo estão comentadas como guia;
// hoje a página renderiza com dados de exemplo para não depender do projeto
// Supabase estar provisionado. Basta descomentar + remover os mocks abaixo.
//
// const supabase = createClient();
// const { data: aulasHoje } = await supabase.from("aulas").select("*").eq("data", hoje);
// const { data: queimaAtiva } = await supabase.from("queimas").select("*").neq("etapa_atual", "finalizada").maybeSingle();

export default async function DashboardPage() {
  const nomeAdmin = "Camila";
  const hoje = new Date();

  const kpis = [
    { icon: CalendarDays, value: 4, label: "Aulas hoje", href: "/turmas", linkLabel: "Ver agenda", tone: "clay" as const },
    { icon: Users, value: 28, label: "Alunos confirmados", href: "/alunos", linkLabel: "Ver lista", tone: "glaze" as const },
    { icon: RotateCcw, value: 2, label: "Reposições pendentes", href: "/solicitacoes", linkLabel: "Ver solicitações", tone: "amber" as const },
    { icon: CreditCard, value: 5, label: "Pagamentos pendentes", href: "/pagamentos", linkLabel: "Ver pagamentos", tone: "rose" as const },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-24 pt-6 md:px-8 md:pb-10">
      <header>
        <h1 className="font-display text-2xl text-ink-800 dark:text-ink-50">Olá, {nomeAdmin} 👋</h1>
        <p className="text-sm text-ink-400">
          {hoje.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <KilnLiveCard
        nomeQueima="Queima de Esmalte"
        params={{
          temperaturaInicial: 25,
          temperaturaMaxima: 1240,
          velocidadeAquecimento: 3,
          tempoPatamarMin: 15,
          velocidadeResfriamento: 2.5,
          temperaturaSegura: 80,
          iniciadoEm: new Date(hoje.getTime() - 6.7 * 3600 * 1000),
        }}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-100">Próximas oficinas</h3>
            <a href="/oficinas" className="text-xs font-medium text-clay-600 hover:underline">Ver todas</a>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between">
              <span>
                <span className="block font-medium text-ink-700 dark:text-ink-100">Modelagem Manual</span>
                <span className="text-ink-400">17 de maio · 10:00–13:00</span>
              </span>
              <Badge tone="warning">Faltam 5 dias</Badge>
            </li>
            <li className="flex justify-between">
              <span>
                <span className="block font-medium text-ink-700 dark:text-ink-100">Esmaltação Criativa</span>
                <span className="text-ink-400">18 de maio · 14:00–17:00</span>
              </span>
              <Badge tone="warning">Faltam 6 dias</Badge>
            </li>
          </ul>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-100">Pacotes terminando</h3>
            <a href="/alunos" className="text-xs font-medium text-clay-600 hover:underline">Ver todos</a>
          </div>
          <ul className="space-y-3 text-sm">
            {[
              { nome: "Maria Oliveira", info: "Última aula do pacote", badge: "4/4 aulas" },
              { nome: "João Silva", info: "Última aula do pacote", badge: "4/4 aulas" },
              { nome: "Ana Paula", info: "1 aula restante", badge: "3/4 aulas" },
            ].map((a) => (
              <li key={a.nome} className="flex items-center justify-between">
                <span>
                  <span className="block font-medium text-ink-700 dark:text-ink-100">{a.nome}</span>
                  <span className="text-ink-400">{a.info}</span>
                </span>
                <Badge tone="danger">{a.badge}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-100">Solicitações pendentes</h3>
            <a href="/solicitacoes" className="text-xs font-medium text-clay-600 hover:underline">Ver todas</a>
          </div>
          <ul className="space-y-3 text-sm">
            {[
              { nome: "Lucas Mendes", info: "Quinta 15 · 18:30" },
              { nome: "Juliana Costa", info: "Quinta 15 · 14:30" },
              { nome: "Pedro Santos", info: "Quinta 15 · 18:30" },
            ].map((s) => (
              <li key={s.nome} className="flex items-center justify-between">
                <span>
                  <span className="block font-medium text-ink-700 dark:text-ink-100">{s.nome}</span>
                  <span className="text-ink-400">Solicitou reposição · {s.info}</span>
                </span>
                <GraduationCap size={16} className="text-ink-300" />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
