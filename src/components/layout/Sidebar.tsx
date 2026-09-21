"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import {
  Home, Users, GraduationCap, Flame, Bell, CreditCard,
  MessageSquare, BarChart3, Settings, type LucideIcon,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badgeKey?: string;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/turmas", label: "Turmas", icon: Users },
  { href: "/alunos", label: "Alunos", icon: GraduationCap },
  { href: "/oficinas", label: "Oficinas", icon: MessageSquare },
  { href: "/forno", label: "Forno", icon: Flame },
  { href: "/solicitacoes", label: "Solicitações", icon: Bell, badgeKey: "solicitacoes" },
  { href: "/pagamentos", label: "Pagamentos", icon: CreditCard },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

/** Navegação principal. Em telas < md vira tab bar fixa no rodapé (ver MobileNav). */
export function Sidebar({
  userName,
  fotoUrl,
  badges = {},
}: {
  userName: string;
  fotoUrl?: string | null;
  badges?: Partial<Record<string, number>>;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-32 md:shrink-0 md:flex-col md:border-r md:border-line md:bg-cream md:px-1.5 md:py-5">
      <div className="mb-6 flex justify-center px-1">
        <span className="font-display text-2xl uppercase leading-none tracking-wide text-ink">MTCST</span>
      </div>

      <nav className="flex-1 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon, badgeKey }) => {
          const active = pathname.startsWith(href);
          const count = badgeKey ? badges[badgeKey] : undefined;
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                "relative flex w-full flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[10px] font-medium leading-tight transition-colors",
                active ? "bg-accent-soft text-accent" : "text-ink-soft hover:bg-white/60"
              )}
            >
              <Icon size={16} />
              <span className="w-full truncate text-center">{label}</span>
              {!!count && (
                <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[9px] font-semibold text-white">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-3 flex justify-center">
        <Avatar nome={userName} fotoUrl={fotoUrl} size={28} />
      </div>
    </aside>
  );
}
