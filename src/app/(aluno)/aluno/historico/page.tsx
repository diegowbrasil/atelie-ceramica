import { getHistoricoAulas, getHistoricoPagamentos } from "@/lib/actions/alunoPortal";
import { AlunoHistoricoClient } from "@/components/aluno/AlunoHistoricoClient";

// Mesma cautela de force-dynamic já usada em aluno/turmas/page.tsx —
// dado pessoal do próprio aluno, nunca deveria ficar sujeito a
// otimização estática por engano.
export const dynamic = "force-dynamic";

export default async function AlunoHistoricoPage() {
  const [aulas, pagamentos] = await Promise.all([getHistoricoAulas(), getHistoricoPagamentos()]);
  return <AlunoHistoricoClient aulas={aulas} pagamentos={pagamentos} />;
}
