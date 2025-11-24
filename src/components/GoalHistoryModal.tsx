import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Calendar, Target, Zap } from 'lucide-react';
import apiService from '../services/api';

export type GoalType = 'sleep' | 'water' | 'activity';

type UserHabit = {
  id: number;
  userId: number;
  habitId: number;
  habitName: string;
  measurementUnitId: number;
  measurementUnitSymbol: string;
  dailyGoal: number;
  weeklyFrequency: number;
  startDate: string;
  endDate: string | null;
};

export type GoalHistoryModalProps = {
  isOpen: boolean;
  goalType: GoalType;
  habitId: number;
  onClose: () => void;
  onAddNew: () => void;
  onEdit: (goal: UserHabit) => void;
  getUser: () => { id: number; name: string; email: string } | null;
};

const goalTypeLabels: Record<GoalType, string> = {
  sleep: 'Sono',
  water: 'Água',
  activity: 'Atividade Física',
};

const goalTypeColors: Record<GoalType, { gradient: string; border: string; text: string; bg: string }> = {
  sleep: {
    gradient: 'from-cyan-50 via-blue-50 to-teal-50',
    border: 'border-cyan-300',
    text: 'text-cyan-700',
    bg: 'bg-cyan-600 hover:bg-cyan-700',
  },
  water: {
    gradient: 'from-cyan-50 via-blue-50 to-teal-50',
    border: 'border-cyan-300',
    text: 'text-cyan-700',
    bg: 'bg-cyan-600 hover:bg-cyan-700',
  },
  activity: {
    gradient: 'from-cyan-50 via-blue-50 to-teal-50',
    border: 'border-cyan-300',
    text: 'text-cyan-700',
    bg: 'bg-cyan-600 hover:bg-cyan-700',
  },
};

