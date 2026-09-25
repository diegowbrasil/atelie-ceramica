import { redirect } from "next/navigation";
import { getOficinaReal } from "@/lib/actions/oficinas";
import { OficinaDetalheClient } from "@/components/oficinas/OficinaDetalheClient";

// Server Component — busca a oficina real (com participantes). Referência
// de comportamento: demo/AtelieDemo.jsx (OficinaDetalhe).
export default async function OficinaDetalhePage({ params }: { params: Promise<{ oficinaId: string }> }) {
  const { oficinaId } = await params;
  const oficina = await getOficinaReal(oficinaId);
  if (!oficina) redirect("/oficinas");
  return <OficinaDetalheClient key={oficina.id} oficinaInicial={oficina} />;
}
