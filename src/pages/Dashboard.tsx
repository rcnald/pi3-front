import { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import {
  useHabits,
  useMeasurementUnits,
  useCreateRecord,
  useAuth,
  useRecords,
  useRecordActions,
} from '../hooks';
import {
  formatDateToOffset,
  getBaseUnitIdFromHabit,
  formatDateDisplay,
} from '../utils/dateHelpers';
import type { RecordData } from '../types/record';
import type { MeasurementUnit } from '../models/measurementUnit';
import { MeasurementUnitsEnum } from '../models/measurementUnit';
import { Edit2, Trash2 } from 'lucide-react';

function Dashboard() {
  const { habits } = useHabits();
  const { units, loading: unitsLoading } = useMeasurementUnits();
  const { createRecord, loading: creating } = useCreateRecord();
  const { records, loading: recordsLoading, fetchRecords } = useRecords();
  const { getUser } = useAuth();
  const {
    deleteRecord,
    updateRecord,
    loading: processingAction,
  } = useRecordActions();

  const [selectedHabitId, setSelectedHabitId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<string>('');
  const [selectedUnitId, setSelectedUnitId] = useState<number | ''>('');
  const [date, setDate] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<string>('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingUserHabitId, setEditingUserHabitId] = useState<number | null>(
    null
  );

  const selectedHabit = habits.find((h) => h.id === selectedHabitId);
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
      if (!editingId) setSelectedUnitId('');
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
  }, [
    selectedHabitId,
    baseUnitId,
    units,
    unitsLoading,
    selectedUnitId,
    editingId,
  ]);

  useEffect(() => {
    if (formSuccess) {
      const timer = setTimeout(() => {
        setFormSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formSuccess]);

  useEffect(() => {
    const user = getUser();
    if (user?.id) {
      fetchRecords(user.id, filterDate || undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDate]);

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingUserHabitId(null);
    setQuantity('');
    setDate('');
    setSelectedHabitId('');
    setSelectedUnitId('');
    setFormError(null);
    setFormSuccess(null);
  };

  const handleEditClick = (reg: RecordData) => {
    setEditingId(reg.id);

    const uhId = reg.userHabitId || reg.userHabit?.id;
    setEditingUserHabitId(uhId || null);

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
        const user = getUser();
        if (!user?.id) return;
        await deleteRecord(id);
        await fetchRecords(user.id, filterDate || undefined);
      } catch (err) {
        alert('Erro ao excluir.' + err);
      }
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = getUser();
    setFormError(null);
    setFormSuccess(null);

    if (!user?.id) {
      setFormError('Login necessário.');
      return;
    }
    if (!canSubmit) {
      setFormError('Preencha corretamente.');
      return;
    }

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
          date: formattedDate,
        });
        setFormSuccess('✓ Registro atualizado com sucesso!');
        handleCancelEdit();
      } else {
        await createRecord({
          userId: user.id,
          habitId: Number(selectedHabitId),
          inputValue: numericValue,
          inputUnitId: Number(selectedUnitId),
          baseUnitId: baseUnitId!,
          date: formattedDate,
        });
        setFormSuccess('✓ Objetivo registrado com sucesso!');
        setQuantity('');
      }

      await fetchRecords(user.id, filterDate || undefined);
    } catch (err) {
      setFormError('Erro ao salvar. ' + String(err));
    }
  };

  return (
    <MainLayout activePage="goals">
      <div
        className={`card-theme p-8 mb-8 animate-fade-in-up ${
          editingId ? 'border-2 border-cyan-500' : 'card-header-accent'
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {editingId ? '✏️ Editando Objetivo' : 'Registrar Novo Objetivo'}
          </h2>
          {editingId && (
            <button
              onClick={handleCancelEdit}
              className="text-sm text-red-500 hover:underline"
            >
              Cancelar Edição
            </button>
          )}
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objetivo
            </label>
            <select
              className="input-theme"
              value={selectedHabitId}
              onChange={(e) =>
                setSelectedHabitId(e.target.value ? Number(e.target.value) : '')
              }
              disabled={!!editingId}
            >
              <option value="">Selecione um hábito</option>
              {habits.map((habit) => (
                <option key={habit.id} value={habit.id}>
                  {habit.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade
              </label>
              <input
                type="number"
                placeholder="Ex: 1000"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="input-theme"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidade
              </label>
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
                <option value="">Selecione</option>
                {allowedUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
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
            className={`w-full py-3 text-white font-semibold rounded-lg transition shadow-md ${
              editingId ? 'bg-cyan-600 hover:bg-cyan-700' : 'btn-primary'
            } disabled:opacity-60`}
            disabled={creating || processingAction || !canSubmit}
          >
            {creating || processingAction
              ? 'Salvando...'
              : editingId
              ? 'Salvar Alterações'
              : 'Registrar Objetivo'}
          </button>

          {formError && (
            <p className="text-sm text-red-600 mt-2">{formError}</p>
          )}
          {formSuccess && (
            <p className="text-sm text-cyan-600 mt-2 font-medium">
              {formSuccess}
            </p>
          )}
        </form>
      </div>

      {/* LISTAGEM */}
      <div className="card-theme p-8 animate-fade-in-up card-header-accent">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Registros Diários
          </h2>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Filtrar por data:
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="input-theme w-auto"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="text-sm text-cyan-600 hover:text-cyan-800 underline"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-theme">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Objetivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qtd
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Un
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
                <tr>
                  <td colSpan={5} className="p-4 text-center">
                    Carregando...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    Nenhum registro.
                  </td>
                </tr>
              ) : (
                records.map((reg) => (
                  <tr
                    key={reg.id}
                    className={editingId === reg.id ? 'bg-blue-50' : ''}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reg.userHabit?.habit?.name || `Habit #${reg.id}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {reg.value}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {reg.userHabit?.measurementUnit?.symbol ||
                        reg.userHabit?.habit?.measurementUnit?.symbol ||
                        '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDateDisplay(reg.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      {!editingId && (
                        <>
                          <button
                            onClick={() => handleEditClick(reg)}
                            className="text-cyan-600 hover:text-cyan-800 disabled:opacity-30 inline-flex items-center gap-1"
                            disabled={processingAction}
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(reg.id)}
                            className="text-red-600 hover:text-red-800 disabled:opacity-30 inline-flex items-center gap-1"
                            disabled={processingAction}
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
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
