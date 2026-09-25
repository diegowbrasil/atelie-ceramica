import { redirect } from "next/navigation";
import { getTurmaPorSlug, getRosterTurma } from "@/lib/actions/turmas";
import { TurmaDetalheClient } from "@/components/turmas/TurmaDetalheClient";
import { TURMAS_DIAS, type DiaId } from "@/lib/turmasDias";

// Server Component — busca o roster real (getRosterTurma) e a tradução
// slug→UUID (getTurmaPorSlug, ver comentário lá) antes de renderizar; a
// interatividade (tabs, modais, mutações) mora em TurmaDetalheClient.
// Referência de comportamento: demo/AtelieDemo.jsx (Turmas).
export default async function TurmaPage({ params }: { params: { turmaId: string } }) {
  const diaValido = TURMAS_DIAS.find((d) => d.turmas.some((t) => t.id === params.turmaId) && d.disponivel) ?? TURMAS_DIAS.find((d) => d.id === "ter")!;
  const turmaInfo = diaValido.turmas.find((t) => t.id === params.turmaId) ?? diaValido.turmas[0];

  const turmaReal = await getTurmaPorSlug(turmaInfo.id);
  if (!turmaReal) {
    // Turma ainda não existe no banco (ex: schema acabou de ser resetado
    // e ninguém rodou o seed) — manda pro dashboard em vez de quebrar.
    redirect("/dashboard");
  }

  const vagas = await getRosterTurma(turmaReal.id, diaValido.id as DiaId, turmaReal.capacidade);

  // Mapa slug→UUID de TODAS as turmas, pro modal de "mover aluno" poder
  // listar destinos com id real — busca as 4 de uma vez.
  const todosSlugs = TURMAS_DIAS.flatMap((d) => d.turmas.map((t) => t.id));
  const todasReais = await Promise.all(todosSlugs.map((slug) => getTurmaPorSlug(slug)));
  const turmasReais: Record<string, string> = {};
  todosSlugs.forEach((slug, i) => {
    const real = todasReais[i];
    if (real) turmasReais[slug] = real.id;
  });

  return (
    <TurmaDetalheClient
      // `key` força remount ao trocar de turma/dia (navegação pra uma
      // rota irmã não desmonta o client component sozinho — sem isso o
      // `useState(vagasIniciais)` local ficaria preso no roster antigo).
      key={turmaInfo.id}
      slugAtual={turmaInfo.id}
      diaAtivo={diaValido.id as DiaId}
      turmaRealId={turmaReal.id}
      capacidade={turmaReal.capacidade}
      turmasReais={turmasReais}
      vagasIniciais={vagas}
    />
  );
}