const GoalHistoryModal = ({
  isOpen,
  goalType,
  habitId,
  onClose,
  onAddNew,
  onEdit,
  getUser,
}: GoalHistoryModalProps) => {
  console.log('GoalHistoryModal rendered - isOpen:', isOpen, 'goalType:', goalType);
  
  const [currentGoal, setCurrentGoal] = useState<UserHabit | null>(null);
  const [historyGoals, setHistoryGoals] = useState<UserHabit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
    
  // GET - Buscar todas as metas de um hábito
  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const user = getUser();
      
      if (!user || !user.id) {
        throw new Error('Usuário não autenticado');
      }
      
      const userId = user.id;
      const params: Record<string, number> = { userId };
      if (habitId) {
        params.habitId = habitId;
      }
      const goals = await apiService.get<UserHabit[]>('/user-habits', params);
      
      // Separate current goal (endDate is null) from history
      const current = goals.find((g: UserHabit) => g.endDate === null);
      const history = goals.filter((g: UserHabit) => g.endDate !== null).sort((a: UserHabit, b: UserHabit) => {
        const dateComparison = new Date(b.endDate!).getTime() - new Date(a.endDate!).getTime();
        // Se as datas são iguais, ordenar por ID (mais recente primeiro)
        return dateComparison !== 0 ? dateComparison : b.id - a.id;
      });
      
      setCurrentGoal(current || null);
      setHistoryGoals(history);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError('Erro ao carregar histórico de metas.');
    } finally {
      setLoading(false);
    }
  }, [habitId, getUser]);

  useEffect(() => {
    if (isOpen) {
      fetchGoals();
    }
  }, [isOpen, fetchGoals]);

  // UPDATE - Atualizar uma meta existente
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  // DELETE - Deletar uma meta
  const handleDelete = async (habitId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta meta?')) return;

    try {
      const user = getUser();
      if (!user || !user.id) {
        alert('Erro: Usuário não autenticado.');
        return;
      }
      await apiService.delete(`/user-habits/${habitId}?userId=${user.id}`);
      await fetchGoals();
    } catch (err) {
      console.error('Error deleting goal:', err);
      alert('Erro ao excluir meta.');
    }
  };

  const formatDate = (dateStr: string) => {
    // Parse the date string and add timezone offset to avoid day shift
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  if (!isOpen) {
    console.log('Modal not open, returning null');
    return null;
  }

  console.log('Rendering modal UI...');
  const colors = goalTypeColors[goalType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      />

      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl animate-slide-up">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${colors.gradient} px-8 py-6 border-b-2 ${colors.border}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${colors.bg} shadow-lg`}>
                <Target size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Metas de {goalTypeLabels[goalType]}
                </h2>
                <p className="text-sm text-gray-600 mt-0.5">Gerencie suas metas e acompanhe seu progresso</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/50 transition-all duration-200 active:scale-95"
              aria-label="Fechar"
            >
              <X size={24} className="text-gray-700" />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">

          {error && (
            <div className="mb-6 rounded-xl border-2 border-red-300 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-bold">⚠</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Carregando metas...</p>
            </div>
          ) : (
            <>
              {/* Meta Atual */}
              {currentGoal ? (
              <div className={`mb-8 p-8 rounded-2xl bg-gradient-to-br ${colors.gradient} border-2 ${colors.border} shadow-lg relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/20 rounded-full -ml-16 -mb-16"></div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg ${colors.bg} shadow-md`}>
                        <Zap size={20} className="text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">Meta Atual</h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(currentGoal)}
                        className="p-2.5 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
                      <p className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Meta Diária</p>
                      <p className="text-3xl font-bold text-gray-800">
                        {currentGoal.dailyGoal}
                      </p>
                      <p className="text-sm font-semibold text-gray-600 mt-1">
                        {currentGoal.measurementUnitSymbol}
                      </p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
                      <p className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Hábito</p>
                      <p className="text-lg font-bold text-gray-800 mt-2">
                        {currentGoal.habitName}
                      </p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
                      <p className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Frequência</p>
                      <p className="text-lg font-bold text-gray-800 mt-2">
                        {currentGoal.weeklyFrequency}x/semana
                      </p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
                      <p className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Início</p>
                      <div className="flex items-center justify-center gap-1.5 mt-2">
                        <Calendar size={16} className="text-gray-600" />
                        <p className="text-lg font-bold text-gray-800">
                          {formatDate(currentGoal.startDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8 p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 text-center shadow-sm">
                <div className="inline-block p-4 bg-gray-200 rounded-full mb-4">
                  <Target size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium text-lg">Nenhuma meta ativa no momento</p>
                <p className="text-gray-500 text-sm mt-2">Clique em "Nova Meta" para começar</p>
              </div>
            )}

            {/* Histórico de Metas */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-5">
                <Calendar size={20} className="text-gray-600" />
                <h3 className="text-xl font-bold text-gray-800">
                  Histórico de Metas
                </h3>
              </div>
              {historyGoals.length > 0 ? (
                <div className="space-y-3">
                  {historyGoals.map((goal, index) => (
                    <div
                      key={goal.id}
                      className="group p-5 rounded-xl bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 flex-1 text-sm">
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Meta Diária</p>
                            <p className="font-bold text-gray-800 text-base">
                              {goal.dailyGoal} <span className="text-sm font-semibold text-gray-600">{goal.measurementUnitSymbol}</span>
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hábito</p>
                            <p className="font-semibold text-gray-800">
                              {goal.habitName}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Frequência</p>
                            <p className="font-semibold text-gray-800">
                              {goal.weeklyFrequency}x/sem
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Início</p>
                            <p className="font-semibold text-gray-800">
                              {formatDate(goal.startDate)}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fim</p>
                            <p className="font-semibold text-gray-800">
                              {goal.endDate ? formatDate(goal.endDate) : '-'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => onEdit(goal)}
                            className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 active:scale-95 shadow-sm"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(goal.id)}
                            className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 active:scale-95 shadow-sm"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 text-center">
                  <div className="inline-block p-3 bg-gray-200 rounded-full mb-3">
                    <Calendar size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">Nenhuma meta anterior encontrada</p>
                  <p className="text-gray-500 text-sm mt-1">Suas metas concluídas aparecerão aqui</p>
                </div>
              )}
            </div>

            {/* Botão Adicionar Nova Meta */}
            <div className="flex justify-center pt-6 mt-6 border-t-2 border-gray-200">
              <button
                onClick={onAddNew}
                className={`group flex items-center gap-3 px-8 py-4 ${colors.bg} text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95`}
              >
                <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                  <Plus size={20} />
                </div>
                <span>Nova Meta</span>
              </button>
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalHistoryModal;
