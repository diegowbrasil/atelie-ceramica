import { listarAdmins } from "@/lib/actions/convite";
import { getLembretesPainel } from "@/lib/actions/lembretes";
import { ConfiguracoesClient } from "@/components/configuracoes/ConfiguracoesClient";

// Server Component — busca os admins reais e o estado dos lembretes por
// WhatsApp. Interatividade mora em ConfiguracoesClient/LembretesCard.
// Primeira tela real aqui (era EmBreve) — pedidos do Diego: contas de
// admin (2026-09-30) e lembretes automáticos (2026-10-02), os dois sem
// precisar pedir pra mim toda vez.
export default async function ConfiguracoesPage() {
  const [admins, lembretes] = await Promise.all([listarAdmins(), getLembretesPainel()]);
  return <ConfiguracoesClient adminsIniciais={admins} lembretes={lembretes} />;
}
