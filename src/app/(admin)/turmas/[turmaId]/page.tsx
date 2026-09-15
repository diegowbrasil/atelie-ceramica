import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { VagaCard, type VagaOcupada, type VagaVazia } from "@/components/turmas/VagaCard";
import Link from "next/link";

const TURMAS = [
  { id: "seg", label: "Seg", ativo: false },
  { id: "ter", label: "Ter", ativo: true },
  { id: "qua", label: "Qua", ativo: false },
  { id: "qui", label: "Qui", ativo: false, pontos: 2 },
  { id: "sex", label: "Sex", ativo: false },
  { id: "sab", label: "Sáb", ativo: false },
  { id: "dom", label: "Dom", ativo: false },
];

// TODO(conectar dados reais): substituir por
// supabase.from("matriculas").select("*, profiles(*), pacotes(*)").eq("turma_id", turmaId)
const VAGAS: (VagaOcupada | VagaVazia)[] = [
  { numero: 1, aluno: { nome: "Maria Oliveira" }, aulaAtual: 3, totalAulas: 4, status: "confirmado" },
  { numero: 2, aluno: { nome: "João Silva" }, aulaAtual: 1, totalAulas: 4, status: "pendente" },
  { numero: 3, aluno: { nome: "Ana Paula" }, aulaAtual: 4, totalAulas: 4, status: "ultima_aula" },
  { numero: 4, aluno: { nome: "Pedro Santos" }, aulaAtual: 2, totalAulas: 8, status: "confirmado" },
  { numero: 5, aluno: { nome: "Júlia Costa" }, aulaAtual: 2, totalAulas: 4, status: "confirmado" },
  { numero: 6, aluno: { nome: "Lucas Mendes" }, aulaAtual: 3, totalAulas: 4, status: "confirmado" },
  { numero: 7, aluno: { nome: "Carla Souza" }, aulaAtual: 1, totalAulas: 4, status: "pendente" },
  { numero: 8, aluno: { nome: "Rafael Lima" }, aulaAtual: 5, totalAulas: 8, status: "confirmado" },
  { numero: 9, vazia: true },
  { numero: 10, vazia: true },
  { numero: 11, vazia: true },
  { numero: 12, vazia: true },
];

export default function TurmaPage({ params }: { params: { turmaId: string } }) {
  const ocupadas = VAGAS.filter((v) => !("vazia" in v)).length;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-8 md:pb-10">
      <header className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink-800 dark:text-ink-50">Turmas</h1>
          <p className="text-sm text-ink-400">Gerencie suas turmas, alunos e presenças.</p>
        </div>
        <button className="rounded-xl bg-clay-500 px-4 py-2 text-sm font-medium text-white shadow-soft hover:bg-clay-600">
          + Nova turma
        </button>
      </header>

      <div className="mb-5 flex gap-2 overflow-x-auto scrollbar-none">
        {TURMAS.map((t) => (
          <Link
            key={t.id}
            href={`/turmas/${t.id}`}
            className={
              "relative shrink-0 rounded-xl px-4 py-2 text-sm font-medium " +
              (t.ativo ? "bg-clay-500 text-white" : "bg-ink-50 text-ink-500 dark:bg-ink-800 dark:text-ink-300")
            }
          >
            {t.label}
            {t.pontos && (
              <span className="absolute -bottom-0.5 left-1/2 flex -translate-x-1/2 gap-0.5">
                {Array.from({ length: t.pontos }).map((_, i) => (
                  <span key={i} className="h-1 w-1 rounded-full bg-clay-400" />
                ))}
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div>
          <Card className="mb-4 flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-ink-700 dark:text-ink-100">Terça-feira · 18:30 às 20:30</div>
              <div className="mt-1 flex gap-2">
                <Badge tone="success">{ocupadas}/12 alunos</Badge>
                <Badge tone="info">Turma fixa</Badge>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {VAGAS.map((v) => (
              <VagaCard key={v.numero} {...v} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-ink-700 dark:text-ink-100">Detalhes da turma</h3>
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-ink-400">Dia</dt>
              <dd className="text-right font-medium">Terça-feira</dd>
              <dt className="text-ink-400">Horário</dt>
              <dd className="text-right font-medium">18:30 às 20:30</dd>
              <dt className="text-ink-400">Capacidade</dt>
              <dd className="text-right font-medium">12 alunos</dd>
              <dt className="text-ink-400">Confirmados</dt>
              <dd className="text-right font-medium">8 alunos</dd>
              <dt className="text-ink-400">Pendentes</dt>
              <dd className="text-right font-medium">2 alunos</dd>
            </dl>
          </Card>

          <Card className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-ink-700 dark:text-ink-100">Solicitações pendentes</h3>
            <ul className="space-y-3">
              {["Beatriz Almeida", "Felipe Martins"].map((nome) => (
                <li key={nome} className="flex items-center justify-between text-sm">
                  <span>
                    <span className="block font-medium text-ink-700 dark:text-ink-100">{nome}</span>
                    <span className="text-ink-400">Quer participar da turma</span>
                  </span>
                  <div className="flex gap-1.5">
                    <button className="rounded-lg bg-glaze-50 px-2 py-1 text-xs font-medium text-glaze-700">Aprovar</button>
                    <button className="rounded-lg bg-rose-500/10 px-2 py-1 text-xs font-medium text-rose-500">Recusar</button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
