// Opções de renovação e configuração do ateliê (preços, chave Pix) —
// módulo puro, usado tanto no servidor quanto no navegador.

export type TipoRenovacao = "pacote" | "avulsa";

export const RENOVACAO: Record<TipoRenovacao, { aulas: number; descricao: string }> = {
  pacote: { aulas: 4, descricao: "Pacote 4 aulas" },
  avulsa: { aulas: 1, descricao: "Aula avulsa" },
};

export function ehTipoRenovacao(v: unknown): v is TipoRenovacao {
  return v === "pacote" || v === "avulsa";
}

export interface ConfigAtelie {
  /** false = a tabela atelie_config ainda não foi criada no banco. */
  instalado: boolean;
  /** null = ainda não cadastrada — a tela manda pedir pelo WhatsApp. */
  pixChave: string | null;
  precoPacote: number;
  precoAvulsa: number;
}

// Valores passados pelo Diego (2026-10-08) — só valem até a tabela existir.
export const CONFIG_PADRAO: ConfigAtelie = { instalado: false, pixChave: null, precoPacote: 460, precoAvulsa: 160 };

export function precoDe(tipo: TipoRenovacao, config: ConfigAtelie): number {
  return tipo === "pacote" ? config.precoPacote : config.precoAvulsa;
}

export function formatarReais(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: Number.isInteger(valor) ? 0 : 2 });
}
