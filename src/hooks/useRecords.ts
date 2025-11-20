import { useState, useEffect, useCallback } from 'react';
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

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/records');
      setRecords(response.data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar registros.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega automaticamente ao abrir a tela
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return { records, loading, error, fetchRecords };
}