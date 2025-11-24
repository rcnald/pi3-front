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
import { Edit2, Trash2, Plus, Calendar, ListChecks } from 'lucide-react';

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
        setFormSuccess('✓ Atividade registrada com sucesso!');
        setQuantity('');
      }

      await fetchRecords(user.id, filterDate || undefined);
    } catch (err) {
      setFormError('Erro ao salvar. ' + String(err));
    }
  };

  return (
    <MainLayout activePage="goals">
      <div className="card-theme overflow-hidden mb-8 animate-fade-in-up">
        {/* Gradient Header */}
        <div
          className={`bg-gradient-to-r ${
            editingId
              ? 'from-orange-500 via-amber-500 to-yellow-500'
              : 'from-cyan-500 via-blue-500 to-teal-500'
          } px-8 py-6 text-white`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                {editingId ? <Edit2 size={28} /> : <Plus size={28} />}
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {editingId
                    ? 'Editando Atividade'
                    : 'Registrar Nova Atividade'}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  {editingId
                    ? 'Atualize os dados do registro'
                    : 'Adicione uma nova atividade ao seu dia'}
                </p>
              </div>
            </div>
            {editingId && (
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        <div className="p-8">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="rounded-xl border-2 border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-shadow">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                <span className="text-xl">🎯</span>
                Atividade
              </label>
              <select
                className="input-theme"
                value={selectedHabitId}
                onChange={(e) =>
                  setSelectedHabitId(
                    e.target.value ? Number(e.target.value) : ''
                  )
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

            <div className="rounded-xl border-2 border-gray-200 p-6 bg-gradient-to-br from-gray-50 to-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📊</span>
                <h4 className="text-sm font-bold text-gray-700">
                  Quantidade e Medida
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">
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
                  <label className="block text-xs font-semibold text-gray-600 mb-2">
                    {selectedHabitId ? 'Unidade de medida' : 'Unidade'}
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
                    <option value="">Selecione uma unidade</option>
                    {allowedUnits.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-xl border-2 border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-shadow">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                <Calendar size={18} className="text-cyan-600" />
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-theme w-full text-center font-semibold"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-4 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                editingId
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
              } disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]`}
              disabled={creating || processingAction || !canSubmit}
            >
              {creating || processingAction ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Salvando...
                </>
              ) : (
                <>
                  {editingId ? <Edit2 size={20} /> : <Plus size={20} />}
                  {editingId ? 'Salvar Alterações' : 'Registrar Atividade'}
                </>
              )}
            </button>

            {formError && (
              <div className="rounded-xl border-2 border-red-300 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm animate-shake">
                <div className="flex items-center gap-2">
                  <span className="text-red-500 font-bold text-lg">⚠</span>
                  <span className="font-medium">{formError}</span>
                </div>
              </div>
            )}
            {formSuccess && (
              <div className="rounded-xl border-2 border-green-300 bg-green-50 px-5 py-4 text-sm text-green-700 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-500 font-bold text-lg">✓</span>
                  <span className="font-medium">{formSuccess}</span>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* LISTAGEM */}
      <div className="card-theme overflow-hidden animate-fade-in-up">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                <ListChecks size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Registros Diários</h2>
                <p className="text-white/80 text-sm mt-1">
                  Histórico de todas as suas atividades
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl">
              <Calendar size={18} />
              <label className="text-sm font-medium">Filtrar:</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-white/90 border-0 rounded-lg px-3 py-2 text-gray-800 font-medium focus:ring-2 focus:ring-white/50 focus:outline-none"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate('')}
                  className="px-3 py-2 bg-white/90 hover:bg-white text-gray-800 rounded-lg text-sm font-medium transition-all"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="overflow-x-auto">
            <table className="table-theme">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Atividade
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
                              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-cyan-100 text-cyan-600 hover:bg-cyan-600 hover:text-white transition-all shadow-sm hover:shadow-md disabled:opacity-30"
                              disabled={processingAction}
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(reg.id)}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm hover:shadow-md disabled:opacity-30"
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
      </div>
    </MainLayout>
  );
}

export default Dashboard;
