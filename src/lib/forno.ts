import { addMinutes, differenceInSeconds } from "date-fns";

/**
 * Motor de previsão de queima.
 *
 * A queima tem 4 fases de tempo, calculadas a partir dos parâmetros
 * cadastrados. Sempre que uma temperatura real é informada
 * (`atualizarTemperaturaReal`), a fase de "aquecendo"/"resfriando" é
 * recalibrada: mantemos a velocidade cadastrada mas ajustamos o ponto de
 * partida (tempo x temperatura) para a leitura real mais recente, e todas
 * as previsões seguintes (máxima, patamar, resfriamento, hora segura)
 * são recalculadas a partir dali. Isso é o que a tela chama de
 * "recalcular toda a previsão".
 */

export type EtapaQueima =
  | "aquecendo"
  | "maxima_atingida"
  | "patamar"
  | "resfriando"
  | "aguardando_segura"
  | "liberado_abrir"
  | "finalizada";

export interface ParametrosQueima {
  temperaturaInicial: number; // °C
  temperaturaMaxima: number; // °C
  velocidadeAquecimento: number; // °C por minuto
  tempoPatamarMin: number; // minutos
  velocidadeResfriamento: number; // °C por minuto
  temperaturaSegura: number; // °C — segura para abrir o forno
  iniciadoEm: Date;
  finalizadoEm?: Date | null;
  /** Última leitura manual/sensor, usada para recalibrar a curva. */
  ultimaLeitura?: { temperatura: number; em: Date } | null;
}

export interface PrevisaoQueima {
  etapaAtual: EtapaQueima;
  temperaturaEstimada: number;
  percentualAteMaxima: number; // 0-100, só faz sentido durante 'aquecendo'
  grausRestantesAteMaxima: number;
  horarioMaxima: Date;
  horarioFimPatamar: Date;
  horarioSeguroParaAbrir: Date;
  tempoDecorridoSeg: number;
  tempoRestanteSeg: number; // até a próxima transição de etapa relevante
}

const MIN_MS = 60_000;

/**
 * Calcula, a partir dos parâmetros e do instante `agora`, a curva completa
 * da queima e em qual etapa ela se encontra.
 */
export function calcularPrevisao(
  params: ParametrosQueima,
  agora: Date = new Date()
): PrevisaoQueima {
  const {
    temperaturaInicial,
    temperaturaMaxima,
    velocidadeAquecimento,
    tempoPatamarMin,
    velocidadeResfriamento,
    temperaturaSegura,
    iniciadoEm,
    ultimaLeitura,
  } = params;

  // Ponto de calibração: leitura real mais recente, ou o início da queima.
  const origem = ultimaLeitura
    ? { t: ultimaLeitura.temperatura, em: ultimaLeitura.em }
    : { t: temperaturaInicial, em: iniciadoEm };

  const deltaAteMaxima = Math.max(temperaturaMaxima - origem.t, 0);
  const minutosAteMaxima = velocidadeAquecimento > 0 ? deltaAteMaxima / velocidadeAquecimento : 0;
  const horarioMaxima =
    origem.t >= temperaturaMaxima ? origem.em : addMinutes(origem.em, minutosAteMaxima);

  const horarioFimPatamar = addMinutes(horarioMaxima, tempoPatamarMin);

  const deltaResfriamento = Math.max(temperaturaMaxima - temperaturaSegura, 0);
  const minutosResfriamento =
    velocidadeResfriamento > 0 ? deltaResfriamento / velocidadeResfriamento : 0;
  const horarioSeguroParaAbrir = addMinutes(horarioFimPatamar, minutosResfriamento);

  // Etapa atual
  let etapaAtual: EtapaQueima;
  let temperaturaEstimada: number;

  if (params.finalizadoEm) {
    etapaAtual = "finalizada";
    temperaturaEstimada = temperaturaSegura;
  } else if (agora < horarioMaxima) {
    etapaAtual = "aquecendo";
    const minutosDecorridos = differenceInSeconds(agora, origem.em) / 60;
    temperaturaEstimada = Math.min(
      origem.t + minutosDecorridos * velocidadeAquecimento,
      temperaturaMaxima
    );
  } else if (agora < horarioFimPatamar) {
    etapaAtual = tempoPatamarMin > 0 ? "patamar" : "maxima_atingida";
    temperaturaEstimada = temperaturaMaxima;
  } else if (agora < horarioSeguroParaAbrir) {
    etapaAtual = "resfriando";
    const minutosResfriando = differenceInSeconds(agora, horarioFimPatamar) / 60;
    temperaturaEstimada = Math.max(
      temperaturaMaxima - minutosResfriando * velocidadeResfriamento,
      temperaturaSegura
    );
  } else {
    etapaAtual = "aguardando_segura"; // vira 'liberado_abrir' na UI quando admin confirma visualmente
    temperaturaEstimada = temperaturaSegura;
  }

  const grausRestantesAteMaxima = Math.max(temperaturaMaxima - temperaturaEstimada, 0);
  const percentualAteMaxima = Math.min(
    100,
    Math.max(0, ((temperaturaEstimada - temperaturaInicial) / (temperaturaMaxima - temperaturaInicial)) * 100)
  );

  const tempoDecorridoSeg = differenceInSeconds(agora, iniciadoEm);

  const proximoMarco =
    etapaAtual === "aquecendo"
      ? horarioMaxima
      : etapaAtual === "maxima_atingida" || etapaAtual === "patamar"
      ? horarioFimPatamar
      : etapaAtual === "resfriando"
      ? horarioSeguroParaAbrir
      : agora;

  const tempoRestanteSeg = Math.max(differenceInSeconds(proximoMarco, agora), 0);

  return {
    etapaAtual,
    temperaturaEstimada: Math.round(temperaturaEstimada),
    percentualAteMaxima: Math.round(percentualAteMaxima),
    grausRestantesAteMaxima: Math.round(grausRestantesAteMaxima),
    horarioMaxima,
    horarioFimPatamar,
    horarioSeguroParaAbrir,
    tempoDecorridoSeg,
    tempoRestanteSeg,
  };
}

export const ETAPA_LABEL: Record<EtapaQueima, string> = {
  aquecendo: "Aquecendo",
  maxima_atingida: "Máxima atingida",
  patamar: "Patamar",
  resfriando: "Resfriando",
  aguardando_segura: "Aguardando temperatura segura",
  liberado_abrir: "Liberado para abrir",
  finalizada: "Finalizada",
};

export function formatarDuracao(segundos: number): string {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = Math.floor(segundos % 60);
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}
