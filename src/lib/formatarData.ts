// Formatação de data/hora de oficinas — extraído de src/lib/actions/oficinas.ts
// (2026-09-24) porque um arquivo "use server" só pode exportar Server
// Actions async; funções síncronas puras como estas quebram o build
// ("Server actions must be async functions") assim que algo FORA desse
// arquivo tenta importá-las — achado ao ligar alunoPortal.ts, que
// precisa das duas mas não é o dono conceitual delas.

export function formatarData(dataISO: string): string {
  const [ano, mes, dia] = dataISO.split("-");
  const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  return `${Number(dia)} de ${MESES[Number(mes) - 1]} de ${ano}`;
}

export function formatarHora(inicio: string, fim: string): string {
  return `${inicio.slice(0, 5)} às ${fim.slice(0, 5)}`;
}
