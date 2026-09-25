import { redirect } from "next/navigation";
import { getAlunoReal } from "@/lib/actions/alunos";
import { listarTurmas } from "@/lib/actions/turmas";
import { AlunoDetalheClient } from "@/components/alunos/AlunoDetalheClient";

// Server Component — `id` é profiles.id (uuid) de verdade agora, não mais
// um índice de array (a rota era /alunos/[index] no mock, sem sentido
// contra dado real vindo do banco). Referência de comportamento:
// demo/AtelieDemo.jsx (AlunoDetalhe).
export default async function AlunoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [aluno, turmas] = await Promise.all([getAlunoReal(id), listarTurmas()]);
  if (!aluno) redirect("/alunos");
  return <AlunoDetalheClient key={aluno.id} alunoInicial={aluno} turmas={turmas} />;
}
