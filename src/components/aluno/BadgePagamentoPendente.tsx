"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { ModalComprovante } from "@/components/aluno/ModalComprovante";

// Wrapper client só pra tornar o badge "Pagamento pendente" clicável —
// aluno/page.tsx é Server Component (busca os dados), não pode ter
// useState direto.
export function BadgePagamentoPendente({ pagamento }: { pagamento: { id: string; descricao: string | null; valor: number | null } }) {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <button onClick={() => setAberto(true)} className="inline-flex" aria-label="Ver valor pendente e pagar">
        <Badge tone="warning">Pagamento pendente</Badge>
      </button>
      {aberto && <ModalComprovante pagamento={pagamento} onClose={() => setAberto(false)} />}
    </>
  );
}
