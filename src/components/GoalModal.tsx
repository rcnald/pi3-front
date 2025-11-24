import { useEffect, useId, useMemo, useState } from 'react';
import { Save, X, Target } from 'lucide-react';
import { Habits } from '../types/habit.d';
import { MeasurementUnitsEnum } from '../types/measurementUnit.d';

export type GoalType = 'sleep' | 'water' | 'activity';

export type GoalUnitOption = {
  value: number; // ID from MeasurementUnitsEnum
  label: string;
};

export type GoalValue = {
  value: string;
  measurementUnitId: number;
  weeklyFrequency: string;
};

const goalTypeColors: Record<GoalType, { gradient: string; buttonBg: string; inputFocus: string }> = {
  sleep: {
    gradient: 'from-cyan-500 via-blue-500 to-teal-500',
    buttonBg: 'bg-cyan-600 hover:bg-cyan-700 border-cyan-600',
    inputFocus: 'focus:border-cyan-500 focus:ring-cyan-500',
  },
  water: {
    gradient: 'from-cyan-500 via-blue-500 to-teal-500',
    buttonBg: 'bg-cyan-600 hover:bg-cyan-700 border-cyan-600',
    inputFocus: 'focus:border-cyan-500 focus:ring-cyan-500',
  },
  activity: {
    gradient: 'from-cyan-500 via-blue-500 to-teal-500',
    buttonBg: 'bg-cyan-600 hover:bg-cyan-700 border-cyan-600',
    inputFocus: 'focus:border-cyan-500 focus:ring-cyan-500',
  },
};

const GOAL_CONFIG: Record<
  GoalType,
  {
    habitId: number;
    title: string;
    valueInputLabel: string;
    unitInputLabel: string;
    unitOptions: GoalUnitOption[];
    emptyValueMessage: string;
    goalModeLabel: string;
    minValue: number;
    step: number;
  }
> = {
  sleep: {
    habitId: Habits.Sleep,
    title: 'Cadastrar meta de sono',
    valueInputLabel: 'Meta Diária',
    unitInputLabel: 'Unidade',
    unitOptions: [
      { value: MeasurementUnitsEnum.Min, label: 'Minutos' },
      { value: MeasurementUnitsEnum.H, label: 'Horas' },
    ],
    emptyValueMessage: 'Informe a quantidade desejada (mínimo 1).',
    goalModeLabel: 'Tipo de meta',
    minValue: 1,
    step: 1,
  },
  water: {
    habitId: Habits.Water,
    title: 'Cadastrar meta de água',
    valueInputLabel: 'Meta Diária',
    unitInputLabel: 'Unidade',
    unitOptions: [
      { value: MeasurementUnitsEnum.Ml, label: 'Mililitros (ml)' },
      { value: MeasurementUnitsEnum.L, label: 'Litros (L)' },
    ],
    emptyValueMessage: 'Informe a quantidade de água desejada (mínimo 1).',
    goalModeLabel: 'Tipo de meta',
    minValue: 1,
    step: 1,
  },
  activity: {
    habitId: Habits.PhysicalActivity,
    title: 'Cadastrar meta de atividade física',
    valueInputLabel: 'Meta Diária',
    unitInputLabel: 'Unidade',
    unitOptions: [
      { value: MeasurementUnitsEnum.Min, label: 'Minutos' },
      { value: MeasurementUnitsEnum.H, label: 'Horas' },
    ],
    emptyValueMessage:
      'Informe a quantidade de minutos desejada (mínimo 1 minuto).',
    goalModeLabel: 'Tipo de meta',
    minValue: 1,
    step: 1,
  },
};

export type GoalModalProps = {
  isOpen: boolean;
  goalType: GoalType;
  currentGoal?: GoalValue | null;
  loading?: boolean;
  errorMessage?: string | null;
  isEditing?: boolean;
  onClose: () => void;
  onSave: (goal: GoalValue, habitId: number) => Promise<void> | void;
};

