"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConfigAtelie } from "@/components/ConfigAtelieProvider";
import { salvarConfigAtelie } from "@/lib/actions/configuracoes";
import { mensagemDeErro } from "@/lib/resultado";

// Preços e chave Pix (2026-10-08) — o que o aluno vê ao renovar o pacote
// e ao pagar oficina/pacote. A Hanna muda aqui sem pedir pra ninguém.
export function PrecosPixCard() {
  const router = useRouter();
  const config = useConfigAtelie();
  const [pix, setPix] = useState(config.pixChave ?? "");
  const [pacote, setPacote] = useState(String(config.precoPacote));
  const [avulsa, setAvulsa] = useState(String(config.precoAvulsa));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    setPix(config.pixChave ?? "");
    setPacote(String(config.precoPacote));
    setAvulsa(String(config.precoAvulsa));
  }, [config]);

  async function salvar() {
    setSalvando(true);
    setErro(null);
    setSalvo(false);
    try {
      const r = await salvarConfigAtelie({ pixChave: pix, precoPacote: pacote, precoAvulsa: avulsa });
      if (!r.ok) return setErro(r.erro);
      setSalvo(true);
      router.refresh();
    } catch (e) {
      setErro(mensagemDeErro(e, "Não deu pra salvar. Tenta de novo."));
    } finally {
      setSalvando(false);
    }
  }

  const campo = "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-ink";

  return (
    <section className="mb-8">
      <h2 className="text-sm font-semibold text-ink">Preços e Pix</h2>
      <p className="mb-3 text-xs text-ink-soft">O que o aluno vê quando renova o pacote ou paga uma oficina pelo app.</p>

      <div className="rounded-2xl border border-line bg-white p-4">
        {!config.instalado && (
          <p className="mb-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
            Falta criar a tabela no banco (SQL de &quot;atelie_config&quot;). Até lá o app usa R$ 460 / R$ 160 e não mostra chave Pix.
          </p>
        )}

        <label htmlFor="pix" className="mb-1 block text-xs font-medium text-ink-soft">Chave Pix do ateliê</label>
        <input id="pix" value={pix} onChange={(e) => setPix(e.target.value)} placeholder="CPF, CNPJ, e-mail, celular ou chave aleatória" className={campo + " mb-1"} />
        <p className="mb-4 text-xs text-ink-soft">{pix.trim() ? "Aparece pro aluno com botão de copiar." : "Sem chave, o aluno é orientado a combinar o pagamento pelo WhatsApp."}</p>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="preco-pacote" className="mb-1 block text-xs font-medium text-ink-soft">Pacote de 4 aulas (R$)</label>
            <input id="preco-pacote" inputMode="decimal" value={pacote} onChange={(e) => setPacote(e.target.value)} className={campo} />
          </div>
          <div>
            <label htmlFor="preco-avulsa" className="mb-1 block text-xs font-medium text-ink-soft">Aula avulsa (R$)</label>
            <input id="preco-avulsa" inputMode="decimal" value={avulsa} onChange={(e) => setAvulsa(e.target.value)} className={campo} />
          </div>
        </div>

        {erro && <p className="mb-3 text-sm text-rose-600">{erro}</p>}
        {salvo && !erro && <p className="mb-3 text-sm text-emerald-700">Salvo.</p>}

        <button
          onClick={salvar}
          disabled={salvando || !config.instalado}
          className="w-full rounded-xl bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {salvando ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </section>
  );
}
