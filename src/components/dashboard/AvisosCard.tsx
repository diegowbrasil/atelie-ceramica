"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { criarAviso as criarAvisoReal, removerAviso as removerAvisoReal, type AvisoReal } from "@/lib/actions/avisos";

// Referência de comportamento: demo/AtelieDemo.jsx (AvisosCard/LinhaAviso/
// ModalNovoAviso). Banner suspenso sem bordas, colado nas duas laterais da
// tela (mesmo -mx que cancela o padding do <main>). Lista vazia por padrão
// — não é dado real pré-existente, é uma feature nova (pedido do Diego,
// 2026-09-18: "qro implementar, uma seção de avisos... posso escolher pra
// mim como um lembrete, ou para os alunos").
//
// Faixa preta (2026-09-22, correção sobre a versão original com fundo
// terroso claro — pedido do Diego com print marcado: "PRECISO Q ESSA
// FAIXA FIQUE PRETA E Q FIQUE SÓ O AVISO NA FAIXA E NAO O +NOVO AVISO").
// O preto só é aplicado no <div> de cada aviso de verdade — os botões de
// adicionar ("+ Novo aviso"/"Fixar um aviso no topo") ficam sem esse
// fundo, viram link discreto na cor normal da página.

function LinhaAviso({ texto, cor }: { texto: string; cor: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textoRef = useRef<HTMLSpanElement>(null);
  const [passando, setPassando] = useState(false);

  useEffect(() => {
    function medir() {
      if (containerRef.current && textoRef.current) {
        setPassando(textoRef.current.scrollWidth > containerRef.current.clientWidth);
      }
    }
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [texto]);

  return (
    <div ref={containerRef} className={"min-w-0 flex-1 overflow-hidden " + (passando ? "" : "flex justify-center")}>
      <div className={"flex w-max whitespace-nowrap " + (passando ? "aviso-passando" : "")}>
        <span ref={textoRef} className={"shrink-0 pr-10 text-xs font-medium uppercase tracking-wide underline underline-offset-2 " + cor}>
          {texto}
        </span>
        {passando && (
          <span aria-hidden="true" className={"shrink-0 pr-10 text-xs font-medium uppercase tracking-wide underline underline-offset-2 " + cor}>
            {texto}
          </span>
        )}
      </div>
    </div>
  );
}

function ModalNovoAviso({ onClose, onSalvar }: { onClose: () => void; onSalvar: (texto: string, destinatario: "admin" | "alunos") => void }) {
  const [texto, setTexto] = useState("");
  const [destinatario, setDestinatario] = useState<"admin" | "alunos">("admin");

  return (
    <Modal onClose={onClose}>
      <h3 className="mb-3 text-base font-semibold text-ink">Novo aviso</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!texto.trim()) return;
          onSalvar(texto.trim(), destinatario);
        }}
      >
        <label className="mb-1 block text-xs font-medium text-ink-soft">Mensagem</label>
        <textarea
          autoFocus
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={3}
          className="mb-3 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
          placeholder="Ex: Comprar mais esmalte azul."
        />
        <label className="mb-1 block text-xs font-medium text-ink-soft">Para quem</label>
        <div className="mb-4 flex gap-2">
          {([["admin", "Lembrete pra mim"], ["alunos", "Para os alunos"]] as const).map(([id, label]) => (
            <button
              type="button"
              key={id}
              onClick={() => setDestinatario(id)}
              className={"flex-1 border px-3 py-2.5 text-xs font-medium " + (destinatario === id ? "border-ink bg-cream-soft text-ink" : "border-line text-ink-soft")}
            >
              {label}
            </button>
          ))}
        </div>
        {destinatario === "alunos" && (
          <p className="mb-4 text-xs text-ink-soft">A Área do Aluno ainda não existe de verdade no app — por enquanto isso fica visível aqui, marcado como &quot;Para os alunos&quot;.</p>
        )}
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 border border-line py-2.5 text-sm font-medium text-ink">
            Cancelar
          </button>
          <button type="submit" className="flex-1 bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover">
            Fixar aviso
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function AvisosCard({ avisosIniciais }: { avisosIniciais: AvisoReal[] }) {
  const router = useRouter();
  const [avisos, setAvisos] = useState<AvisoReal[]>(avisosIniciais);
  const [modalAberto, setModalAberto] = useState(false);

  // `useState(avisosIniciais)` só usa o valor inicial no mount — sem isso,
  // `router.refresh()` buscar um `avisosIniciais` novo no servidor não
  // atualizaria o state local (esse componente não remonta ao navegar,
  // diferente de TurmaDetalheClient, que tem `key={slug}` no pai).
  useEffect(() => setAvisos(avisosIniciais), [avisosIniciais]);

  async function criarAviso(texto: string, destinatario: "admin" | "alunos") {
    setModalAberto(false);
    await criarAvisoReal(texto, destinatario);
    router.refresh();
  }
  async function removerAviso(id: string) {
    setAvisos((as) => as.filter((a) => a.id !== id));
    await removerAvisoReal(id);
    router.refresh();
  }

  // `rounded-none` explícito — sem isso, a regra CSS global de baixa
  // especificidade (button { border-radius: 0.75rem }) arredonda os
  // cantos por cima do que a faixa pede. `w-full` também explícito —
  // <button> não estica sozinho pra ocupar a largura toda como um <div>.
  //
  // Um único `return` — o modal precisa renderizar nos dois estados
  // (vazio ou com avisos). Um `if (avisos.length === 0) return (...)`
  // separado (tentativa inicial) tinha um bug real: esse early return
  // saía da função sem nunca chegar no `{modalAberto && <ModalNovoAviso
  // .../>}` — clicar em "Fixar um aviso no topo" setava o estado certo,
  // mas o modal nunca aparecia, porque só existia na árvore do outro
  // branch (achado ao testar ao vivo: clique registrava, nada abria).
  return (
    <>
      {avisos.length === 0 ? (
        <button
          onClick={() => setModalAberto(true)}
          className="-mx-4 flex w-full items-center justify-center rounded-none px-4 py-2 text-center text-xs font-medium uppercase tracking-wide text-ink underline underline-offset-2 md:-mx-8 md:px-8"
        >
          Fixar um aviso no topo
        </button>
      ) : (
        <div className="-mx-4 md:-mx-8">
          {avisos.map((a) => (
            <div key={a.id} className="flex items-center justify-center gap-2 bg-carvao px-4 py-2 md:px-8">
              <LinhaAviso texto={a.texto} cor={a.destinatario === "alunos" ? "text-white" : "text-rose-500"} />
              <button onClick={() => removerAviso(a.id)} aria-label="Remover aviso" className="shrink-0 rounded-none text-white/50 hover:text-white">
                <X size={13} />
              </button>
            </div>
          ))}
          <button
            onClick={() => setModalAberto(true)}
            className="flex w-full items-center justify-center rounded-none px-4 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-ink-soft underline underline-offset-2 hover:text-ink md:px-8"
          >
            + Novo aviso
          </button>
        </div>
      )}
      {modalAberto && <ModalNovoAviso onClose={() => setModalAberto(false)} onSalvar={criarAviso} />}
    </>
  );
}
