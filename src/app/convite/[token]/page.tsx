import { verificarConvite } from "@/lib/actions/convite";
import { AceitarConviteClient } from "@/components/convite/AceitarConviteClient";
import { Card } from "@/components/ui/Card";

// Página pública (fora de (admin)/(auth)/(aluno), sem sessão nenhuma —
// middleware.ts libera /convite explicitamente). Referência: nova feature
// 2026-09-24, "convite por telefone/nome" — ver src/lib/actions/convite.ts.
export default async function ConvitePage({ params }: { params: { token: string } }) {
  const info = await verificarConvite(params.token);

  if (!info) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-4">
        <Card className="w-full max-w-sm p-6 text-center">
          <span className="mb-3 block font-display text-2xl uppercase leading-none tracking-wide text-ink">MTCST</span>
          <h1 className="mb-1 text-base font-semibold text-ink">Convite inválido ou expirado</h1>
          <p className="text-sm text-ink-soft">Peça pro ateliê gerar um link novo.</p>
        </Card>
      </div>
    );
  }

  return <AceitarConviteClient token={params.token} nome={info.nome} />;
}
