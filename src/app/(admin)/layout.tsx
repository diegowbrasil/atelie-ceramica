import { createClient } from "@/lib/supabase/server";
import { getSolicitacoesReal } from "@/lib/actions/solicitacoes";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { ConfigAtelieProvider } from "@/components/ConfigAtelieProvider";
import { getConfigAtelie } from "@/lib/configAtelie";

// Nome/foto do admin logado + contagem real de solicitações pendentes
// (2026-09-25) — até aqui o layout inteiro (visível em toda página
// admin) mostrava "Hanna" e "3" fixos, sobra do TODO original de antes
// da migração de dados reais, nunca fechado quando os outros 7
// domínios foram ligados.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const [{ data: { user } }, solicitacoesPendentes, config] = await Promise.all([supabase.auth.getUser(), getSolicitacoesReal(), getConfigAtelie()]);
  const { data: perfil } = user
    ? await supabase.from("profiles").select("nome, foto_url").eq("auth_user_id", user.id).maybeSingle()
    : { data: null };

  return (
    <ConfigAtelieProvider config={config}>
    <div className="flex min-h-screen bg-cream">
      <Sidebar userName={perfil?.nome ?? "Admin"} fotoUrl={perfil?.foto_url} badges={{ solicitacoes: solicitacoesPendentes.length }} />
      <MobileHeader />
      {/* `pt-24 md:pt-0`: compensa a pílula flutuante `fixed` do cabeçalho
         mobile (MobileHeader) — ela não empurra o conteúdo, flutua por
         cima. Cada página já tem seu próprio `pt-6` pro desktop (onde o
         cabeçalho é `md:hidden`), então só soma padding extra no mobile. */}
      <main className="flex-1 pt-24 md:pt-0">{children}</main>
      <MobileNav badgeSolicitacoes={solicitacoesPendentes.length} />
    </div>
    </ConfigAtelieProvider>
  );
}
