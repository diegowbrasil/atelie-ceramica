import type { ReactNode } from "react";
import { createPortal } from "react-dom";

// Portal direto pro <body> (2026-09-29) — sem isso, um Modal aberto de
// dentro de um ancestral com `backdrop-blur`/`filter`/`transform` (ex: os
// cards com fundo mesclado) fica PRESO dentro da caixa desse ancestral em
// vez de cobrir a tela inteira — essas propriedades criam um novo
// "containing block" pra descendentes `position:fixed`, então o
// `inset-0` do modal passa a valer relativo a ELE, não ao viewport.
// `document` só existe no client — o guard cobre o primeiro render no
// servidor de um Client Component.
export function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm animate-fade-up rounded-3xl border border-line bg-white p-5 shadow-xl">
        {children}
      </div>
    </div>,
    document.body
  );
}
