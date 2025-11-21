export interface HistoryMetaInfo {
  nome: string;
  unidade: string;
  metaDiaria: number;
}

export interface HistoryMetrics {
  mediaSemanal: number;
  melhorRegistro: number;
}

export interface HistoryGraphData {
  data: string;
  total: number;
}

export interface HistoryResponse {
  metaInfo: HistoryMetaInfo;
  metricas: HistoryMetrics;
  grafico: HistoryGraphData[];
}

export interface HistoryParams {
  userId: number;
  habitId: number;
  dataInicio: string;
  dataFim: string;
}
