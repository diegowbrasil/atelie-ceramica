import { getAlunosReal } from "@/lib/actions/alunos";
import { listarTurmas } from "@/lib/actions/turmas";
import { AlunosListClient } from "@/components/alunos/AlunosListClient";

// Server Component — busca todos os alunos reais + as 4 turmas (pro select
// do form de cadastro). Interatividade (busca, acordeão, modal) mora em
// AlunosListClient. Referência de comportamento: demo/AtelieDemo.jsx (Alunos).
export default async function AlunosPage() {
  const [alunos, turmas] = await Promise.all([getAlunosReal(), listarTurmas()]);
  return <AlunosListClient alunosIniciais={alunos} turmas={turmas} />;
}
