"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Users, Flame, Bell, Menu } from "lucide-react";

const TABS = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/turmas", label: "Turmas", icon: Users },
  { href: "/forno", label: "Forno", icon: Flame },
  { href: "/solicitacoes", label: "Avisos", icon: Bell },
  { href: "/mais", label: "Mais", icon: Menu },
] as const;

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-ink-100 bg-surface/95 backdrop-blur px-2 py-1.5 pb-[env(safe-area-inset-bottom)] md:hidden dark:border-ink-700 dark:bg-surface-dark/95">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] font-medium",
              active ? "text-clay-600" : "text-ink-400"
            )}
          >
            <Icon size={20} strokeWidth={active ? 2.3 : 1.8} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
