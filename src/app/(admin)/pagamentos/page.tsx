import { getPagamentosReal } from "@/lib/actions/pagamentos";
import { PagamentosClient } from "@/components/pagamentos/PagamentosClient";

// Server Component — busca todos os pagamentos reais (pendentes + pagos).
// Interatividade (busca, marcar como pago, cobrar no WhatsApp) mora em
// PagamentosClient. Referência de comportamento: demo/AtelieDemo.jsx (Pagamentos).
export default async function PagamentosPage() {
  const pagamentos = await getPagamentosReal();
  return <PagamentosClient pagamentosIniciais={pagamentos} />;
}
