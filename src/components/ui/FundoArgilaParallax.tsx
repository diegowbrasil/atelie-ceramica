"use client";

import { useEffect, useRef } from "react";
import { FUNDOS_ARGILA } from "@/lib/fundosArgila";

// Referência de comportamento: demo/AtelieDemo.jsx, FundoArgilaParallax
// (perto de ManchasFundo). `position:fixed` (não `absolute`) é proposital —
// achado do Diego (2026-09-17): com `absolute` o container já rolava junto
// com a página, e o JS só compensava por cima deslocando
// backgroundPositionY em sentido contrário; em scroll rápido as duas
// animações saíam de sincronia ("dava uma puladinha"). Com `fixed`, o
// container não tem movimento nativo nenhum — backgroundPositionY vira a
// ÚNICA fonte de movimento (scrollY * VELOCIDADE, fundo se move mais devagar
// que o conteúdo). `fixed inset-0` também ignora padding/offset de qualquer
// ancestral (sidebar do desktop inclusive), preenchendo o viewport inteiro
// sempre — mas isso faz o fundo competir por empilhamento com <aside>/nav,
// que por isso precisam de z-index explícito por cima (ver Sidebar.tsx).
export function FundoArgilaParallax({ cor }: { cor: string | null }) {
  // Nem toda cor de identidade tem foto ainda (falta "café") — lookup
  // tolerante, mesmo efeito do `cor && FUNDOS_ARGILA[cor]` do demo.
  const imgFundo = cor ? (FUNDOS_ARGILA as Record<string, string | undefined>)[cor] ?? null : null;
  const fundoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgFundo) return;
    const VELOCIDADE = 0.35;
    let raf: number | null = null;
    function aplicar() {
      raf = null;
      if (fundoRef.current) fundoRef.current.style.backgroundPositionY = `${window.scrollY * VELOCIDADE}px`;
    }
    function onScroll() {
      if (raf === null) raf = requestAnimationFrame(aplicar);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    aplicar();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [imgFundo]);

  if (!imgFundo) return null;

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <div
        ref={fundoRef}
        className="absolute inset-0"
        style={{ backgroundImage: `url(${imgFundo})`, backgroundSize: "100% auto", backgroundRepeat: "repeat-y", backgroundPosition: "center top" }}
      />
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-cream via-cream/75 to-transparent" />
    </div>
  );
}
