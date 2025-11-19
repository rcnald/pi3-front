import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

// Define o formato dos dados que vêm do backend
export interface RecordData {
  id: number;
  value: number;
  date: string;
  userHabit?: {
    id: number; // Adicionado para editar o vínculo
    habit?: {
      id: number; // Adicionado para selecionar o hábito no select
      name: string;
      measurementUnit?: {
        id: number; // <--- AQUI ESTÁ A CORREÇÃO DO ERRO
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