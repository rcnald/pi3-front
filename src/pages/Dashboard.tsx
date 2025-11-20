import React, { useEffect, useState } from 'react';
import MainLayout from '../components/MainLayout';
import {
  useHabits,
  useMeasurementUnits,
  useCreateRecord,
  useAuth,
  useRecords,
  useRecordActions, 
} from '../hooks';
import { MeasurementUnitsEnum } from '../models/measurementUnit';
import type { MeasurementUnit } from '../models/measurementUnit';
import type { RecordData } from '../hooks/useRecords'; 

function Dashboard() {
  // Hooks existentes
  const { habits, loading: habitsLoading, error: habitsError } = useHabits();
  const { units, loading: unitsLoading, error: unitsError } = useMeasurementUnits();
  const { createRecord, loading: creating } = useCreateRecord();
  const { records, loading: recordsLoading, fetchRecords } = useRecords();
  const { getUser } = useAuth();
  
  const { deleteRecord, updateRecord, loading: processingAction } = useRecordActions();

  const [selectedHabitId, setSelectedHabitId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<string>('');
  const [selectedUnitId, setSelectedUnitId] = useState<number | ''>('');
  const [date, setDate] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingUserHabitId, setEditingUserHabitId] = useState<number | null>(null);

  const selectedHabit = habits.find((h) => h.id === selectedHabitId);

  function formatDateToOffset(dateStr: string): string {
    const parts = dateStr.split('-').map((p) => Number(p));
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n) || n <= 0)) return dateStr;
    const tzMinutes = new Date().getTimezoneOffset();
    const offsetTotal = -tzMinutes;
    const sign = offsetTotal >= 0 ? '+' : '-';
    const abs = Math.abs(offsetTotal);
    const hh = String(Math.floor(abs / 60)).padStart(2, '0');
    const mm = String(abs % 60).padStart(2, '0');
    return `${dateStr}T00:00:00${sign}${hh}:${mm}`;
  }

  function getBaseUnitIdFromHabit(habit: any): number | undefined {
    if (!habit) return undefined;
    return habit.measurementUnitId || habit.idMeasurementUnit;
  }
  // --------------------------------------------

  const baseUnitId = selectedHabit ? getBaseUnitIdFromHabit(selectedHabit) : undefined;

  // Validação
  const canSubmit = Boolean(
    selectedHabitId &&
    selectedUnitId &&
    quantity &&
    Number(quantity) > 0 &&
    date &&
    baseUnitId
  );

  function filterUnitsForHabit(unitsList: MeasurementUnit[], baseId?: number): MeasurementUnit[] {
    if (!baseId) return unitsList;
    if (baseId === MeasurementUnitsEnum.Ml || baseId === MeasurementUnitsEnum.L) {
      return unitsList.filter((u) => u.id === MeasurementUnitsEnum.Ml || u.id === MeasurementUnitsEnum.L);
    }
    if (baseId === MeasurementUnitsEnum.Min || baseId === MeasurementUnitsEnum.H) {
      return unitsList.filter((u) => u.id === MeasurementUnitsEnum.Min || u.id === MeasurementUnitsEnum.H);
    }
    return unitsList;
  }

  const allowedUnits = filterUnitsForHabit(units, baseUnitId);

  useEffect(() => {
    if (!selectedHabitId) {
      if (!editingId) setSelectedUnitId(''); 
      return;
    }
    if (unitsLoading) return;

    const currentAllowed = filterUnitsForHabit(units, baseUnitId);
    if (!currentAllowed.length) return;

    if (typeof selectedUnitId === 'number' && currentAllowed.some((u) => u.id === selectedUnitId)) {
      return;
    }

    if (baseUnitId && currentAllowed.some((u) => u.id === baseUnitId)) {
      setSelectedUnitId(baseUnitId);
    } else {
      setSelectedUnitId(currentAllowed[0].id);
    }
  }, [selectedHabitId, baseUnitId, units, unitsLoading, selectedUnitId, editingId]);

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingUserHabitId(null);
    setQuantity('');
    setDate('');
    setSelectedHabitId('');
    setSelectedUnitId('');
    setFormError(null);
  };

  const handleEditClick = (reg: RecordData) => {
    setEditingId(reg.id);
    

    const uhId = (reg as any).userHabitId || reg.userHabit?.id;
    setEditingUserHabitId(uhId);

    if (reg.userHabit?.habit?.id) {
        setSelectedHabitId(reg.userHabit.habit.id);
    }
    
    setQuantity(String(reg.value));
    
    if (reg.userHabit?.habit?.measurementUnit?.id) {
        setSelectedUnitId(reg.userHabit.habit.measurementUnit.id); 
    }

    if (reg.date) {
        const justDate = reg.date.split('T')[0];
        setDate(justDate);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
        try {
            await deleteRecord(id);
            await fetchRecords(); 
        } catch (err) {
            alert('Erro ao excluir.');
        }
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = getUser();
    setFormError(null);
    
    if (!user?.id) { setFormError('Login necessário.'); return; }
    if (!canSubmit) { setFormError('Preencha corretamente.'); return; }
    
    const numericValue = Number(quantity);
    const formattedDate = formatDateToOffset(date);

    try {
        if (editingId) {
            if (!editingUserHabitId) {
                setFormError('Erro interno: ID do hábito do usuário não encontrado.');
                return;
            }
            await updateRecord({
                id: editingId,
                userHabitId: editingUserHabitId,
                inputValue: numericValue,
                inputUnitId: Number(selectedUnitId),
                baseUnitId: baseUnitId!,
                date: formattedDate
            });
            alert('Registro atualizado!');
            handleCancelEdit(); 
        } else {
            // MODO CRIAÇÃO
            await createRecord({
                userId: user.id,
                habitId: Number(selectedHabitId),
                inputValue: numericValue,
                inputUnitId: Number(selectedUnitId),
                baseUnitId: baseUnitId!,
                date: formattedDate,
            });
            setQuantity('');
        }
        
        await fetchRecords();
    } catch (err) {
        setFormError('Erro ao salvar.');
    }
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '-';
    try { return new Date(dateString).toLocaleDateString('pt-BR'); } catch { return dateString; }
  };

  return (
    <MainLayout activePage="goals">
      <div className={`card-theme p-8 mb-8 animate-fade-in-up ${editingId ? 'border-2 border-cyan-500' : 'card-header-accent'}`}>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
            {editingId ? '✏️ Editando Objetivo' : 'Registrar Novo Objetivo'}
            </h2>
            {editingId && (
                <button onClick={handleCancelEdit} className="text-sm text-red-500 hover:underline">
                    Cancelar Edição
                </button>
            )}
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Objetivo</label>
            <select
              className="input-theme"
              value={selectedHabitId}
              onChange={(e) => setSelectedHabitId(e.target.value ? Number(e.target.value) : '')}
              disabled={!!editingId} 
            >
              <option value="">Selecione um hábito</option>
              {habits.map((habit) => (
                <option key={habit.id} value={habit.id}>{habit.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade</label>
              <input
                type="number"
                placeholder="Ex: 1000"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="input-theme"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unidade</label>
              <select
                className="input-theme"
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value ? Number(e.target.value) : '')}
                disabled={!selectedHabitId}
              >
                <option value="">Selecione</option>
                {allowedUnits.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
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
            className={`w-full py-3 text-white font-semibold rounded-lg transition shadow-md ${
                editingId ? 'bg-cyan-600 hover:bg-cyan-700' : 'btn-primary'
            } disabled:opacity-60`}
            disabled={creating || processingAction || !canSubmit}
          >
            {creating || processingAction ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Registrar Objetivo'}
          </button>

          {formError && <p className="text-sm text-red-600 mt-2">{formError}</p>}
        </form>
      </div>

      {/* LISTAGEM */}
      <div className="card-theme p-8 animate-fade-in-up card-header-accent">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Registros Diários</h2>
        <div className="overflow-x-auto">
          <table className="table-theme">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objetivo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Un</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recordsLoading ? (
                <tr><td colSpan={5} className="p-4 text-center">Carregando...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">Nenhum registro.</td></tr>
              ) : (
                records.map((reg) => (
                  <tr key={reg.id} className={editingId === reg.id ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reg.userHabit?.habit?.name || `Habit #${reg.id}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{reg.value}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {reg.userHabit?.measurementUnit?.symbol || reg.userHabit?.habit?.measurementUnit?.symbol || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDateDisplay(reg.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      <button 
                        onClick={() => handleEditClick(reg)}
                        className="text-cyan-600 hover:text-cyan-800 disabled:opacity-30"
                        disabled={processingAction}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(reg.id)}
                        className="text-red-600 hover:text-red-800 disabled:opacity-30"
                        disabled={processingAction}
                        title="Excluir"
                      >
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