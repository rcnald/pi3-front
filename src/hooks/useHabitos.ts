import { useState, useEffect } from 'react';
import { api } from '../services/api';

export type Unit = {
  id: number;
  name: string;
  simbolo: string;
};

export type Habit = {
  id: number;
  name: string;
  unit: Unit;
};

type UseHabitosReturn = {
  habitos: Habit[];
  loading: boolean;
  error: string | null;
};

export const useHabitos = (): UseHabitosReturn => {
  const [habitos, setHabitos] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHabitos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<Habit[]>('/habits');
        setHabitos(response.data);
      } catch (err: unknown) {
        const axiosErr = err as { message?: string; response?: { status: number } };
        if (axiosErr?.response?.status === 401) {
          setError('Não autorizado. Por favor, faça login novamente.');
        } else {
          if (import.meta.env.DEV) {
            setError(`Erro ao buscar hábitos: ${axiosErr?.message ?? 'Erro desconhecido'}`);
          } else {
            setError('Erro ao carregar hábitos.');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHabitos();
  }, []);

  return { habitos, loading, error };
};
