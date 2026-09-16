import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

// TODO(conectar dados reais): buscar profile do usuário logado (nome, foto)
// e contagem de solicitações pendentes via createClient() (server).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-paper dark:bg-paper-dark">
      <Sidebar userName="Hanna" badges={{ solicitacoes: 3 }} />
      <main className="flex-1">{children}</main>
      <MobileNav />
    </div>
  );
}
