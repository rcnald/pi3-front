import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { HistoryResponse, HistoryParams } from '../types/history';

type UseHistoryReturn = {
  history: HistoryResponse | null;
  loading: boolean;
  error: string | null;
  refetch: (params: HistoryParams) => Promise<void>;
};

export const useHistory = (initialParams?: HistoryParams): UseHistoryReturn => {
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (params: HistoryParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<HistoryResponse>('/relatorios/historico', {
        params: {
          userId: params.userId,
          habitId: params.habitId,
          dataInicio: params.dataInicio,
          dataFim: params.dataFim,
        },
      });
      setHistory(response.data);
    } catch (err: unknown) {
      const axiosErr = err as {
        message?: string;
        response?: { status: number };
      };
      if (axiosErr?.response?.status === 401) {
        setError('Não autorizado. Faça login novamente.');
      } else if (axiosErr?.response?.status === 404) {
        setError('Você ainda não possui este hábito ativo. Configure-o nas suas metas.');
      } else {
        if (import.meta.env.DEV) {
          setError(
            `Erro ao buscar histórico: ${axiosErr?.message ?? 'Erro desconhecido'}`
          );
        } else {
          setError('Erro ao carregar histórico.');
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialParams) {
      fetchHistory(initialParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    history,
    loading,
    error,
    refetch: fetchHistory,
  };
};
