// Dado compartilhado entre /oficinas (lista) e /oficinas/[oficinaId] (detalhe).
// TODO(conectar dados reais): substituir por `supabase.from("oficinas").select("*, oficina_participantes(*)")`.
// Enquanto isso, cada página tem seu próprio useState local (mesmo padrão
// já usado em Turmas/Forno) — editar um participante no detalhe não
// reflete na lista até recarregar; limitação temporária da era pré-Supabase,
// não um bug (ver PROGRESS.md).

export type CorIdentidade = "sienna" | "ardosia" | "musgo" | "cafe";
export const CORES_ORDEM: CorIdentidade[] = ["sienna", "ardosia", "musgo", "cafe"];
export function corOficina(id: string): CorIdentidade {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return CORES_ORDEM[Math.abs(h) % CORES_ORDEM.length];
}

export interface Participante {
  numero: number;
  nome: string | null;
  tipo?: "individual" | "dupla";
  duplaCom?: string | null;
  pagamento?: "pendente" | "pago";
}
export interface Oficina {
  id: string;
  nome: string;
  status: "Agendada";
  statusPecas: "secagem" | "biscoitadas" | "esmaltadas" | "prontas";
  data: string;
  hora: string;
  valor: number | null;
  vagas: number;
  descricao: string;
  receita: { item: string; peso: string }[];
  observacoes: string;
  participantes: Participante[];
}

const DESCRICAO_KIT_CAFE = "Nesta oficina você irá criar seu próprio kit café da manhã com peças feitas à mão. Vamos trabalhar com formas simples e funcionais, perfeitas para o dia a dia.";
const RECEITA_KIT_CAFE = [
  { item: "Cumbuca", peso: "650 g de argila" },
  { item: "Pratinho", peso: "650 g de argila" },
  { item: "Caneca", peso: "550 g de argila" },
];
export function vagasVazias(n: number): Participante[] {
  return Array.from({ length: n }, (_, i) => ({ numero: i + 1, nome: null }));
}

export function oficinasIniciais(): Oficina[] {
  return [
    { id: "o1", nome: "Kit Café da Manhã", status: "Agendada", statusPecas: "secagem", data: "10 de Outubro de 2026", hora: "16:00 às 19:00", valor: null, vagas: 12, descricao: DESCRICAO_KIT_CAFE, receita: RECEITA_KIT_CAFE, observacoes: "Levar avental, toalha e muita criatividade!", participantes: vagasVazias(12) },
    { id: "o2", nome: "Kit Café da Manhã", status: "Agendada", statusPecas: "secagem", data: "24 de Outubro de 2026", hora: "16:00 às 19:00", valor: null, vagas: 12, descricao: DESCRICAO_KIT_CAFE, receita: RECEITA_KIT_CAFE, observacoes: "Levar avental, toalha e muita criatividade!", participantes: vagasVazias(12) },
    { id: "o3", nome: "Kit Café da Manhã", status: "Agendada", statusPecas: "secagem", data: "14 de Novembro de 2026", hora: "16:00 às 19:00", valor: null, vagas: 12, descricao: DESCRICAO_KIT_CAFE, receita: RECEITA_KIT_CAFE, observacoes: "Levar avental, toalha e muita criatividade!", participantes: vagasVazias(12) },
    { id: "o4", nome: "Enfeites de Natal", status: "Agendada", statusPecas: "secagem", data: "28 de Novembro de 2026", hora: "16:00 às 19:00", valor: null, vagas: 12, descricao: "Essa oficina acontece em novembro para que as peças possam passar por todo o processo de secagem, queima e esmaltação e fiquem prontas a tempo do Natal.", receita: [], observacoes: "", participantes: vagasVazias(12) },
    { id: "o5", nome: "Kit Café da Manhã", status: "Agendada", statusPecas: "secagem", data: "12 de Dezembro de 2026", hora: "16:00 às 19:00", valor: null, vagas: 12, descricao: DESCRICAO_KIT_CAFE, receita: RECEITA_KIT_CAFE, observacoes: "Levar avental, toalha e muita criatividade!", participantes: vagasVazias(12) },
    { id: "o6", nome: "Peças Marmorizadas", status: "Agendada", statusPecas: "secagem", data: "19 de Dezembro de 2026", hora: "16:00 às 19:00", valor: null, vagas: 12, descricao: "", receita: [], observacoes: "Última oficina do ateliê em 2026.", participantes: vagasVazias(12) },
  ];
}
