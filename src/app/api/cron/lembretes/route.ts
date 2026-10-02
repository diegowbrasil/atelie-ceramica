import { NextResponse } from "next/server";
import { executarLembretesDoDia } from "@/lib/lembretesServidor";
import { hojeNoAtelie } from "@/lib/lembretes";

// Chamado 1x por dia pelo cron da Vercel (vercel.json, "0 11 * * *" =
// 11h UTC = 8h em Brasília; no plano grátis a Vercel pode disparar em
// qualquer minuto dessa hora). A Vercel manda
// `Authorization: Bearer <CRON_SECRET>` sozinha quando essa variável
// existe no projeto; sem ela configurada, recusa sempre — esta rota manda
// mensagem pra aluno de verdade, não pode ficar aberta.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || request.headers.get("authorization") !== `Bearer ${segredo}`) {
    return NextResponse.json({ ok: false, erro: "Não autorizado." }, { status: 401 });
  }

  try {
    const resumo = await executarLembretesDoDia(hojeNoAtelie());
    return NextResponse.json({ ok: true, ...resumo });
  } catch (e) {
    return NextResponse.json({ ok: false, erro: e instanceof Error ? e.message : "Falha inesperada." }, { status: 500 });
  }
}
