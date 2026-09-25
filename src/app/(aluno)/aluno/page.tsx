import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAlunoReal } from "@/lib/actions/alunos";
import { sair } from "@/lib/actions/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { TURMA_LABEL_COR, type CorIdentidade } from "@/lib/alunos";

const COR_HEX: Record<CorIdentidade, string> = {
  sienna: "rgb(var(--sienna))", ardosia: "rgb(var(--ardosia))", musgo: "rgb(var(--musgo))", cafe: "rgb(var(--cafe))", ocre: "rgb(var(--ocre))",
};
const COR_TRACK: Record<CorIdentidade, string> = {
  sienna: "rgb(var(--sienna) / 0.18)", ardosia: "rgb(var(--ardosia) / 0.18)", musgo: "rgb(var(--musgo) / 0.18)", cafe: "rgb(var(--cafe) / 0.18)", ocre: "rgb(var(--ocre) / 0.18)",
};

// Primeira fatia real da Área do Aluno (2026-09-24) — só o Início, lendo
// os próprios dados via RLS (aluno_id = current_profile_id() nas tabelas
// de matriculas/pacotes/pagamentos, mesma política que já protegia essas
// tabelas desde a Fase 1, nunca antes exercida por uma sessão de aluno de
// verdade). Reaproveita getAlunoReal (mesma função que a tela admin de
// Alunos usa) — o aluno só enxerga a própria linha, não precisa de uma
// versão paralela da query.
//
// "Minha Turma" é o enquadramento da própria página, não só um card no
// meio dela (pedido do Diego, 2026-09-25): a turma + o painel de pacote
// (aula X de Y, pagamento) formam um bloco só, com a cor de identidade
// da turma — sempre e só a matrícula do próprio aluno logado, nunca uma
// lista. Sem turma vinculada (`aluno.turmaId === null`) vira estado
// vazio com CTA pra Turmas, em vez de mostrar um anel de pacote 0/0 sem
// sentido.
export default async function AlunoHomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase.from("profiles").select("id").eq("auth_user_id", user.id).maybeSingle();
  if (!perfil) redirect("/login");

  const aluno = await getAlunoReal(perfil.id);
  if (!aluno) redirect("/login");

  const temTurma = !!aluno.turmaId;
  const cor = TURMA_LABEL_COR[aluno.turma] ?? "sienna";
  const pct = aluno.total ? (aluno.aula / aluno.total) * 100 : 0;

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <span className="font-display text-xl uppercase leading-none tracking-wide text-ink">MTCST</span>
        <form action={sair}>
          <Button type="submit" variant="ghost" size="sm">Sair</Button>
        </form>
      </div>

      <p className="mb-1 text-center text-sm text-ink-soft">Olá, {aluno.nome.split(" ")[0]}!</p>
      <h1 className="mb-5 text-center font-display text-2xl uppercase tracking-wide text-ink">Minha Turma</h1>

      {temTurma ? (
        <Card className="mb-4 overflow-hidden p-0" style={{ borderColor: COR_HEX[cor], borderWidth: 2 }}>
          <div className="flex items-center gap-2 px-5 pt-4">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COR_HEX[cor] }} />
            <span className="text-sm font-semibold text-ink">{aluno.turma}</span>
          </div>
          <div className="flex items-center gap-4 p-5 pt-3">
            <div className="relative shrink-0">
              <ProgressRing percentual={pct} size={72} stroke={7} color={COR_HEX[cor]} trackColor={COR_TRACK[cor]} />
              <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold" style={{ color: COR_HEX[cor] }}>
                {aluno.aula}/{aluno.total}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-ink">Seu pacote</div>
              <div className="text-sm text-ink-soft">Aula {aluno.aula} de {aluno.total}</div>
              <div className="mt-1.5">
                {aluno.status === "pendente" ? (
                  <Badge tone="warning">Pagamento pendente</Badge>
                ) : aluno.status === "ultima" ? (
                  <Badge tone="danger">Hora de renovar</Badge>
                ) : (
                  <Badge tone="success">Pagamento em dia</Badge>
                )}
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="mb-4 p-5 text-center">
          <p className="mb-3 text-sm text-ink-soft">Você ainda não está em nenhuma turma fixa.</p>
          <Link
            href="/aluno/turmas"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-accent px-4 text-sm font-medium text-white shadow-soft transition-colors hover:bg-accent-hover"
          >
            Solicitar uma vaga
          </Link>
        </Card>
      )}

      <p className="text-center text-xs text-ink-soft">
        Mais novidades chegando por aqui em breve.
      </p>
    </div>
  );
}
