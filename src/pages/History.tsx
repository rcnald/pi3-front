import { useEffect, useState } from 'react';
import MainLayout from '../components/MainLayout';
import { useHabits, useHistory, useAuth } from '../hooks';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { HistoryParams } from '../types/history';
import { TrendingUp, BarChart3, Award, Target } from 'lucide-react';

function History() {
  const { getUser } = useAuth();
  const { habits, loading: loadingHabits } = useHabits();
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const { history, loading: loadingHistory, error, refetch } = useHistory();

  const getLast7Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    
    return {
      dataInicio: start.toISOString().split('T')[0],
      dataFim: end.toISOString().split('T')[0],
    };
  };

  useEffect(() => {
    const user = getUser();
    if (selectedHabit && user) {
      const { dataInicio, dataFim } = getLast7Days();
      const params: HistoryParams = {
        userId: user.id,
        habitId: selectedHabit.id,
        dataInicio,
        dataFim,
      };
      
      refetch(params);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHabit]);

  useEffect(() => {
    if (habits.length > 0 && !selectedHabit) {
      setSelectedHabit(habits[0]);
    }
  }, [habits, selectedHabit]);

  const getTabClass = (habitId: number) => {
    const base = 'btn-outline-tab';
    const active = 'btn-outline-tab-active';
    return habitId === selectedHabit?.id ? `${base} ${active}` : base;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const calculateGoalPercentage = (total: number, meta: number): number => {
    if (meta === 0) return 0;
    return (total / meta) * 100;
  };

  const getGoalColor = (percentage: number, hasMeta: boolean, hasTotal: boolean): string => {
    if (!hasMeta && !hasTotal) return 'text-gray-400'; 
    if (!hasMeta && hasTotal) return 'text-blue-600'; 
    if (percentage >= 100) return 'text-green-600'; 
    if (percentage >= 70) return 'text-orange-500'; 
    return 'text-red-600'; 
  };

  const getGoalBgColor = (percentage: number, hasMeta: boolean, hasTotal: boolean): string => {
    if (!hasMeta && !hasTotal) return 'bg-gray-50 border-gray-200';
    if (!hasMeta && hasTotal) return 'bg-blue-50 border-blue-200';
    if (percentage >= 100) return 'bg-green-50 border-green-200';
    if (percentage >= 70) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getGoalStatus = (percentage: number, hasMeta: boolean, hasTotal: boolean): string => {
    if (!hasMeta && !hasTotal) return '- Sem registro';
    if (!hasMeta && hasTotal) return '✓ Progresso livre';
    if (percentage >= 100) return '✓ Meta Batida';
    if (percentage >= 70) return '~ Quase lá';
    return '✗ Abaixo da meta';
  };

  const chartData = history?.chart.map((item) => ({
    data: formatDate(item.date),
    Total: item.total,
    Meta: item.dailyGoal,
    dataCompleta: item.date,
  })) || [];

  const goalStats = history?.chart.reduce(
    (acc, item) => {
      const hasMeta = item.dailyGoal > 0;
      const hasTotal = item.total > 0;
      
      if (!hasMeta && !hasTotal) {
        acc.noRecord++;
        return acc;
      }
      
      if (!hasMeta && hasTotal) {
        acc.freeProgress++;
        return acc;
      }
      
      const percentage = calculateGoalPercentage(item.total, item.dailyGoal);
      if (percentage >= 100) acc.achieved++;
      else if (percentage >= 70) acc.close++;
      else acc.below++;
      return acc;
    },
    { achieved: 0, close: 0, below: 0, freeProgress: 0, noRecord: 0 }
  ) || { achieved: 0, close: 0, below: 0, freeProgress: 0, noRecord: 0 };

  const totalDaysWithGoal = (history?.chart.filter(item => item.dailyGoal > 0).length) || 0;
  const achievementRate = totalDaysWithGoal > 0 ? (goalStats.achieved / totalDaysWithGoal) * 100 : 0;
  
  const totalEvaluatedDays = goalStats.achieved + goalStats.close + goalStats.below;

  return (
    <MainLayout activePage="progress">
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl shadow-lg">
            <TrendingUp size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Histórico de Registros
          </h1>
        </div>
        <p className="text-gray-600 ml-16">Acompanhe seu progresso e conquistas ao longo do tempo</p>
      </div>

      <div className="card-theme overflow-hidden mb-8 animate-fade-in-up">
        <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 px-8 py-6 text-white">
          <div className="flex items-center gap-3">
            <Target size={24} />
            <div>
              <h3 className="text-xl font-bold">Selecionar Hábito</h3>
              <p className="text-white/80 text-sm mt-1">Escolha qual atividade deseja acompanhar</p>
            </div>
          </div>
        </div>
        <div className="p-6">
        {loadingHabits ? (
          <p className="text-gray-500">Carregando hábitos...</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {habits.map((habit) => (
              <button
                key={habit.id}
                onClick={() => setSelectedHabit(habit)}
                className={getTabClass(habit.id)}
              >
                {habit.name}
              </button>
            ))}
          </div>
        )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loadingHistory ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Carregando histórico...</p>
        </div>
      ) : history && selectedHabit ? (
        <>
        <div className="card-theme overflow-hidden mb-6 animate-fade-in-up">
          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-8 py-6 text-white">
            <div className="flex items-center gap-3">
              <Award size={24} />
              <div>
                <h3 className="text-xl font-bold">Taxa de Conquista da Meta</h3>
                <p className="text-white/80 text-sm mt-1">Seu desempenho nos últimos 7 dias</p>
              </div>
            </div>
          </div>
          <div className="p-6">
          <div className="grid grid-cols-5 gap-3 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl font-bold text-green-600">{goalStats.achieved}</div>
              <div className="text-xs text-gray-700 font-medium mt-1">✓ Batidas</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-4 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl font-bold text-orange-500">{goalStats.close}</div>
              <div className="text-xs text-gray-700 font-medium mt-1">~ Próximo</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-4 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl font-bold text-red-600">{goalStats.below}</div>
              <div className="text-xs text-gray-700 font-medium mt-1">✗ Abaixo</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl font-bold text-blue-600">{goalStats.freeProgress}</div>
              <div className="text-xs text-gray-700 font-medium mt-1">✓ Livre</div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl p-4 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl font-bold text-gray-400">{goalStats.noRecord}</div>
              <div className="text-xs text-gray-700 font-medium mt-1">- Vazio</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Taxa de Sucesso</span>
              <strong className={`text-2xl ${getGoalColor(achievementRate, totalDaysWithGoal > 0, true)}`}>
                {totalDaysWithGoal > 0 ? `${achievementRate.toFixed(0)}%` : 'N/A'}
              </strong>
            </div>
            {totalEvaluatedDays > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {goalStats.achieved} de {totalEvaluatedDays} dias com meta cumprida
              </p>
            )}
            {(goalStats.freeProgress > 0 || goalStats.noRecord > 0) && (
              <p className="text-xs text-gray-400 mt-1">
                {goalStats.freeProgress > 0 && `${goalStats.freeProgress} livre`}
                {goalStats.freeProgress > 0 && goalStats.noRecord > 0 && ' • '}
                {goalStats.noRecord > 0 && `${goalStats.noRecord} vazio`}
              </p>
            )}
          </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="card-theme overflow-hidden lg:col-span-1 animate-fade-in-up">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-5 text-white">
              <div className="flex items-center gap-3">
                <BarChart3 size={24} />
                <div>
                  <h3 className="text-lg font-bold">Visão Geral</h3>
                  <p className="text-white/80 text-xs mt-1">Métricas de {history.info.name}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
            <div className="space-y-5">
              <div className="flex justify-between items-center py-4 border-b border-gray-100">
                <span className="text-gray-600">Média Semanal</span>
                <strong className="text-2xl text-gray-800">
                  {history.metrics.weeklyAverage.toFixed(2)} {history.info.unit}
                </strong>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-gray-100">
                <span className="text-gray-600">Melhor Registro</span>
                <strong className="text-2xl text-gray-800">
                  {history.metrics.bestRecord.toFixed(2)} {history.info.unit}
                </strong>
              </div>
              <div className="flex justify-between items-center py-4">
                <span className="text-gray-600">Meta Diária Atual</span>
                <strong className="text-2xl text-gray-800">
                  {history.info.dailyGoal.toFixed(2)} {history.info.unit}
                </strong>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Status por Dia</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {history.chart.map((item) => {
                  const hasMeta = item.dailyGoal > 0;
                  const hasTotal = item.total > 0;
                  const percentage = calculateGoalPercentage(item.total, item.dailyGoal);
                  return (
                    <div
                      key={item.date}
                      className={`p-3 rounded-lg border ${getGoalBgColor(percentage, hasMeta, hasTotal)}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-700">
                          {formatDate(item.date)}
                        </span>
                        <span className={`text-xs font-semibold ${getGoalColor(percentage, hasMeta, hasTotal)}`}>
                          {getGoalStatus(percentage, hasMeta, hasTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-600">
                          {hasTotal ? `${item.total.toFixed(0)} ${history.info.unit}` : 'Sem registro'}
                          {hasMeta && hasTotal && ` / ${item.dailyGoal.toFixed(0)}`}
                        </span>
                        {hasMeta && hasTotal && (
                          <span className={`text-xs font-bold ${getGoalColor(percentage, hasMeta, hasTotal)}`}>
                            {percentage.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            </div>
          </div>

          <div className="card-theme overflow-hidden lg:col-span-2 animate-fade-in-up">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-5 text-white">
              <div className="flex items-center gap-3">
                <TrendingUp size={24} />
                <div>
                  <h3 className="text-lg font-bold">Histórico dos Últimos 7 Dias</h3>
                  <p className="text-white/80 text-xs mt-1">Comparação da meta com {history.info.name}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="data" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  label={{ 
                    value: history.info.unit, 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fontSize: '12px', fill: '#6b7280' }
                  }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="Total" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name={`Total (${history.info.unit})`}
                />
                <Line 
                  type="monotone" 
                  dataKey="Meta" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                  name={`Meta (${history.info.unit})`}
                />
              </LineChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Selecione um hábito para visualizar o histórico
          </p>
        </div>
      )}
    </MainLayout>
  );
}

export default History;
