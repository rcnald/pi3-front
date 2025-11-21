import { useState, useCallback } from 'react';
import { api } from '../services/api';

export interface RecordData {
  id: number;
  value: number;
  date: string;
  userHabit?: {
    id: number;

    measurementUnit?: {
      id: number;
      symbol: string;
      name?: string;
    };

    habit?: {
      id: number;
      name: string;
      measurementUnit?: {
        id: number;
        symbol: string;
        name?: string;
      };
    };
  };
}

export function useRecords() {
  const [records, setRecords] = useState<RecordData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async (userId: number, date?: string) => {
    setLoading(true);
    try {
      const url = date
        ? `/records/user/${userId}?date=${date}`
        : `/records/user/${userId}`;
      const response = await api.get(url);
      setRecords(response.data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar registros.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { records, loading, error, fetchRecords };
}
