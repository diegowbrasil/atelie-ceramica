import type { ReactNode } from "react";

export function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm animate-fade-up rounded-3xl border border-line bg-white p-5 shadow-xl">
        {children}
      </div>
    </div>
  );
}
