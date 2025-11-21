import { useState } from 'react';
import { api } from '../services/api';
import { MeasurementUnitsEnum } from '../models/measurementUnit';

type CreateRecordParams = {
  userId: number;
  habitId: number;
  inputValue: number;
  inputUnitId: number; 
  baseUnitId: number; 
  date: string; 
};

type UseCreateRecordReturn = {
  createRecord: (params: CreateRecordParams) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: boolean;
};

function normalizeToBase(
  value: number,
  inputUnitId: number,
  baseUnitId: number
): number {
  if (
    (baseUnitId === MeasurementUnitsEnum.Ml ||
      baseUnitId === MeasurementUnitsEnum.L) &&
    (inputUnitId === MeasurementUnitsEnum.Ml ||
      inputUnitId === MeasurementUnitsEnum.L)
  ) {
    return inputUnitId === MeasurementUnitsEnum.L ? value * 1000 : value;
  }

  if (
    (baseUnitId === MeasurementUnitsEnum.Min ||
      baseUnitId === MeasurementUnitsEnum.H) &&
    (inputUnitId === MeasurementUnitsEnum.Min ||
      inputUnitId === MeasurementUnitsEnum.H)
  ) {
    return inputUnitId === MeasurementUnitsEnum.H ? value * 60 : value;
  }

  return value;
}

export const useCreateRecord = (): UseCreateRecordReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createRecord = async ({
    userId,
    habitId,
    inputValue,
    inputUnitId,
    baseUnitId,
    date,
  }: CreateRecordParams) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const normalizedValue = normalizeToBase(
        inputValue,
        inputUnitId,
        baseUnitId
      );

      console.log('Creating record with normalized value:', normalizedValue, userId, habitId, date);

      await api.post('/records', {
        userId,
        habitId,
        value: normalizedValue,
        date: new Date(date),
      });
      setSuccess(true);
    } catch (err: unknown) {
      const axiosErr = err as { message?: string };
      if (import.meta.env.DEV) {
        setError(
          `Error creating record: ${axiosErr?.message ?? 'Unknown error'}`
        );
      } else {
        setError('Failed to create record.');
      }
    } finally {
      setLoading(false);
    }
  };

  return { createRecord, loading, error, success };
};
