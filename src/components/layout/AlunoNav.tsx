"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Users, GraduationCap, History } from "lucide-react";

// Mesma receita visual de MobileNav.tsx (admin) — pílula de vidro
// flutuante. 4 abas (Início/Turmas/Oficinas/Histórico) cabem sem
// precisar de "Mais" — só o admin tem overflow, a Área do Aluno é bem
// mais enxuta. "Histórico" (2026-09-25) junta aulas + pagamentos numa
// tela só em vez de virar 2 abas novas (ver AlunoHistoricoClient).
const TABS = [
  { href: "/aluno", label: "Início", icon: Home },
  { href: "/aluno/turmas", label: "Turmas", icon: Users },
  { href: "/aluno/oficinas", label: "Oficinas", icon: GraduationCap },
  { href: "/aluno/historico", label: "Histórico", icon: History },
] as const;

export function AlunoNav() {
  const pathname = usePathname();
  return (
    // `bottom-[max(...)]` — em iPhones com indicador de home (não é o
    // caso do SE do Diego, mas vale pros outros aparelhos), a pílula
    // flutuante fica colada demais nele sem essa margem extra reservada.
    <nav className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 flex items-center justify-around gap-1 rounded-full border border-white/70 bg-gradient-to-b from-white/70 to-white/35 px-2 py-2 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.8),0_10px_24px_-6px_rgba(59,56,51,0.22)] backdrop-blur-2xl backdrop-saturate-150">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = href === "/aluno" ? pathname === "/aluno" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-full px-4 py-1.5 text-[11px] font-medium transition-colors",
              active ? "text-accent" : "text-ink-soft"
            )}
          >
            <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
