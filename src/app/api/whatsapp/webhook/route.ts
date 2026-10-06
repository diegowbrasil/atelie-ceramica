import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { processarEventoWhatsApp, type EventoWebhookWhatsApp } from "@/lib/whatsappWebhook";

// Endereço que a Meta chama a cada resposta recebida e a cada mudança de
// status de mensagem enviada. Público (sem sessão — ver middleware.ts),
// por isso toda chamada é conferida pela assinatura que a Meta gera com o
// App Secret: sem isso, qualquer um poderia inventar "respostas" ou fazer
// o app mandar a resposta automática pra números aleatórios.
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** Verificação feita uma vez pela Meta ao cadastrar o webhook no app dela. */
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const tokenEsperado = process.env.WHATSAPP_VERIFY_TOKEN;
  const desafio = params.get("hub.challenge");
  if (tokenEsperado && params.get("hub.mode") === "subscribe" && params.get("hub.verify_token") === tokenEsperado && desafio) {
    return new Response(desafio, { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  return new Response("Proibido", { status: 403 });
}

function assinaturaValida(corpo: string, assinatura: string | null): boolean {
  const segredo = process.env.WHATSAPP_APP_SECRET;
  if (!segredo || !assinatura) return false;
  const esperada = Buffer.from(`sha256=${createHmac("sha256", segredo).update(corpo).digest("hex")}`);
  const recebida = Buffer.from(assinatura);
  return esperada.length === recebida.length && timingSafeEqual(esperada, recebida);
}

export async function POST(request: Request) {
  const corpo = await request.text();
  if (!assinaturaValida(corpo, request.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ ok: false, erro: "Assinatura inválida." }, { status: 401 });
  }

  let evento: EventoWebhookWhatsApp;
  try {
    evento = JSON.parse(corpo) as EventoWebhookWhatsApp;
  } catch {
    return NextResponse.json({ ok: false, erro: "Corpo inválido." }, { status: 400 });
  }

  try {
    await processarEventoWhatsApp(evento);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[webhook whatsapp]", e);
    return NextResponse.json({ ok: false, erro: e instanceof Error ? e.message : "Falha inesperada." }, { status: 500 });
  }
}
