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
    // `pt-[env(safe-area-inset-top)]` — instalado como PWA de verdade em
    // tela cheia no iOS, sem isso o título de cada tela (ex: "TURMAS")
    // fica atrás da barra de status (hora/bateria). Só a Área do Aluno
    // precisa disso: o admin não roda como PWA instalado (é uso interno
    // da Hanna, sempre pelo navegador comum), e o cabeçalho mobile do
    // admin já reserva espaço próprio (`pt-24`) por outro motivo.
    <div className="min-h-screen bg-cream pt-[env(safe-area-inset-top)]">
      {children}
      <AlunoNav />
    </div>
  );
}
