"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { FundoArgilaParallax } from "@/components/ui/FundoArgilaParallax";
import { ModalComprovante } from "@/components/aluno/ModalComprovante";
import { inscreverEmOficina, cancelarInscricaoOficina, marcarComprovanteEnviado, type OficinaParaAluno } from "@/lib/actions/alunoPortal";
import type { StatusPecas } from "@/types/database";
import { CalendarDays, Clock, Check } from "lucide-react";

const ETAPAS_PECAS: { id: StatusPecas; label: string }[] = [
  { id: "secagem", label: "Em secagem" },
  { id: "biscoitadas", label: "Peças biscoitadas" },
  { id: "esmaltadas", label: "Peças esmaltadas" },
  { id: "prontas", label: "Prontas para retirada" },
];

// Inscrição do aluno em oficina (2026-09-29, pedido do Diego) — fluxo de
// 3 estágios, não um simples pendente/pago: "Aguardando confirmação"
// (recém inscrito, admin ainda não aprovou — Pix nem aparece) →
// "Aguardando pagamento" (admin confirmou, Pix aparece, manda
// comprovante) → "Inscrição confirmada" (admin confirmou o pagamento).
// O gate de aprovação existe porque as oficinas também são vendidas pelo
// site, que não fala com este banco — o admin precisa confirmar contra o
// que já foi vendido por fora antes de prometer a vaga (explicado pelo
// Diego, não é só cautela por cautela).
export function AlunoOficinasClient({ oficinas }: { oficinas: OficinaParaAluno[] }) {
  const router = useRouter();
  const [modalInscricao, setModalInscricao] = useState<OficinaParaAluno | null>(null);
  const [modalComprovante, setModalComprovante] = useState<OficinaParaAluno | null>(null);
  const [modalCancelar, setModalCancelar] = useState<{ participanteId: string; nome: string } | null>(null);
  const [cancelando, setCancelando] = useState(false);
  const [erroCancelar, setErroCancelar] = useState<string | null>(null);

  async function confirmarCancelamento() {
    if (!modalCancelar) return;
    setCancelando(true);
    setErroCancelar(null);
    try {
      await cancelarInscricaoOficina(modalCancelar.participanteId);
      setModalCancelar(null);
      router.refresh();
    } catch (e) {
      setErroCancelar(e instanceof Error ? e.message : "Não foi possível cancelar.");
    } finally {
      setCancelando(false);
    }
  }

  return (
    <div className="relative">
      <FundoArgilaParallax cor="carvao" />
      <div className="relative mx-auto max-w-md px-4 pb-24 pt-8">
        <h1 className="mb-5 text-center font-display text-2xl uppercase tracking-wide text-ink">Oficinas</h1>

        {oficinas.length === 0 ? (
          <p className="text-center text-sm text-ink-soft">Nenhuma oficina agendada ainda.</p>
        ) : (
          <div className="space-y-3">
            {oficinas.map((o) => {
              const cheia = o.ocupadas >= o.vagas;
              const idxAtual = ETAPAS_PECAS.findIndex((e) => e.id === o.statusPecas);
              const minha = o.minhaParticipacao;
              return (
                <Card key={o.id} className="overflow-hidden border-2 border-carvao/40 bg-white/55 p-4 backdrop-blur-md">
                  <h3 className="mb-1 text-sm font-semibold text-ink">{o.nome}</h3>
                  <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-soft">
                    <span className="flex items-center gap-1"><CalendarDays size={12} />{o.data}</span>
                    <span className="flex items-center gap-1"><Clock size={12} />{o.hora}</span>
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge tone={cheia ? "danger" : "success"}>{o.ocupadas}/{o.vagas} vagas</Badge>
                    {o.valor != null && <span className="text-xs text-ink-soft">R$ {o.valor} por pessoa</span>}
                  </div>
                  {o.descricao && <p className="mb-2 text-xs text-ink-soft">{o.descricao}</p>}

                  {minha ? (
                    <div className="mt-3 rounded-xl border border-line bg-cream p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-ink">Você está inscrito</span>
                        {!minha.confirmado ? (
                          <Badge tone="warning">Aguardando confirmação</Badge>
                        ) : minha.pagamento === "pendente" ? (
                          <button onClick={() => setModalComprovante(o)} className="inline-flex" aria-label="Ver valor pendente e pagar">
                            <Badge tone="warning">Aguardando pagamento</Badge>
                          </button>
                        ) : (
                          <Badge tone="success">Inscrição confirmada</Badge>
                        )}
                      </div>
                      {!minha.confirmado && (
                        <p className="mb-2 text-xs text-ink-soft">O ateliê vai confirmar sua vaga em breve — a chave Pix aparece aqui assim que confirmar.</p>
                      )}
                      {minha.confirmado && minha.pagamento === "pendente" && minha.comprovanteEnviado && (
                        <p className="mb-2 text-xs text-ink-soft">Comprovante enviado — aguardando o ateliê confirmar o pagamento.</p>
                      )}
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {ETAPAS_PECAS.map((e, i) => {
                          const concluida = i <= idxAtual;
                          const atual = i === idxAtual;
                          return (
                            <span
                              key={e.id}
                              className={
                                "rounded-full border px-2 py-1 text-[11px] font-medium " +
                                (atual ? "border-accent bg-accent-soft text-accent" : concluida ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-line bg-white text-ink-soft")
                              }
                            >
                              {concluida && !atual && <Check size={10} className="mr-0.5 inline" />}
                              {e.label}
                            </span>
                          );
                        })}
                      </div>
                      {minha.pagamento === "pendente" && !minha.comprovanteEnviado && (
                        <button
                          onClick={() => setModalCancelar({ participanteId: minha.id, nome: o.nome })}
                          className="text-xs font-medium text-rose-600 hover:underline"
                        >
                          Cancelar inscrição
                        </button>
                      )}
                    </div>
                  ) : !cheia ? (
                    <button
                      onClick={() => setModalInscricao(o)}
                      className="mt-1 w-full rounded-xl bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
                    >
                      Se inscrever
                    </button>
                  ) : null}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {modalInscricao && (
        <ModalInscricaoOficina
          oficina={modalInscricao}
          onClose={() => setModalInscricao(null)}
          onInscrito={() => {
            setModalInscricao(null);
            router.refresh();
          }}
        />
      )}

      {modalComprovante && (
        <ModalComprovante
          pagamento={{ id: "", descricao: modalComprovante.nome, valor: modalComprovante.valor }}
          onClose={() => setModalComprovante(null)}
          onEnviar={() => {
            const participanteId = modalComprovante.minhaParticipacao?.id;
            if (participanteId) marcarComprovanteEnviado(participanteId).then(() => router.refresh());
          }}
        />
      )}

      {modalCancelar && (
        <Modal onClose={() => setModalCancelar(null)}>
          <h3 className="mb-1 text-base font-semibold text-ink">Cancelar inscrição em {modalCancelar.nome}?</h3>
          <p className="mb-4 text-sm text-ink-soft">Sua vaga volta a ficar disponível. Essa ação não pode ser desfeita.</p>
          {erroCancelar && <p className="mb-3 text-sm text-rose-500">{erroCancelar}</p>}
          <div className="flex gap-2">
            <button onClick={() => setModalCancelar(null)} disabled={cancelando} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink disabled:opacity-60">
              Voltar
            </button>
            <button onClick={confirmarCancelamento} disabled={cancelando} className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60">
              {cancelando ? "Cancelando…" : "Cancelar inscrição"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ModalInscricaoOficina({
  oficina, onClose, onInscrito,
}: {
  oficina: OficinaParaAluno;
  onClose: () => void;
  onInscrito: () => void;
}) {
  const [tipo, setTipo] = useState<"individual" | "dupla">("individual");
  const [duplaCom, setDuplaCom] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function confirmar() {
    if (tipo === "dupla" && !duplaCom.trim()) {
      setErro("Coloca o nome da dupla.");
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      await inscreverEmOficina(oficina.id, { tipo, duplaCom: tipo === "dupla" ? duplaCom.trim() : null });
      onInscrito();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu pra se inscrever. Tenta de novo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <h3 className="mb-1 text-base font-semibold text-ink">Se inscrever — {oficina.nome}</h3>
      <p className="mb-4 text-sm text-ink-soft">
        {oficina.data} · {oficina.hora}
        {oficina.valor != null && ` · R$ ${oficina.valor} por pessoa`}
      </p>

      <p className="mb-1.5 text-xs font-medium text-ink-soft">Individual ou dupla?</p>
      <div className="mb-3 flex gap-2">
        {(["individual", "dupla"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTipo(t)}
            className={"flex-1 rounded-lg border px-3 py-2 text-sm font-medium " + (tipo === t ? "border-ink bg-cream-soft text-ink" : "border-line text-ink-soft")}
          >
            {t === "individual" ? "Individual" : "Dupla"}
          </button>
        ))}
      </div>

      {tipo === "dupla" && (
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-ink-soft">Nome da dupla</label>
          <input
            autoFocus
            value={duplaCom}
            onChange={(e) => setDuplaCom(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
            placeholder="Nome completo"
          />
        </div>
      )}

      {erro && <p className="mb-3 text-sm text-rose-500">{erro}</p>}

      <div className="flex gap-2">
        <button onClick={onClose} disabled={enviando} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink disabled:opacity-60">
          Cancelar
        </button>
        <button
          onClick={confirmar}
          disabled={enviando}
          className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {enviando ? "Enviando…" : "Confirmar inscrição"}
        </button>
      </div>
    </Modal>
  );
}
