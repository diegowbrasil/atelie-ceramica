// Dado compartilhado entre /turmas/[turmaId] e /pagamentos (pendentes
// derivam do roster real de vagas, mesma fonte, ver `pagamentosIniciais`).
// TODO(conectar dados reais): substituir por
// supabase.from("matriculas").select("*, profiles(*), pacotes(*)").eq("turma_id", turmaId).
// Roster real das 4 turmas fixas (dado real do Diego, 2026-09-17) — mesmos
// nomes/números do demo, não inventado.

export type StatusPacote = "confirmado" | "pendente" | "ultima";
export type StatusAula = "confirmado" | "ausente";

export interface Vaga {
  numero: number;
  nome: string | null;
  aula: number;
  total: number;
  status: StatusPacote;
  statusAula: StatusAula;
  presente: boolean;
}

export function vagasPorTurmaIniciais(): Record<string, Vaga[]> {
  return {
    "ter-1830": [
      { numero: 1, nome: "Isadora", aula: 3, total: 4, status: "confirmado", statusAula: "ausente", presente: false },
      { numero: 2, nome: "Cristiane", aula: 1, total: 4, status: "confirmado", statusAula: "confirmado", presente: false },
      { numero: 3, nome: "Maria Clara", aula: 3, total: 4, status: "confirmado", statusAula: "confirmado", presente: false },
      { numero: 4, nome: "Cintya", aula: 2, total: 4, status: "pendente", statusAula: "confirmado", presente: false },
      { numero: 5, nome: "Moises", aula: 1, total: 4, status: "pendente", statusAula: "confirmado", presente: false },
      { numero: 6, nome: "Fabiola", aula: 4, total: 4, status: "ultima", statusAula: "confirmado", presente: false },
      { numero: 7, nome: "Maria Helena", aula: 2, total: 4, status: "confirmado", statusAula: "ausente", presente: false },
      { numero: 8, nome: "Mayara", aula: 4, total: 4, status: "ultima", statusAula: "confirmado", presente: false },
      { numero: 9, nome: "Karol", aula: 4, total: 4, status: "ultima", statusAula: "ausente", presente: false },
      { numero: 10, nome: "Ananda", aula: 4, total: 4, status: "ultima", statusAula: "ausente", presente: false },
      { numero: 11, nome: "Marina", aula: 2, total: 4, status: "confirmado", statusAula: "ausente", presente: false },
      { numero: 12, nome: "Dani", aula: 3, total: 4, status: "confirmado", statusAula: "confirmado", presente: false },
      { numero: 13, nome: "Vivian", aula: 1, total: 4, status: "pendente", statusAula: "confirmado", presente: false },
      { numero: 14, nome: "Cris", aula: 3, total: 4, status: "pendente", statusAula: "confirmado", presente: false },
    ],
    "qua-1630": [
      { numero: 1, nome: "Ju Pita", aula: 4, total: 4, status: "ultima", statusAula: "confirmado", presente: false },
      { numero: 2, nome: "Natalia", aula: 2, total: 4, status: "confirmado", statusAula: "ausente", presente: false },
      { numero: 3, nome: "Paula", aula: 3, total: 4, status: "confirmado", statusAula: "ausente", presente: false },
      { numero: 4, nome: "Bianca", aula: 4, total: 4, status: "ultima", statusAula: "confirmado", presente: false },
      { numero: 5, nome: "Amanda", aula: 4, total: 4, status: "pendente", statusAula: "confirmado", presente: false },
      { numero: 6, nome: "Silvia", aula: 1, total: 4, status: "pendente", statusAula: "confirmado", presente: false },
      { numero: 7, nome: "Ana Carolina", aula: 4, total: 4, status: "ultima", statusAula: "confirmado", presente: false },
      { numero: 8, nome: "Fer", aula: 3, total: 4, status: "confirmado", statusAula: "confirmado", presente: false },
      { numero: 9, nome: "Santina", aula: 4, total: 4, status: "ultima", statusAula: "confirmado", presente: false },
      { numero: 10, nome: "Camila", aula: 4, total: 4, status: "pendente", statusAula: "confirmado", presente: false },
      { numero: 11, nome: "Marina", aula: 2, total: 4, status: "confirmado", statusAula: "confirmado", presente: false },
      { numero: 12, nome: "Elisabeth", aula: 4, total: 4, status: "ultima", statusAula: "ausente", presente: false },
    ],
    "qui-1430": [
      { numero: 1, nome: "Bia", aula: 1, total: 4, status: "confirmado", statusAula: "confirmado", presente: false },
      { numero: 2, nome: "Isa", aula: 3, total: 4, status: "pendente", statusAula: "ausente", presente: false },
      { numero: 3, nome: "Roxanne", aula: 3, total: 4, status: "confirmado", statusAula: "confirmado", presente: false },
      { numero: 4, nome: "Piti", aula: 3, total: 4, status: "confirmado", statusAula: "confirmado", presente: false },
      { numero: 5, nome: "Celina", aula: 1, total: 4, status: "confirmado", statusAula: "confirmado", presente: false },
      { numero: 6, nome: "Helo", aula: 2, total: 4, status: "confirmado", statusAula: "confirmado", presente: false },
      { numero: 7, nome: "Isabele", aula: 1, total: 4, status: "pendente", statusAula: "ausente", presente: false },
      { numero: 8, nome: "Luciane", aula: 1, total: 4, status: "pendente", statusAula: "ausente", presente: false },
      { numero: 9, nome: "Vitoria", aula: 2, total: 4, status: "confirmado", statusAula: "confirmado", presente: false },
      { numero: 10, nome: "Elisabeth", aula: 4, total: 4, status: "ultima", statusAula: "confirmado", presente: false },
      { numero: 11, nome: "Ana Lara", aula: 1, total: 4, status: "confirmado", statusAula: "confirmado", presente: false },
      { numero: 12, nome: null, aula: 0, total: 4, status: "confirmado", statusAula: "confirmado", presente: false },
    ],
    "qui-1830": [
      { numero: 1, nome: "Lu", aula: 4, total: 4, status: "ultima", statusAula: "confirmado", presente: false },
      { numero: 2, nome: "Nayane", aula: 2, total: 4, status: "confirmado", statusAula: "confirmado", presente: false },
      { numero: 3, nome: "Yasmin", aula: 1, total: 4, status: "pendente", statusAula: "confirmado", presente: false },
      { numero: 4, nome: "Vivi", aula: 4, total: 4, status: "ultima", statusAula: "confirmado", presente: false },
      { numero: 5, nome: "Barbara", aula: 3, total: 4, status: "pendente", statusAula: "confirmado", presente: false },
      { numero: 6, nome: "Tais", aula: 2, total: 4, status: "pendente", statusAula: "confirmado", presente: false },
      { numero: 7, nome: "Camila", aula: 2, total: 4, status: "confirmado", statusAula: "confirmado", presente: false },
      { numero: 8, nome: "Ju Oba", aula: 1, total: 1, status: "confirmado", statusAula: "confirmado", presente: false },
      { numero: 9, nome: "Amanda R", aula: 3, total: 4, status: "confirmado", statusAula: "confirmado", presente: false },
      { numero: 10, nome: "Paola", aula: 1, total: 4, status: "pendente", statusAula: "confirmado", presente: false },
      { numero: 11, nome: "Olga", aula: 1, total: 1, status: "confirmado", statusAula: "confirmado", presente: false },
      { numero: 12, nome: null, aula: 0, total: 4, status: "confirmado", statusAula: "confirmado", presente: false },
    ],
  };
}

