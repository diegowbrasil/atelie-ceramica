"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Users, Flame, MessageSquare, Menu } from "lucide-react";

const TABS = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/turmas", label: "Turmas", icon: Users },
  { href: "/forno", label: "Forno", icon: Flame },
  { href: "/oficinas", label: "Oficinas", icon: MessageSquare },
  { href: "/mais", label: "Mais", icon: Menu },
] as const;

export function MobileNav({ badgeSolicitacoes = 0 }: { badgeSolicitacoes?: number }) {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-around gap-1 rounded-full border border-white/70 bg-gradient-to-b from-white/70 to-white/35 px-2 py-2 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.8),0_10px_24px_-6px_rgba(59,56,51,0.22)] backdrop-blur-2xl backdrop-saturate-150 md:hidden">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors",
              active ? "text-accent" : "text-ink-soft"
            )}
          >
            <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
            {label}
            {href === "/mais" && badgeSolicitacoes > 0 && (
              <span className="absolute right-1 top-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[9px] font-semibold text-white">
                {badgeSolicitacoes}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
