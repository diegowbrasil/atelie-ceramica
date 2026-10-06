import { createAdminClient } from "@/lib/supabase/admin";
import {
  MODELOS, DIA_NOME, renderizarModelo, limparParametro, primeiroNome, diaDaSemana, somarDias, telefoneParaWhatsApp, type TipoLembrete,
} from "@/lib/lembretes";
import type { LembretesModo } from "@/types/database";

// Só pode ser importado por código de servidor (Route Handler e Server
// Actions) — usa service_role. Sem "use server" de propósito: com ele,
// executarLembretesDoDia viraria uma Server Action que qualquer navegador
// conseguiria chamar e disparar mensagens pros alunos.

const VERSAO_API_META = "v23.0";
const LIMITE_MODO_TESTE = 3;

export interface LembretePlanejado {
  tipo: TipoLembrete;
  referenciaId: string;
  dataReferencia: string;
  alunoId: string | null;
  nome: string;
  /** Já no formato da API (só dígitos, com 55); null = não dá pra enviar. */
  telefone: string | null;
  titulo: string;
  parametros: string[];
  texto: string;
  /** null = vai receber. */
  motivoSemEnvio: string | null;
}

interface MatriculaDoDia {
  turma_id: string;
  aluno_id: string;
  provisorio: boolean;
  profiles: { nome: string; telefone: string | null } | null;
}

interface OficinaDeAmanha {
  id: string;
  nome: string;
  hora_inicio: string;
  observacoes: string | null;
  oficina_participantes: {
    aluno_id: string | null;
    nome: string;
    telefone: string | null;
    confirmado: boolean;
    profiles: { telefone: string | null } | null;
  }[];
}

/** Quem recebe lembrete quando o cron rodar em `dataISO`: aulas DESSE
 *  dia e oficinas do dia SEGUINTE. Devolve também quem NÃO vai receber,
 *  com o motivo — a prévia da tela mostra os dois, pra ninguém ficar sem
 *  lembrete sem o admin saber por quê. */
