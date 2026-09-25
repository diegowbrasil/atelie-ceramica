import { getFornadasReal } from "@/lib/actions/forno";
import { FornoClient } from "@/components/forno/FornoClient";

// Server Component — busca o histórico (+ fornada ativa, se houver) dos 2
// fornos físicos. Interatividade (nova fornada, atualizar temperatura,
// observações, finalizar/cancelar, editar conteúdo) mora em FornoClient.
// Referência de comportamento: demo/AtelieDemo.jsx (PainelForno).
export default async function FornoPage() {
  const [forno1, forno2] = await Promise.all([getFornadasReal("forno1"), getFornadasReal("forno2")]);
  return <FornoClient fornadasIniciais={[...forno1, ...forno2]} />;
}
