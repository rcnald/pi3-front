import { useState } from 'react';
import { api } from '../services/api';
import { MeasurementUnitsEnum } from '../models/measurementUnit';

// Reaproveitando a lógica de normalização
function normalizeToBase(
  value: number,
  inputUnitId: number,
  baseUnitId: number
): number {
  // Lógica de conversão (ml/L e min/h)
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

interface UpdateParams {
  id: number;
  userHabitId: number;
  inputValue: number;
  inputUnitId: number;
  baseUnitId: number;
  date: string;
}

export function useRecordActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteRecord = async (id: number) => {
    setLoading(true);
    try {
      await api.delete(`/records/${id}`);
    } catch (err) {
      console.error(err);
      throw new Error('Falha ao excluir registro.');
    } finally {
      setLoading(false);
    }
  };

  const updateRecord = async ({
    id,
    userHabitId,
    inputValue,
    inputUnitId,
    baseUnitId,
    date,
  }: UpdateParams) => {
    setLoading(true);
    try {
      const normalizedValue = normalizeToBase(inputValue, inputUnitId, baseUnitId);
      
      // O Backend espera um objeto Record completo no PUT
      await api.put(`/records/${id}`, {
        id,
        userHabitId, // Importante manter o vínculo
        value: normalizedValue,
        date: new Date(date), // O Java espera o formato ISO ou similar
      });
    } catch (err) {
      console.error(err);
      throw new Error('Falha ao atualizar registro.');
    } finally {
      setLoading(false);
    }
  };

  return { deleteRecord, updateRecord, loading, error };
}