export async function planejarLembretes(dataISO: string): Promise<LembretePlanejado[]> {
  const admin = createAdminClient();
  const dia = diaDaSemana(dataISO);
  const amanha = somarDias(dataISO, 1);

  const [{ data: turmas, error: eTurmas }, { data: oficinas, error: eOficinas }] = await Promise.all([
    admin.from("turmas").select("id, nome, hora_inicio, hora_fim").eq("dia", dia).eq("ativo", true).order("hora_inicio"),
    admin
      .from("oficinas")
      .select("id, nome, hora_inicio, observacoes, oficina_participantes(aluno_id, nome, telefone, confirmado, profiles(telefone))")
      .eq("data", amanha)
      .order("hora_inicio")
      .overrideTypes<OficinaDeAmanha[], { merge: false }>(),
  ]);
  if (eTurmas) throw new Error(`Falha ao buscar turmas: ${eTurmas.message}`);
  if (eOficinas) throw new Error(`Falha ao buscar oficinas: ${eOficinas.message}`);

  const lembretes: LembretePlanejado[] = [];
  const turmaIds = (turmas ?? []).map((t) => t.id);

  if (turmaIds.length > 0) {
    const [{ data: matriculas, error: eMatriculas }, { data: aulas }] = await Promise.all([
      admin
        .from("matriculas")
        .select("turma_id, aluno_id, provisorio, profiles(nome, telefone)")
        .in("turma_id", turmaIds)
        .eq("status", "confirmado")
        .order("solicitado_em")
        .overrideTypes<MatriculaDoDia[], { merge: false }>(),
      admin.from("aulas").select("id, turma_id").in("turma_id", turmaIds).eq("data", dataISO),
    ]);
    if (eMatriculas) throw new Error(`Falha ao buscar matrículas: ${eMatriculas.message}`);

    // "Ausente" na tela de Turmas = presença com status falta na aula do dia.
    const turmaDaAula = new Map((aulas ?? []).map((a) => [a.id, a.turma_id]));
    const ausentes = new Set<string>();
    if (turmaDaAula.size > 0) {
      const { data: faltas } = await admin.from("presencas").select("aula_id, aluno_id").in("aula_id", [...turmaDaAula.keys()]).eq("status", "falta");
      for (const f of faltas ?? []) ausentes.add(`${turmaDaAula.get(f.aula_id)}:${f.aluno_id}`);
    }

    for (const t of turmas ?? []) {
      const horario = `${t.hora_inicio.slice(0, 5)} às ${t.hora_fim.slice(0, 5)}`;
      for (const m of (matriculas ?? []).filter((m) => m.turma_id === t.id)) {
        const nome = m.profiles?.nome ?? "Aluno";
        const telefone = telefoneParaWhatsApp(m.profiles?.telefone);
        const parametros = [limparParametro(primeiroNome(nome), "aluno(a)"), DIA_NOME[dia], horario];
        // Visita provisória não tem data — mandar toda semana pra quem só
        // veio experimentar uma vez seria pior do que não lembrar.
        const motivoSemEnvio = m.provisorio
          ? "visita provisória (sem data definida)"
          : ausentes.has(`${t.id}:${m.aluno_id}`)
            ? "marcado como ausente nesse dia"
            : !telefone
              ? m.profiles?.telefone ? "telefone inválido" : "sem telefone cadastrado"
              : null;
        lembretes.push({
          tipo: "aula", referenciaId: t.id, dataReferencia: dataISO, alunoId: m.aluno_id, nome, telefone, titulo: t.nome,
          parametros, texto: renderizarModelo("aula", parametros), motivoSemEnvio,
        });
      }
    }
  }

  for (const o of oficinas ?? []) {
    const hora = o.hora_inicio.slice(0, 5);
    const observacoes = limparParametro(o.observacoes, "Até lá!");
    for (const p of o.oficina_participantes) {
      const telefoneBruto = p.telefone ?? p.profiles?.telefone ?? null;
      const telefone = telefoneParaWhatsApp(telefoneBruto);
      const parametros = [limparParametro(primeiroNome(p.nome), "aluno(a)"), limparParametro(o.nome, "do ateliê"), hora, observacoes];
      const motivoSemEnvio = !p.confirmado
        ? "inscrição ainda não confirmada"
        : !telefone
          ? telefoneBruto ? "telefone inválido" : "sem telefone cadastrado"
          : null;
      lembretes.push({
        tipo: "oficina", referenciaId: o.id, dataReferencia: amanha, alunoId: p.aluno_id, nome: p.nome, telefone, titulo: o.nome,
        parametros, texto: renderizarModelo("oficina", parametros), motivoSemEnvio,
      });
    }
  }

  return lembretes;
}

export function whatsappConfigurado(): boolean {
  return !!process.env.WHATSAPP_TOKEN && !!process.env.WHATSAPP_PHONE_NUMBER_ID;
}

type ResultadoEnvio = { ok: true; id: string } | { ok: false; erro: string };

