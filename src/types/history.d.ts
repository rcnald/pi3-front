export interface HistoryInfo {
  name: string;
  unit: string;
  dailyGoal: number;
}

export interface HistoryMetrics {
  weeklyAverage: number;
  bestRecord: number;
}

export interface HistoryChartData {
  date: string;
  total: number;
  dailyGoal: number;
}

export interface HistoryResponse {
  info: HistoryInfo;
  metrics: HistoryMetrics;
  chart: HistoryChartData[];
}

export interface HistoryParams {
  userId: number;
  habitId: number;
  dataInicio: string;
  dataFim: string;
}
