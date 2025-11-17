import { useState, useEffect } from 'react';
import { api } from '../services/api';

type UseHabitsReturn = {
  habits: Habit[];
  loading: boolean;
  error: string | null;
};

export const useHabits = (): UseHabitsReturn => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHabits = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<Habit[]>('/habits');
        setHabits(response.data);
      } catch (err: unknown) {
        const axiosErr = err as {
          message?: string;
          response?: { status: number };
        };
        if (axiosErr?.response?.status === 401) {
          setError('Not authorized. Please login again.');
        } else {
          if (import.meta.env.DEV) {
            setError(
              `Error fetching habits: ${axiosErr?.message ?? 'Unknown error'}`
            );
          } else {
            setError('Error loading habits.');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHabits();
  }, []);

  return { habits, loading, error };
};
