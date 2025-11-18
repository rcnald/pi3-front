import { useEffect, useId, useMemo, useState } from 'react';

export type GoalType = 'sleep' | 'water' | 'activity';

export type GoalUnitOption = {
  value: string;
  label: string;
};

export type GoalValue = {
  value: string;
  unit: string;
};

const GOAL_CONFIG: Record<GoalType, {
  title: string;
  valueInputLabel: string;
  unitInputLabel: string;
  unitOptions: GoalUnitOption[];
  emptyValueMessage: string;
}> = {
  sleep: {
    title: 'Cadastrar meta de sono',
    valueInputLabel: 'Horas',
    unitInputLabel: 'Unidade',
    unitOptions: [
      { value: 'horas', label: 'Horas' },
    ],
    emptyValueMessage: 'Informe a quantidade de horas desejada.',
  },
  water: {
    title: 'Cadastrar meta de água',
    valueInputLabel: 'Quantidade',
    unitInputLabel: 'Unidade',
    unitOptions: [
      { value: 'ml', label: 'Mililitros (ml)' },
      { value: 'l', label: 'Litros (L)' },
    ],
    emptyValueMessage: 'Informe a quantidade de água desejada.',
  },
  activity: {
    title: 'Cadastrar meta de atividade física',
    valueInputLabel: 'Quantidade',
    unitInputLabel: 'Unidade',
    unitOptions: [
      { value: 'minutos', label: 'Minutos' },
    ],
    emptyValueMessage: 'Informe a quantidade desejada para a meta.',
  },
};

export type GoalModalProps = {
  isOpen: boolean;
  goalType: GoalType;
  currentGoal?: GoalValue | null;
  loading?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSave: (goal: GoalValue) => Promise<void> | void;
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
    () => currentGoal?.unit ?? config.unitOptions[0]?.value ?? 'unidade',
    [config.unitOptions, currentGoal?.unit]
  );

  const valueInputId = useId();
  const unitInputId = useId();

  const [newGoalValue, setNewGoalValue] = useState(currentGoal?.value ?? '');
  const [newGoalUnit, setNewGoalUnit] = useState(defaultUnit);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNewGoalValue(currentGoal?.value ?? '');
      setNewGoalUnit(currentGoal?.unit ?? config.unitOptions[0]?.value ?? '');
      setLocalError(null);
    }
  }, [config.unitOptions, currentGoal, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsedValue = parseFloat(newGoalValue.replace(',', '.'));

    if (!newGoalValue || Number.isNaN(parsedValue) || parsedValue <= 0) {
      setLocalError(config.emptyValueMessage);
      return;
    }

    await onSave({ value: newGoalValue, unit: newGoalUnit });
  };

  const combinedError = localError ?? errorMessage;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-white/70 backdrop-blur-md"
        onClick={onClose}
        role="presentation"
      />

      <div className="relative w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-8 shadow-xl">
        <h3 className="mb-8 text-center text-xl font-semibold text-gray-800">
          {config.title}
        </h3>

        {combinedError && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">
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
                  value={config.unitOptions.find((opt) => opt.value === currentGoal.unit)?.label ?? currentGoal.unit}
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
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex w-48 flex-col gap-1">
                <label className="text-sm font-medium text-gray-600" htmlFor={valueInputId}>
                  {config.valueInputLabel}
                </label>
                <input
                  id={valueInputId}
                  type="number"
                  min="0"
                  step="0.1"
                  value={newGoalValue}
                  onChange={(event) => setNewGoalValue(event.target.value)}
                  className="rounded-md border-2 border-gray-400 px-4 py-3 text-center text-lg focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex w-48 flex-col gap-1">
                <label className="text-sm font-medium text-gray-600" htmlFor={unitInputId}>
                  {config.unitInputLabel}
                </label>
                <select
                  id={unitInputId}
                  value={newGoalUnit}
                  onChange={(event) => setNewGoalUnit(event.target.value)}
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
