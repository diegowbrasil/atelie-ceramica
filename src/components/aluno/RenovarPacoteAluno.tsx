"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { ModalRenovarPacote } from "@/components/ModalRenovarPacote";
import { ModalComprovante } from "@/components/aluno/ModalComprovante";
import { renovarMeuPacote } from "@/lib/actions/renovacao";

// Botão da tela Minha Turma quando o pacote acabou. Depois de renovar já
// abre o Pix, pra pessoa pagar na sequência sem procurar onde. Fica sempre
// montado (só o botão depende de `podeRenovar`): a renovação atualiza a
// página na hora, o botão some, e o modal do Pix precisa continuar aberto.
export function RenovarPacoteAluno({ podeRenovar }: { podeRenovar: boolean }) {
  const router = useRouter();
  const [escolhendo, setEscolhendo] = useState(false);
  const [cobranca, setCobranca] = useState<{ id: string; descricao: string; valor: number } | null>(null);

  return (
    <>
      {podeRenovar && (
      <button
        onClick={() => setEscolhendo(true)}
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-accent py-2.5 text-sm font-medium text-white shadow-soft hover:bg-accent-hover"
      >
        <RefreshCw size={15} /> Renovar pacote
      </button>
      )}

      {escolhendo && (
        <ModalRenovarPacote
          titulo="Renovar pacote"
          explicacao="Seu pacote acabou. O novo começa a contar na próxima aula, e o pagamento fica pendente até o ateliê confirmar."
          onClose={() => setEscolhendo(false)}
          onConfirmar={async (tipo) => {
            const r = await renovarMeuPacote(tipo);
            if (r.ok) {
              setEscolhendo(false);
              setCobranca(r.pagamento);
            }
            return r;
          }}
        />
      )}

      {cobranca && (
        <ModalComprovante
          pagamento={cobranca}
          onClose={() => {
            setCobranca(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
