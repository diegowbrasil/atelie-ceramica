import { cn } from "@/lib/utils";
import Image from "next/image";

export function Avatar({
  nome,
  fotoUrl,
  size = 40,
  className,
}: {
  nome: string;
  fotoUrl?: string | null;
  size?: number;
  className?: string;
}) {
  const iniciais = nome
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  if (fotoUrl) {
    return (
      <Image
        src={fotoUrl}
        alt={nome}
        width={size}
        height={size}
        className={cn("rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "flex items-center justify-center rounded-full bg-clay-100 text-clay-700 font-semibold",
        className
      )}
    >
      {iniciais}
    </div>
  );
}
