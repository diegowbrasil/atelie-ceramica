import { getTurmasParaAluno } from "@/lib/actions/alunoPortal";
import { AlunoTurmasClient } from "@/components/aluno/AlunoTurmasClient";

// Server Component — lista as 5 turmas fixas com ocupação real (contagem
// só, sem nome de ninguém — ver alunoPortal.ts). Interatividade
// (solicitar vaga) mora em AlunoTurmasClient.
//
// `force-dynamic` — testado ao vivo (2026-09-24) um número desatualizado
// aqui que investiguei a fundo pensando ser cache do fetch do Next.js;
// a causa raiz real acabou sendo outra (processo node órfão na porta
// 3000 servindo build antigo, ver CLAUDE.md §8), não esse cache
// especificamente. Mantido mesmo assim: ocupação de turma é vaga de
// gente real, não custa nada garantir que essa rota nunca vira
// candidata a otimização estática por engano.
export const dynamic = "force-dynamic";

export default async function AlunoTurmasPage() {
  const turmas = await getTurmasParaAluno();
  return <AlunoTurmasClient turmas={turmas} />;
}