export interface Pagamento {
  id: string;
  nome: string;
  telefone: string | null;
  tipo: string;
  valor: number | null;
  data: string;
  status: "pendente" | "pago";
  motivo: string;
}

const ORDEM_DIAS = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
function datasDaSemanaAtual(referencia = new Date()) {
  const hoje = new Date(referencia);
  hoje.setHours(0, 0, 0, 0);
  const offsetSegunda = hoje.getDay() === 0 ? -6 : 1 - hoje.getDay();
  const segunda = new Date(hoje);
  segunda.setDate(hoje.getDate() + offsetSegunda);
  const mapa: Record<string, Date> = {};
  ORDEM_DIAS.forEach((id, i) => {
    const d = new Date(segunda);
    d.setDate(segunda.getDate() + i);
    mapa[id] = d;
  });
  return mapa;
}
function formatarDiaMes(data: Date) {
  return `${String(data.getDate()).padStart(2, "0")}/${String(data.getMonth() + 1).padStart(2, "0")}`;
}

/** Deriva os pendentes reais a partir do roster — mesma fonte que Turmas,
 *  nunca uma lista digitada à mão em paralelo (evita divergir com o tempo). */
export function pagamentosIniciais(vagasPorTurma: Record<string, Vaga[]>): Pagamento[] {
  const datas = datasDaSemanaAtual();
  const pendentes: Pagamento[] = [];
  for (const [turmaId, vagas] of Object.entries(vagasPorTurma)) {
    const diaId = turmaId.split("-")[0];
    const dataFmt = formatarDiaMes(datas[diaId]);
    for (const v of vagas) {
      if (v.nome && v.status === "pendente") {
        pendentes.push({
          id: `${turmaId}-${v.numero}`,
          nome: v.nome,
          telefone: null,
          tipo: `Pacote ${v.total} aulas`,
          valor: null,
          data: dataFmt,
          status: "pendente",
          motivo: `Aula ${v.aula} de ${v.total} sem pagamento`,
        });
      }
    }
  }
  return pendentes;
}
