"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import {
  Home, Users, GraduationCap, Flame, Bell, CreditCard,
  MessageSquare, BarChart3, Settings, ChevronDown,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/turmas", label: "Turmas", icon: Users },
  { href: "/alunos", label: "Alunos", icon: GraduationCap },
  { href: "/oficinas", label: "Oficinas", icon: MessageSquare },
  { href: "/forno", label: "Forno", icon: Flame },
  { href: "/solicitacoes", label: "Solicitações", icon: Bell, badgeKey: "solicitacoes" },
  { href: "/pagamentos", label: "Pagamentos", icon: CreditCard },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

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
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-ink-100 md:bg-paper md:px-4 md:py-6 dark:md:border-ink-700 dark:md:bg-paper-dark">
      <div className="mb-8 flex items-center gap-2 px-2">
        <VaseMark />
        <span className="font-display text-lg leading-tight text-ink-700 dark:text-ink-50">
          Ateliê
          <br />
          de Cerâmica
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, label, icon: Icon, badgeKey }) => {
          const active = pathname.startsWith(href);
          const count = badgeKey ? badges[badgeKey] : undefined;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-clay-50 text-clay-700 dark:bg-clay-900/40 dark:text-clay-200"
                  : "text-ink-500 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800"
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon size={17} strokeWidth={2} />
                {label}
              </span>
              {!!count && (
                <span className="rounded-full bg-clay-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <button className="mt-4 flex items-center gap-2.5 rounded-xl px-2 py-2 text-left hover:bg-ink-50 dark:hover:bg-ink-800">
        <Avatar nome={userName} fotoUrl={fotoUrl} size={32} />
        <span className="flex-1 truncate">
          <span className="block text-sm font-medium text-ink-700 dark:text-ink-100">{userName}</span>
          <span className="block text-xs text-ink-400">Administrador</span>
        </span>
        <ChevronDown size={15} className="text-ink-400" />
      </button>
    </aside>
  );
}

function VaseMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className="text-clay-600">
      <path
        d="M10 3h6l1 3-1.5 1.5c1.7 1.6 2.8 3.4 2.8 6 0 5-3 8.5-5.3 8.5S8 18.5 8 13.5c0-2.6 1.1-4.4 2.8-6L9.3 6 10 3Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M9.3 6h7.4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
