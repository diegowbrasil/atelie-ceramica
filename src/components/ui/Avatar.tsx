import { cn } from "@/lib/utils";
import Image from "next/image";

export function Avatar({
  nome,
  fotoUrl,
  size = 40,
  className,
  anelCor,
}: {
  nome: string;
  fotoUrl?: string | null;
  size?: number;
  className?: string;
  /** Contorno colorido opcional (ex: cor da turma de origem de quem está
   *  em vaga provisória) — mesmo mecanismo do demo, ver AlunoDetalhe. */
  anelCor?: string;
}) {
  const iniciais = nome
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const anel = anelCor ? { boxShadow: `0 0 0 2.5px ${anelCor}` } : undefined;

  if (fotoUrl) {
    return (
      <Image
        src={fotoUrl}
        alt={nome}
        width={size}
        height={size}
        style={anel}
        className={cn("rounded-full object-cover", className)}
      />
    );
  }

  // Avatar fica neutro (--ink/--cream) de propósito — identidade de pessoa,
  // não ação; nunca usar --accent aqui (CLAUDE.md §6.1).
  return (
    <div
      style={{ width: size, height: size, fontSize: Math.max(9, size * 0.36), ...anel }}
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink font-medium leading-none text-cream",
        className
      )}
    >
      {iniciais}
    </div>
  );
}
