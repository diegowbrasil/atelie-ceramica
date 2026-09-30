import { listarAdmins } from "@/lib/actions/convite";
import { ConfiguracoesClient } from "@/components/configuracoes/ConfiguracoesClient";

// Server Component — busca os admins reais. Interatividade (convidar,
// remover) mora em ConfiguracoesClient. Primeira tela real aqui (era
// EmBreve) — pedido do Diego (2026-09-30): "preciso criar as contas do
// admin", sem precisar pedir pra mim toda vez (mesmo motivo do convite
// de aluno em Alunos).
export default async function ConfiguracoesPage() {
  const admins = await listarAdmins();
  return <ConfiguracoesClient adminsIniciais={admins} />;
}
