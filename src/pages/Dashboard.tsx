import React, { useEffect, useState } from 'react';
import MainLayout from '../components/MainLayout';
import {
  useHabits,
  useMeasurementUnits,
  useCreateRecord,
  useAuth,
  useRecords, 
} from '../hooks';
import { MeasurementUnitsEnum } from '../models/measurementUnit';
import type { MeasurementUnit } from '../models/measurementUnit';

function Dashboard() {
  const { habits, loading, error } = useHabits();
  const {
    units,
    loading: unitsLoading,
    error: unitsError,
  } = useMeasurementUnits();
  const {
    createRecord,
    loading: creating,
    error: createError,
    success,
  } = useCreateRecord();
  
  const { records, loading: recordsLoading, fetchRecords } = useRecords();
  
  const { getUser } = useAuth();

  const [selectedHabitId, setSelectedHabitId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<string>('');
  const [selectedUnitId, setSelectedUnitId] = useState<number | ''>('');
  const [date, setDate] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const selectedHabit = habits.find((h) => h.id === selectedHabitId);

  function formatDateToOffset(dateStr: string): string {
    const parts = dateStr.split('-').map((p) => Number(p));
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n) || n <= 0)) {
      return dateStr;
    }
    const tzMinutes = new Date().getTimezoneOffset();
    const offsetTotal = -tzMinutes;
    const sign = offsetTotal >= 0 ? '+' : '-';
    const abs = Math.abs(offsetTotal);
    const hh = String(Math.floor(abs / 60)).padStart(2, '0');
    const mm = String(abs % 60).padStart(2, '0');
    return `${dateStr}T00:00:00${sign}${hh}:${mm}`;
  }

  function getBaseUnitIdFromHabit(habit: unknown): number | undefined {
    if (typeof habit !== 'object' || habit === null) return undefined;
    const obj = habit as Record<string, unknown>;
    const unitVal = obj['unit'];
    if (typeof unitVal === 'object' && unitVal !== null) {
      const unitObj = unitVal as Record<string, unknown>;
      const maybeId = unitObj['id'];
      if (typeof maybeId === 'number') return maybeId;
    }
    const idMeasurementUnit = obj['idMeasurementUnit'];
    if (typeof idMeasurementUnit === 'number') return idMeasurementUnit;
    const measurementUnitId = obj['measurementUnitId'];
    if (typeof measurementUnitId === 'number') return measurementUnitId;
    return undefined;
  }

  const baseUnitId = selectedHabit
    ? getBaseUnitIdFromHabit(selectedHabit)
    : undefined;

  const canSubmit = Boolean(
    selectedHabitId &&
      selectedUnitId &&
      quantity &&
      Number(quantity) > 0 &&
      date &&
      baseUnitId
  );

  function filterUnitsForHabit(
    unitsList: MeasurementUnit[],
    baseId?: number
  ): MeasurementUnit[] {
    if (!baseId) return unitsList;
    if (
      baseId === MeasurementUnitsEnum.Ml ||
      baseId === MeasurementUnitsEnum.L
    ) {
      return unitsList.filter(
        (u) =>
          u.id === MeasurementUnitsEnum.Ml || u.id === MeasurementUnitsEnum.L
      );
    }
    if (
      baseId === MeasurementUnitsEnum.Min ||
      baseId === MeasurementUnitsEnum.H
    ) {
      return unitsList.filter(
        (u) =>
          u.id === MeasurementUnitsEnum.Min || u.id === MeasurementUnitsEnum.H
      );
    }
    return unitsList;
  }

  const allowedUnits = filterUnitsForHabit(units, baseUnitId);

  useEffect(() => {
    if (!selectedHabitId) {
      setSelectedUnitId('');
      return;
    }
    if (unitsLoading) return;

    const currentAllowed = filterUnitsForHabit(units, baseUnitId);
    if (!currentAllowed.length) return;

    if (
      typeof selectedUnitId === 'number' &&
      currentAllowed.some((u) => u.id === selectedUnitId)
    ) {
      return;
    }

    if (baseUnitId && currentAllowed.some((u) => u.id === baseUnitId)) {
      setSelectedUnitId(baseUnitId);
    } else {
      setSelectedUnitId(currentAllowed[0].id);
    }
  }, [selectedHabitId, baseUnitId, units, unitsLoading, selectedUnitId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = getUser();
    setFormError(null);
    if (!user?.id) {
      setFormError('Você precisa estar logado.');
      return;
    }
    if (!canSubmit) {
      setFormError('Preencha todos os campos corretamente.');
      return;
    }
    const numericValue = Number(quantity);
    if (Number.isNaN(numericValue) || numericValue <= 0) return;
    const formattedDate = formatDateToOffset(date);
    
    await createRecord({
      userId: user.id,
      habitId: Number(selectedHabitId),
      inputValue: numericValue,
      inputUnitId: Number(selectedUnitId),
      baseUnitId: baseUnitId!,
      date: formattedDate,
    });

    
    
    // ATUALIZA A LISTA:
    await fetchRecords(); 

    setQuantity('');
    setDate('');
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '-';
    try {
        const d = new Date(dateString);
        return d.toLocaleDateString('pt-BR');
    } catch {
        return dateString;
    }
  };

  return (
    <MainLayout activePage="goals">
      {/* Seção 1: Registrar Novo Objetivo (MANTIDA IGUAL) */}
      <div className="card-theme p-8 mb-8 animate-fade-in-up card-header-accent">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Registrar Novo Objetivo
        </h2>

        <form className="space-y-5" onSubmit={onSubmit}>
          {/* ... (O CONTEÚDO DO FORMULÁRIO MANTÉM IGUAL AO SEU CÓDIGO ORIGINAL) ... */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objetivo
            </label>
            {loading && (
              <p className="text-sm text-gray-500">Carregando hábitos...</p>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!loading && !error && (
              <select
                className="input-theme"
                value={selectedHabitId}
                onChange={(e) =>
                  setSelectedHabitId(
                    e.target.value ? Number(e.target.value) : ''
                  )
                }
              >
                <option value="">Selecione um hábito</option>
                {habits.map((habit) => (
                  <option key={habit.id} value={habit.id}>
                    {habit.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade
              </label>
              <input
                type="number"
                placeholder="1000"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="input-theme"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidade
              </label>
              {unitsLoading && (
                <p className="text-sm text-gray-500">Carregando unidades...</p>
              )}
              {unitsError && (
                <p className="text-sm text-red-600">{unitsError}</p>
              )}
              {!unitsLoading && !unitsError && (
                <select
                  className="input-theme"
                  value={selectedUnitId}
                  onChange={(e) =>
                    setSelectedUnitId(
                      e.target.value ? Number(e.target.value) : ''
                    )
                  }
                  disabled={!selectedHabitId}
                >
                  <option value="">Selecione a unidade</option>
                  {allowedUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.symbol})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-theme"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3 disabled:opacity-60"
            disabled={creating || !canSubmit}
          >
            {creating ? 'Enviando...' : 'Registrar Objetivo'}
          </button>
          {formError && (
            <p className="text-sm text-red-600 mt-2">{formError}</p>
          )}
          {createError && (
            <p className="text-sm text-red-600 mt-2">{createError}</p>
          )}
          {success && !createError && (
            <p className="text-sm text-green-600 mt-2">
              Registro criado com sucesso!
            </p>
          )}
        </form>
      </div>

      {/* Seção 2: Registros Diários (ATUALIZADA PARA USAR DADOS REAIS) */}
      <div className="card-theme p-8 animate-fade-in-up card-header-accent">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Registros Diários
        </h2>

        <div className="overflow-x-auto">
          <table className="table-theme">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Objetivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recordsLoading ? (
                  <tr><td colSpan={5} className="p-4 text-center">Carregando registros...</td></tr>
              ) : records.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-center text-gray-500">Nenhum registro encontrado.</td></tr>
              ) : (
                  records.map((reg) => (
                    <tr key={reg.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {/* Tenta acessar via objeto aninhado, ou exibe genérico se o backend não enviar */}
                        {reg.userHabit?.habit?.name || "Hábito #" + reg.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {reg.value}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                         {/* Tenta acessar a unidade aninhada */}
                        {reg.userHabit?.habit?.measurementUnit?.symbol || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDateDisplay(reg.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button className="text-cyan-600 hover:text-cyan-800">
                          ✏️
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;