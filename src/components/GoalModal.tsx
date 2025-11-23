import { useEffect, useId, useMemo, useState } from 'react';
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
  onClose: () => void;
  onSave: (goal: GoalValue, habitId: number) => Promise<void> | void;
};

const GoalModal = ({
  isOpen,
  goalType,
  currentGoal,
  loading = false,
  errorMessage,
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

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md"
        onClick={onClose}
        role="presentation"
      />

      <div className="relative w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-8 shadow-xl">
        <h3 className="mb-8 text-center text-xl font-semibold text-gray-800">
          {config.title}
        </h3>

        {combinedError && (
          <div
            className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700"
            role="alert"
          >
            {combinedError}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {currentGoal?.value && (
            <div className="rounded-lg border border-gray-300 p-6">
              <span className="mb-4 block text-center font-medium text-gray-700">
                Meta atual
              </span>
              <div className="flex flex-wrap justify-center gap-4">
                <input
                  type="text"
                  value={currentGoal.value}
                  readOnly
                  className="w-48 rounded-md border-2 border-gray-400 px-4 py-3 text-center text-lg text-gray-700"
                />
                <input
                  type="text"
                  value={
                    config.unitOptions.find(
                      (opt) => opt.value === currentGoal.measurementUnitId
                    )?.label ?? 'Unidade'
                  }
                  readOnly
                  className="w-48 rounded-md border-2 border-gray-400 px-4 py-3 text-center text-lg text-gray-700"
                />
              </div>
            </div>
          )}

          <div className="rounded-lg border border-gray-300 p-6">
            <span className="mb-4 block text-center font-medium text-gray-700">
              Meta nova
            </span>

            <div className="mb-6 flex flex-col gap-2">
              <label
                className="text-sm font-medium text-gray-600"
                htmlFor={weeklyFrequencyInputId}
              >
                Frequência Semanal (dias por semana)
              </label>
              <input
                id={weeklyFrequencyInputId}
                type="number"
                min="1"
                max="7"
                step="1"
                value={weeklyFrequency}
                onChange={(event) => setWeeklyFrequency(event.target.value)}
                placeholder="Ex: 3"
                className="rounded-md border-2 border-gray-400 px-4 py-3 text-lg focus:border-cyan-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Escolha de 1 a 7 vezes por semana
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex w-48 flex-col gap-1">
                <label
                  className="text-sm font-medium text-gray-600"
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
                  className="rounded-md border-2 border-gray-400 px-4 py-3 text-center text-lg focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex w-48 flex-col gap-1">
                <label
                  className="text-sm font-medium text-gray-600"
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
                  className="rounded-md border-2 border-gray-400 px-4 py-3 text-center text-lg focus:border-cyan-500 focus:outline-none"
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

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border-2 border-gray-400 px-6 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 rounded-md border-2 px-6 py-3 text-center font-semibold text-white transition ${
                loading
                  ? 'border-cyan-300 bg-cyan-300'
                  : 'border-cyan-600 bg-cyan-600 hover:bg-cyan-700'
              }`}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalModal;
