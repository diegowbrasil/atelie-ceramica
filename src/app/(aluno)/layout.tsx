import type { ReactNode } from "react";
import { AlunoNav } from "@/components/layout/AlunoNav";

// Casca da Área do Aluno (2026-09-24) — Início/Turmas/Oficinas, nav
// inferior mobile-first (o aluno só usa isso pelo celular, mesma
// prioridade do resto do app). "Histórico" não virou aba própria de
// propósito — não existe histórico de presença por data de verdade em
// lugar nenhum do sistema ainda (mesma limitação documentada há muito
// no CLAUDE.md), uma aba vazia só pra existir seria pior que não ter.
export default function AlunoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      {children}
      <AlunoNav />
    </div>
  );
}
