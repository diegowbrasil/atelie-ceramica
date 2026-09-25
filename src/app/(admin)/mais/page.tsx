import Link from "next/link";
import { GraduationCap, Bell, CreditCard, BarChart3, Settings, ChevronRight, LogOut, type LucideIcon } from "lucide-react";
import { getSolicitacoesReal } from "@/lib/actions/solicitacoes";
import { sair } from "@/lib/actions/auth";
import { Card } from "@/components/ui/Card";

// Rota que faltava de verdade (2026-09-25) — MobileNav.tsx sempre linkou
// pra "/mais", mas a página nunca existia (404 real, achado investigando
// pontas soltas). Reúne o que não cabe nas 5 abas fixas do rodapé mobile
// (Início/Turmas/Forno/Oficinas já estão lá) + o primeiro "Sair" que o
// admin ganha no projeto inteiro (a Área do Aluno já tinha o dela).
export default async function MaisPage() {
  const solicitacoesPendentes = await getSolicitacoesReal();

  const itens: { href: string; label: string; icon: LucideIcon; badge?: number }[] = [
    { href: "/alunos", label: "Alunos", icon: GraduationCap },
    { href: "/solicitacoes", label: "Solicitações", icon: Bell, badge: solicitacoesPendentes.length },
    { href: "/pagamentos", label: "Pagamentos", icon: CreditCard },
    { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
    { href: "/configuracoes", label: "Configurações", icon: Settings },
  ];

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-6">
      <h1 className="mb-5 text-center font-display text-2xl uppercase tracking-wide text-ink">Mais</h1>

      <Card className="divide-y divide-line overflow-hidden">
        {itens.map(({ href, label, icon: Icon, badge }) => (
          <Link key={href} href={href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-cream">
            <Icon size={18} className="shrink-0 text-ink-soft" />
            <span className="flex-1 text-sm font-medium text-ink">{label}</span>
            {!!badge && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-semibold text-white">{badge}</span>
            )}
            <ChevronRight size={16} className="shrink-0 text-ink-soft" />
          </Link>
        ))}
      </Card>

      <form action={sair} className="mt-4">
        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-white px-4 py-3 text-sm font-medium text-ink-soft hover:bg-cream">
          <LogOut size={16} />
          Sair
        </button>
      </form>
    </div>
  );
}
