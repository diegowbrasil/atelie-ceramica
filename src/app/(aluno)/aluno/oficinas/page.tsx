import { getOficinasParaAluno } from "@/lib/actions/alunoPortal";
import { AlunoOficinasClient } from "@/components/aluno/AlunoOficinasClient";

// Server Component — lista as oficinas reais, read-only (mesma regra do
// admin: "só admin altera status das peças; aluno só visualiza").
export default async function AlunoOficinasPage() {
  const oficinas = await getOficinasParaAluno();
  return <AlunoOficinasClient oficinas={oficinas} />;
}
