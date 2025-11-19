import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { MeasurementUnit } from '../models/measurementUnit';

type UseMeasurementUnitsReturn = {
  units: MeasurementUnit[];
  loading: boolean;
  error: string | null;
};

export const useMeasurementUnits = (): UseMeasurementUnitsReturn => {
  const [units, setUnits] = useState<MeasurementUnit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnits = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<MeasurementUnit[]>('/measurement-units');
        setUnits(res.data ?? res);
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
              `Error fetching measurement units: ${
                axiosErr?.message ?? 'Unknown error'
              }`
            );
          } else {
            setError('Error loading measurement units.');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, []);

  return { units, loading, error };
};
