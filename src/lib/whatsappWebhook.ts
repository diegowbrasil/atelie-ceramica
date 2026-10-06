import { createAdminClient } from "@/lib/supabase/admin";
import { enviarTextoWhatsApp } from "@/lib/lembretesServidor";
import { telefoneParaWhatsApp } from "@/lib/lembretes";

// Só pra código de servidor (usa service_role). Processa o que a Meta
// manda pro webhook: respostas dos alunos (guarda + responde
// automaticamente) e avisos de lembrete NÃO entregue.

const RESPOSTA_AUTOMATICA =
  "Oi! Este número só envia lembretes automáticos do ateliê e não lê as respostas. Pra falar com a Hanna, chama no WhatsApp: (14) 99725-7052.";

interface MensagemRecebida {
  from: string;
  id: string;
  timestamp?: string;
  type: string;
  text?: { body?: string };
  button?: { text?: string };
  reaction?: { emoji?: string };
}

interface StatusEnvio {
  id: string;
  status: string;
  errors?: { code?: number; title?: string }[];
}

export interface EventoWebhookWhatsApp {
  entry?: {
    changes?: {
      field?: string;
      value?: {
        metadata?: { phone_number_id?: string };
        contacts?: { wa_id?: string; profile?: { name?: string } }[];
        messages?: MensagemRecebida[];
        statuses?: StatusEnvio[];
      };
    }[];
  }[];
}

/** O WhatsApp às vezes identifica celular brasileiro antigo SEM o nono
 *  dígito (55 14 9xxxx-xxxx chega como 55 14 xxxx-xxxx) — compara sempre
 *  na forma sem ele. */
function chaveTelefone(digitos: string): string {
  return digitos.length === 13 && digitos[4] === "9" ? digitos.slice(0, 4) + digitos.slice(5) : digitos;
}

function motivoNaoEntregue(erro: { code?: number; title?: string } | undefined): string {
  if (erro?.code === 131026) return "Não entregue: o número não tem WhatsApp ou não pode receber mensagens.";
  return `Não entregue${erro?.title ? `: ${erro.title}` : ""}${erro?.code ? ` (erro ${erro.code})` : ""}.`;
}

export async function processarEventoWhatsApp(evento: EventoWebhookWhatsApp): Promise<void> {
  const admin = createAdminClient();
  const meuNumeroId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const valores = (evento.entry ?? [])
    .flatMap((e) => e.changes ?? [])
    .filter((c) => c.field === "messages" && c.value)
    .map((c) => c.value!)
    .filter((v) => !meuNumeroId || !v.metadata?.phone_number_id || v.metadata.phone_number_id === meuNumeroId);

  let alunoPorTelefone: Map<string, string> | null = null;

  for (const v of valores) {
    for (const s of v.statuses ?? []) {
      if (s.status !== "failed") continue;
      await admin.from("lembretes_enviados").update({ status: "erro", erro: motivoNaoEntregue(s.errors?.[0]) }).eq("whatsapp_message_id", s.id);
    }

    for (const m of v.messages ?? []) {
      if (!alunoPorTelefone) {
        const { data: perfis } = await admin.from("profiles").select("id, telefone").not("telefone", "is", null);
        alunoPorTelefone = new Map();
        for (const p of perfis ?? []) {
          const tel = telefoneParaWhatsApp(p.telefone);
          if (tel) alunoPorTelefone.set(chaveTelefone(tel), p.id);
        }
      }

      const { data: inserida, error } = await admin
        .from("whatsapp_respostas")
        .upsert(
          {
            whatsapp_message_id: m.id,
            telefone: m.from,
            nome_whatsapp: v.contacts?.find((c) => c.wa_id === m.from)?.profile?.name ?? null,
            aluno_id: alunoPorTelefone.get(chaveTelefone(m.from)) ?? null,
            texto: m.text?.body ?? m.button?.text ?? m.reaction?.emoji ?? null,
            tipo: m.type,
            recebida_em: m.timestamp ? new Date(Number(m.timestamp) * 1000).toISOString() : new Date().toISOString(),
          },
          { onConflict: "whatsapp_message_id", ignoreDuplicates: true }
        )
        .select("id");
      // Lança pra rota devolver erro — aí a Meta tenta entregar de novo
      // mais tarde, em vez de a resposta se perder.
      if (error) throw new Error(`Falha ao guardar resposta: ${error.message}`);
      if (!inserida || inserida.length === 0) continue; // evento repetido

      // Uma resposta automática por pessoa a cada 24h — senão quem manda 5
      // mensagens seguidas recebe 5 vezes o mesmo aviso.
      const desde = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      const { count } = await admin
        .from("whatsapp_respostas")
        .select("id", { count: "exact", head: true })
        .eq("telefone", m.from)
        .eq("resposta_automatica_enviada", true)
        .gte("recebida_em", desde);
      if ((count ?? 0) > 0) continue;

      const envio = await enviarTextoWhatsApp(m.from, RESPOSTA_AUTOMATICA);
      if (envio.ok) await admin.from("whatsapp_respostas").update({ resposta_automatica_enviada: true }).eq("id", inserida[0].id);
    }
  }
}
