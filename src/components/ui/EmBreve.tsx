import { Clock } from "lucide-react";

// Placeholder pra telas que só existem no schema/backlog ainda (Relatórios,
// Configurações) — mesma ideia do EmBreve do demo, evita link morto (404)
// enquanto a tela de verdade não é construída.
export function EmBreve({ titulo }: { titulo: string }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-8 md:pb-10">
      <h1 className="mb-8 text-center font-display text-2xl uppercase tracking-wide text-ink">{titulo}</h1>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-white px-6 py-16 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-cream-soft text-ink-soft">
          <Clock size={22} />
        </div>
        <p className="text-sm font-medium text-ink">Em breve</p>
        <p className="mt-1 max-w-xs text-sm text-ink-soft">Essa tela ainda não foi construída.</p>
      </div>
    </div>
  );
}
