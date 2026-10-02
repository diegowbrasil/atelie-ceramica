"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { convidarAdmin, removerAdmin, type AdminInfo } from "@/lib/actions/convite";
import type { PainelLembretes } from "@/lib/actions/lembretes";
import { mensagemDeErro } from "@/lib/resultado";
import { LembretesCard } from "@/components/configuracoes/LembretesCard";
import { Copy, Check, Trash2, ShieldPlus } from "lucide-react";

// Primeira tela real de Configurações (era EmBreve) — pedido do Diego
// (2026-09-30): "preciso criar as contas do admin". Mesmo mecanismo de
// convite que Alunos já tem (link, a pessoa define a própria senha),
// mas aqui a Server Action também cria o cadastro — admin não passa por
// um passo de "matrícula" antes como o aluno passa (ver convidarAdmin em
// actions/convite.ts).

const STATUS_BADGE: Record<AdminInfo["status"], { tone: "success" | "warning" | "danger"; label: string }> = {
  ativo: { tone: "success", label: "Ativo" },
  pendente: { tone: "warning", label: "Convite pendente" },
  expirado: { tone: "danger", label: "Convite expirado" },
};

export function ConfiguracoesClient({ adminsIniciais, lembretes }: { adminsIniciais: AdminInfo[]; lembretes: PainelLembretes }) {
  const router = useRouter();
  const [admins, setAdmins] = useState(adminsIniciais);
  const [modalConvidar, setModalConvidar] = useState(false);
  const [linkConvite, setLinkConvite] = useState<string | null>(null);
  const [removendo, setRemovendo] = useState<AdminInfo | null>(null);
  const [pendente, setPendente] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [erroLista, setErroLista] = useState<string | null>(null);

  // Sem param dinâmico na rota — sem isso, router.refresh() buscar dado
  // novo no servidor não atualizaria esse state local (mesmo padrão de
  // AlunosListClient/AvisosCard).
  useEffect(() => setAdmins(adminsIniciais), [adminsIniciais]);

  async function confirmarRemocao() {
    if (!removendo) return;
    setPendente(true);
    setErro(null);
    try {
      const r = await removerAdmin(removendo.id);
      if (!r.ok) return setErro(r.erro);
      setRemovendo(null);
      router.refresh();
    } catch (e) {
      setErro(mensagemDeErro(e, "Não deu pra remover. Tenta de novo."));
    } finally {
      setPendente(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6 md:px-8 md:pb-10">
      <h1 className="mb-6 font-display text-2xl uppercase tracking-wide text-ink">Configurações</h1>

      <section className="mb-8">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">Administradores</h2>
            <p className="text-xs text-ink-soft">Quem tem acesso ao painel administrativo.</p>
          </div>
          <button onClick={() => setModalConvidar(true)} className="flex shrink-0 items-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-sm font-medium text-white shadow-soft hover:bg-accent-hover">
            <ShieldPlus size={15} /> Convidar admin
          </button>
        </div>

        <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
          {admins.map((a) => (
            <div key={a.id} className="flex items-center gap-3 p-4">
              <Avatar nome={a.nome} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{a.nome}</p>
                <p className="truncate text-xs text-ink-soft">{a.email}</p>
              </div>
              <Badge tone={STATUS_BADGE[a.status].tone}>{STATUS_BADGE[a.status].label}</Badge>
              {a.status !== "ativo" && (
                <button
                  onClick={async () => {
                    if (!a.email) return;
                    const r = await convidarAdmin({ nome: a.nome, email: a.email }).catch(() => null);
                    if (!r?.ok) return setErroLista(r?.erro ?? "Não deu pra gerar o convite. Tenta de novo.");
                    setErroLista(null);
                    setLinkConvite(`${window.location.origin}/convite/${r.token}`);
                    router.refresh();
                  }}
                  className="shrink-0 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-cream"
                >
                  Reenviar
                </button>
              )}
              <button onClick={() => setRemovendo(a)} aria-label={`Remover ${a.nome}`} className="shrink-0 rounded-lg border border-line p-1.5 text-ink-soft hover:bg-rose-50 hover:text-rose-600">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        {erroLista && <p className="mt-2 text-sm text-rose-600">{erroLista}</p>}
      </section>

      <LembretesCard painel={lembretes} />

      {modalConvidar && (
        <ModalConvidarAdmin
          onClose={() => setModalConvidar(false)}
          onConvidado={(link) => {
            setModalConvidar(false);
            setLinkConvite(link);
            router.refresh();
          }}
        />
      )}

      {linkConvite && (
        <Modal onClose={() => setLinkConvite(null)}>
          <h3 className="mb-1 text-base font-semibold text-ink">Convite gerado</h3>
          <p className="mb-3 text-sm text-ink-soft">Válido por 7 dias. Manda esse link pro novo admin (e-mail, WhatsApp, como preferir) — ele define a própria senha e já entra direto.</p>
          <LinkComBotaoCopiar link={linkConvite} />
        </Modal>
      )}

      {removendo && (
        <Modal onClose={() => setRemovendo(null)}>
          <h3 className="mb-1 text-base font-semibold text-ink">Remover {removendo.nome}?</h3>
          <p className="mb-4 text-sm text-ink-soft">
            {removendo.status === "ativo" ? "O acesso dessa pessoa ao painel é encerrado na hora. " : ""}
            Essa ação não pode ser desfeita.
          </p>
          {erro && <p className="mb-3 text-sm text-rose-500">{erro}</p>}
          <div className="flex gap-2">
            <button onClick={() => setRemovendo(null)} disabled={pendente} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink disabled:opacity-60">
              Voltar
            </button>
            <button onClick={confirmarRemocao} disabled={pendente} className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60">
              {pendente ? "Removendo…" : "Remover"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function LinkComBotaoCopiar({ link }: { link: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <>
      <div className="mb-4 break-all rounded-xl bg-cream p-3 text-xs text-ink">{link}</div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(link);
          setCopiado(true);
          setTimeout(() => setCopiado(false), 2000);
        }}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-line py-2.5 text-sm font-medium text-ink hover:bg-cream"
      >
        {copiado ? <Check size={15} /> : <Copy size={15} />}
        {copiado ? "Copiado!" : "Copiar link"}
      </button>
    </>
  );
}

function ModalConvidarAdmin({ onClose, onConvidado }: { onClose: () => void; onConvidado: (link: string) => void }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function confirmar() {
    if (!nome.trim() || !email.trim()) {
      setErro("Preenche nome e e-mail.");
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      const r = await convidarAdmin({ nome: nome.trim(), email: email.trim() });
      if (!r.ok) return setErro(r.erro);
      onConvidado(`${window.location.origin}/convite/${r.token}`);
    } catch (e) {
      setErro(mensagemDeErro(e, "Não deu pra convidar. Tenta de novo."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <h3 className="mb-3 text-base font-semibold text-ink">Convidar admin</h3>

      <label className="mb-1 block text-xs font-medium text-ink-soft">Nome</label>
      <input autoFocus value={nome} onChange={(e) => setNome(e.target.value)} className="mb-3 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-ink" placeholder="Nome completo" />

      <label className="mb-1 block text-xs font-medium text-ink-soft">E-mail</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-3 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
        placeholder="nome@email.com"
      />

      {erro && <p className="mb-3 text-sm text-rose-500">{erro}</p>}

      <div className="flex gap-2">
        <button onClick={onClose} disabled={enviando} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink disabled:opacity-60">
          Cancelar
        </button>
        <button onClick={confirmar} disabled={enviando} className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60">
          {enviando ? "Gerando…" : "Gerar convite"}
        </button>
      </div>
    </Modal>
  );
}
