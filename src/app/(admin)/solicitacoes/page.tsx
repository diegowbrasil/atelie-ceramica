import { getSolicitacoesReal } from "@/lib/actions/solicitacoes";
import { listarTurmas } from "@/lib/actions/turmas";
import { SolicitacoesClient } from "@/components/solicitacoes/SolicitacoesClient";

// Server Component — busca solicitações pendentes reais + as 4 turmas
// (pro label na hora de aprovar). Interatividade (aprovar/recusar) mora em
// SolicitacoesClient. Referência de comportamento: demo/AtelieDemo.jsx
// (Solicitacoes) — mas o dado em si nunca foi real (CLAUDE.md §5
// Solicitações: mock fictício, nunca fez parte da leva do Diego), então a
// lista real começa vazia até a Área do Aluno existir e gente conseguir
// pedir vaga/reposição de verdade.
export default async function SolicitacoesPage() {
  const [solicitacoes, turmas] = await Promise.all([getSolicitacoesReal(), listarTurmas()]);
  return <SolicitacoesClient solicitacoesIniciais={solicitacoes} turmas={turmas} />;
}