async function postarMensagemWhatsApp(mensagem: Record<string, unknown>): Promise<ResultadoEnvio> {
  const token = process.env.WHATSAPP_TOKEN;
  const numeroId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !numeroId) return { ok: false, erro: "A conta do WhatsApp (Meta) ainda não foi configurada." };

  try {
    const resposta = await fetch(`https://graph.facebook.com/${VERSAO_API_META}/${numeroId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", ...mensagem }),
      signal: AbortSignal.timeout(15000),
    });
    const corpo = (await resposta.json().catch(() => null)) as { error?: { message?: string }; messages?: { id?: string }[] } | null;
    if (!resposta.ok) return { ok: false, erro: corpo?.error?.message ?? `A Meta respondeu com erro ${resposta.status}.` };
    const id = corpo?.messages?.[0]?.id;
    return id ? { ok: true, id } : { ok: false, erro: "A Meta não devolveu o id da mensagem." };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Falha de rede ao falar com a Meta." };
  }
}

export function enviarModeloWhatsApp(para: string, tipo: TipoLembrete, parametros: string[]): Promise<ResultadoEnvio> {
  return postarMensagemWhatsApp({
    to: para,
    type: "template",
    template: {
      name: MODELOS[tipo].nome,
      language: { code: "pt_BR" },
      components: [{ type: "body", parameters: parametros.map((text) => ({ type: "text", text })) }],
    },
  });
}

/** Texto livre — a Meta só aceita isso em até 24h depois da última
 *  mensagem que a pessoa mandou (fora disso, só modelo aprovado). */
export function enviarTextoWhatsApp(para: string, texto: string): Promise<ResultadoEnvio> {
  return postarMensagemWhatsApp({ to: para, type: "text", text: { body: texto } });
}

export interface ResumoExecucao {
  dataISO: string;
  modo: LembretesModo;
  planejados: number;
  enviados: number;
  jaEnviados: number;
  erros: { nome: string; erro: string }[];
}

export async function executarLembretesDoDia(dataISO: string): Promise<ResumoExecucao> {
  const admin = createAdminClient();
  const { data: config, error } = await admin.from("lembretes_config").select("modo, numero_teste").eq("id", 1).maybeSingle();
  if (error) throw new Error(`Falha ao ler a configuração dos lembretes: ${error.message}`);

  const modo = config?.modo ?? "desligado";
  const resumo: ResumoExecucao = { dataISO, modo, planejados: 0, enviados: 0, jaEnviados: 0, erros: [] };
  if (modo === "desligado") return resumo;
  // Sem isso, no modo ativo cada lembrete seria reservado e marcado como
  // erro — e não seria mais tentado nesse dia.
  if (!whatsappConfigurado()) throw new Error("A conta do WhatsApp (Meta) ainda não foi configurada.");

  const enviaveis = (await planejarLembretes(dataISO)).filter((l): l is LembretePlanejado & { telefone: string } => !!l.telefone && !l.motivoSemEnvio);
  resumo.planejados = enviaveis.length;

  if (modo === "teste") {
    const destino = telefoneParaWhatsApp(config?.numero_teste);
    if (!destino) throw new Error("Modo teste ligado sem um número de teste válido.");
    for (const l of enviaveis.slice(0, LIMITE_MODO_TESTE)) {
      const r = await enviarModeloWhatsApp(destino, l.tipo, l.parametros);
      if (r.ok) resumo.enviados++;
      else resumo.erros.push({ nome: l.nome, erro: r.erro });
    }
    return resumo;
  }

  for (const l of enviaveis) {
    // Reserva a linha ANTES de enviar: se a Vercel disparar o cron 2x, a
    // segunda reserva bate na unique e volta vazia — ninguém recebe o
    // mesmo lembrete duas vezes.
    const { data: reserva, error: eReserva } = await admin
      .from("lembretes_enviados")
      .upsert(
        { tipo: l.tipo, referencia_id: l.referenciaId, data_referencia: l.dataReferencia, aluno_id: l.alunoId, nome: l.nome, telefone: l.telefone, status: "enviando" },
        { onConflict: "tipo,referencia_id,data_referencia,telefone", ignoreDuplicates: true }
      )
      .select("id");
    if (eReserva) {
      resumo.erros.push({ nome: l.nome, erro: eReserva.message });
      continue;
    }
    if (!reserva || reserva.length === 0) {
      resumo.jaEnviados++;
      continue;
    }

    const r = await enviarModeloWhatsApp(l.telefone, l.tipo, l.parametros);
    await admin
      .from("lembretes_enviados")
      .update(r.ok ? { status: "enviado", whatsapp_message_id: r.id } : { status: "erro", erro: r.erro })
      .eq("id", reserva[0].id);
    if (r.ok) resumo.enviados++;
    else resumo.erros.push({ nome: l.nome, erro: r.erro });
  }

  return resumo;
}
