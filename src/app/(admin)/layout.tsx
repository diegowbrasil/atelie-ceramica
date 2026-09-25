import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { MobileHeader } from "@/components/layout/MobileHeader";

// TODO(conectar dados reais): buscar profile do usuário logado (nome, foto)
// e contagem de solicitações pendentes via createClient() (server).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar userName="Hanna" badges={{ solicitacoes: 3 }} />
      <MobileHeader />
      {/* `pt-24 md:pt-0`: compensa a pílula flutuante `fixed` do cabeçalho
         mobile (MobileHeader) — ela não empurra o conteúdo, flutua por
         cima. Cada página já tem seu próprio `pt-6` pro desktop (onde o
         cabeçalho é `md:hidden`), então só soma padding extra no mobile. */}
      <main className="flex-1 pt-24 md:pt-0">{children}</main>
      <MobileNav />
    </div>
  );
}
