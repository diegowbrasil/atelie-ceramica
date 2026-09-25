import { getOficinasReal } from "@/lib/actions/oficinas";
import { OficinasListClient } from "@/components/oficinas/OficinasListClient";

// Server Component — busca todas as oficinas reais. Interatividade (criar
// oficina) mora em OficinasListClient. Referência de comportamento:
// demo/AtelieDemo.jsx (Oficinas).
export default async function OficinasPage() {
  const oficinas = await getOficinasReal();
  return <OficinasListClient oficinasIniciais={oficinas} />;
}
