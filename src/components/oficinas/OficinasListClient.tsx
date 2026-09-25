"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { ModalOficina, type DadosOficina } from "@/components/oficinas/ModalOficina";
import { corOficina, type CorIdentidade } from "@/lib/oficinas";
import { criarOficina, type OficinaReal } from "@/lib/actions/oficinas";
import { FundoArgilaParallax } from "@/components/ui/FundoArgilaParallax";
import { Plus } from "lucide-react";

// Referência de comportamento: demo/AtelieDemo.jsx (Oficinas). Ligado aos
// dados reais (2026-09-24).

const PILL_COR: Record<CorIdentidade, string> = {
  sienna: "bg-sienna/15 text-sienna", ardosia: "bg-ardosia/15 text-ardosia", musgo: "bg-musgo/15 text-musgo", cafe: "bg-cafe/15 text-cafe",
};
const ANEL_COR: Record<CorIdentidade, string> = {
  sienna: "rgb(var(--sienna))", ardosia: "rgb(var(--ardosia))", musgo: "rgb(var(--musgo))", cafe: "rgb(var(--cafe))",
};
const ANEL_TRACK: Record<CorIdentidade, string> = {
  sienna: "rgb(var(--sienna) / 0.18)", ardosia: "rgb(var(--ardosia) / 0.18)", musgo: "rgb(var(--musgo) / 0.18)", cafe: "rgb(var(--cafe) / 0.18)",
};

export function OficinasListClient({ oficinasIniciais }: { oficinasIniciais: OficinaReal[] }) {
  const router = useRouter();
  const [oficinas, setOficinas] = useState<OficinaReal[]>(oficinasIniciais);
  const [modalNova, setModalNova] = useState(false);
  const [pendente, setPendente] = useState(false);

  // Esta tela não remonta sozinha ao navegar (sem param dinâmico na rota)
  // — mesmo padrão de resync já usado nos outros domínios.
  useEffect(() => setOficinas(oficinasIniciais), [oficinasIniciais]);

  async function salvarNova(dados: DadosOficina) {
    setPendente(true);
    try {
      await criarOficina(dados);
      setModalNova(false);
      router.refresh();
    } finally {
      setPendente(false);
    }
  }

  return (
    <div className="relative">
      <FundoArgilaParallax cor="carvao" />
      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-8 md:pb-10">
      <div className="relative mb-5 flex min-h-[2.75rem] items-center justify-end">
        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-2xl uppercase tracking-wide text-ink">
          Oficinas
        </h1>
        <button onClick={() => setModalNova(true)} title="Nova oficina" aria-label="Nova oficina" className="rounded-full p-2 text-ink-soft hover:bg-cream hover:text-ink">
          <Plus size={20} />
        </button>
      </div>

      {oficinas.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white px-6 py-10 text-center text-sm text-ink-soft">Nenhuma oficina agendada ainda.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {oficinas.map((o) => {
            const ocupadas = o.participantes.filter((p) => p.nome).length;
            const cor = corOficina(o.id);
            return (
              <Link key={o.id} href={`/oficinas/${o.id}`} className="rounded-2xl border border-line bg-white p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-medium text-ink">{o.nome}</h3>
                    <span className={"mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium " + PILL_COR[cor]}>{o.status}</span>
                  </div>
                  <div className="relative shrink-0">
                    <ProgressRing percentual={(ocupadas / o.vagas) * 100} size={44} stroke={5} color={ANEL_COR[cor]} trackColor={ANEL_TRACK[cor]} />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold" style={{ color: ANEL_COR[cor] }}>
                      {ocupadas}/{o.vagas}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-ink-soft">{o.data} · {o.hora}</p>
                {o.valor != null && <p className="mt-1 text-sm text-ink-soft">R$ {o.valor} por pessoa</p>}
              </Link>
            );
          })}
        </div>
      )}

      {modalNova && <ModalOficina pendente={pendente} onClose={() => setModalNova(false)} onSalvar={salvarNova} />}
      </div>
    </div>
  );
}