const GoalModal = ({
  isOpen,
  goalType,
  currentGoal,
  loading = false,
  errorMessage,
  isEditing = false,
  onClose,
  onSave,
}: GoalModalProps) => {
  const config = GOAL_CONFIG[goalType];
  const defaultUnit = useMemo(
    () =>
      currentGoal?.measurementUnitId ??
      config.unitOptions[0]?.value ??
      MeasurementUnitsEnum.Min,
    [config.unitOptions, currentGoal?.measurementUnitId]
  );

  const valueInputId = useId();
  const unitInputId = useId();
  const weeklyFrequencyInputId = useId();

  const [newGoalValue, setNewGoalValue] = useState(currentGoal?.value ?? '');
  const [newGoalUnit, setNewGoalUnit] = useState(defaultUnit);
  const [weeklyFrequency, setWeeklyFrequency] = useState(
    currentGoal?.weeklyFrequency ?? '1'
  );
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNewGoalValue(currentGoal?.value ?? '');
      setNewGoalUnit(
        currentGoal?.measurementUnitId ??
          config.unitOptions[0]?.value ??
          MeasurementUnitsEnum.Min
      );
      setWeeklyFrequency(currentGoal?.weeklyFrequency ?? '1');
      setLocalError(null);
    }
  }, [config.unitOptions, currentGoal, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsedValue = parseFloat(newGoalValue.replace(',', '.'));

    if (
      !newGoalValue ||
      Number.isNaN(parsedValue) ||
      parsedValue < config.minValue
    ) {
      setLocalError(config.emptyValueMessage);
      return;
    }

    const parsedFrequency = parseInt(weeklyFrequency);
    if (
      !weeklyFrequency ||
      Number.isNaN(parsedFrequency) ||
      parsedFrequency <= 0 ||
      parsedFrequency > 7
    ) {
      setLocalError(
        'Informe uma frequência semanal válida (1 a 7 vezes por semana).'
      );
      return;
    }

    await onSave(
      {
        value: newGoalValue,
        measurementUnitId: newGoalUnit,
        weeklyFrequency: weeklyFrequency,
      },
      config.habitId
    );
  };

  const combinedError = localError ?? errorMessage;
  const colors = goalTypeColors[goalType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      />

      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-slide-up">
        {/* Gradient Header */}
        <div className={`relative bg-gradient-to-r ${colors.gradient} px-8 py-8 text-white overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                <Target size={32} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  {isEditing ? config.title.replace('Cadastrar', 'Atualizar') : config.title}
                </h3>
                <p className="text-white/80 text-sm mt-1">Defina sua meta e frequência semanal</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-all duration-200 active:scale-95"
              aria-label="Fechar"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-8">

          {combinedError && (
            <div
              className="mb-6 rounded-xl border-2 border-red-300 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm animate-shake"
              role="alert"
            >
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-bold text-lg">⚠</span>
                <span className="font-medium">{combinedError}</span>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Weekly Frequency */}
            <div className="rounded-xl border-2 border-gray-200 p-6 bg-gradient-to-br from-gray-50 to-white shadow-sm hover:shadow-md transition-shadow">
              <label
                className="flex items-center gap-2 text-base font-bold text-gray-700 mb-3"
                htmlFor={weeklyFrequencyInputId}
              >
                <span className="text-2xl">📅</span>
                Frequência Semanal
              </label>
              <input
                id={weeklyFrequencyInputId}
                type="number"
                min="1"
                max="7"
                step="1"
                value={weeklyFrequency}
                onChange={(event) => setWeeklyFrequency(event.target.value)}
                placeholder="Ex: 5"
                className={`w-full rounded-xl border-2 border-gray-300 px-6 py-4 text-lg font-semibold text-center ${colors.inputFocus} focus:outline-none focus:ring-2 transition-all`}
              />
              <p className="text-xs text-gray-500 mt-3 text-center font-medium">
                🎯 Escolha de 1 a 7 dias por semana
              </p>
            </div>

            {/* Goal Value and Unit */}
            <div className="rounded-xl border-2 border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎯</span>
                <h4 className="text-base font-bold text-gray-700">Meta Diária</h4>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label
                    className="block text-sm font-semibold text-gray-600 mb-2"
                    htmlFor={valueInputId}
                  >
                    {config.valueInputLabel}
                  </label>
                  <input
                    id={valueInputId}
                    type="number"
                    min={config.minValue}
                    step={config.step}
                    value={newGoalValue}
                    onChange={(event) => setNewGoalValue(event.target.value)}
                    placeholder="0"
                    className={`w-full rounded-xl border-2 border-gray-300 px-6 py-4 text-2xl font-bold text-center ${colors.inputFocus} focus:outline-none focus:ring-2 transition-all`}
                  />
                </div>

                <div className="flex-1">
                  <label
                    className="block text-sm font-semibold text-gray-600 mb-2"
                    htmlFor={unitInputId}
                  >
                    {config.unitInputLabel}
                  </label>
                  <select
                    id={unitInputId}
                    value={newGoalUnit}
                    onChange={(event) =>
                      setNewGoalUnit(Number(event.target.value))
                    }
                    className={`w-full rounded-xl border-2 border-gray-300 px-6 py-4 text-lg font-semibold text-center ${colors.inputFocus} focus:outline-none focus:ring-2 transition-all cursor-pointer`}
                  >
                    {config.unitOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-6 py-4 font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 active:scale-95 shadow-sm"
              >
                <X size={20} />
                <span>Cancelar</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 px-6 py-4 font-bold text-white transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 ${
                  loading
                    ? 'bg-gray-400 border-gray-400 cursor-not-allowed'
                    : colors.buttonBg
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Salvar Meta</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GoalModal;
