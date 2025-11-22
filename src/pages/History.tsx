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

function History() {
  const { getUser } = useAuth();
  const { habits, loading: loadingHabits } = useHabits();
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const { history, loading: loadingHistory, error, refetch } = useHistory();

  // Calcula as datas para os últimos 7 dias
  const getLast7Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    
    return {
      dataInicio: start.toISOString().split('T')[0],
      dataFim: end.toISOString().split('T')[0],
    };
  };

  // Busca o histórico quando um hábito é selecionado
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

  // Seleciona o primeiro hábito por padrão
  useEffect(() => {
    if (habits.length > 0 && !selectedHabit) {
      setSelectedHabit(habits[0]);
    }
  }, [habits, selectedHabit]);

  // Tab styling
  const getTabClass = (habitId: number) => {
    const base = 'btn-outline-tab';
    const active = 'btn-outline-tab-active';
    return habitId === selectedHabit?.id ? `${base} ${active}` : base;
  };

  // Formata a data para o eixo X
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  // Calcula a porcentagem da meta atingida
  const calculateGoalPercentage = (total: number, meta: number): number => {
    if (meta === 0) return 0;
    return (total / meta) * 100;
  };

  // Retorna a cor baseada na porcentagem da meta
  const getGoalColor = (percentage: number, hasMeta: boolean, hasTotal: boolean): string => {
    if (!hasMeta && !hasTotal) return 'text-gray-400'; // Sem meta e sem registro
    if (!hasMeta && hasTotal) return 'text-blue-600'; // Progresso livre (sem meta definida)
    if (percentage >= 100) return 'text-green-600'; // Meta batida
    if (percentage >= 70) return 'text-orange-500'; // Próximo da meta
    return 'text-red-600'; // Longe da meta
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

  // Formata os dados para o gráfico
  const chartData = history?.chart.map((item) => ({
    data: formatDate(item.date),
    Total: item.total,
    Meta: item.dailyGoal,
    dataCompleta: item.date,
  })) || [];

  // Calcula estatísticas de meta
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
  
  // Total de dias avaliados (com meta)
  const totalEvaluatedDays = goalStats.achieved + goalStats.close + goalStats.below;

  return (
    <MainLayout activePage="progress">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6 animate-fade-in-up">
        Histórico de Registros
      </h1>

      {/* Filtro de Abas */}
      <div className="card-theme p-6 mb-8 animate-fade-in-up card-header-accent">
        <strong className="block text-sm font-medium text-gray-700 mb-3">
          Selecionar Hábito
        </strong>
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
        {/* Card de Estatísticas de Meta */}
        <div className="card-theme p-6 mb-6 animate-fade-in-up card-header-accent">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Taxa de Conquista da Meta
          </h3>
          <div className="grid grid-cols-5 gap-2 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{goalStats.achieved}</div>
              <div className="text-xs text-gray-600">✓ Batidas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{goalStats.close}</div>
              <div className="text-xs text-gray-600">~ Próximo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{goalStats.below}</div>
              <div className="text-xs text-gray-600">✗ Abaixo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{goalStats.freeProgress}</div>
              <div className="text-xs text-gray-600">✓ Livre</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">{goalStats.noRecord}</div>
              <div className="text-xs text-gray-600">- Vazio</div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card 1: Visão Geral */}
          <div className="card-theme p-8 lg:col-span-1 animate-fade-in-up card-header-accent">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Visão Geral
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Métricas de desempenho de {history.info.name}.
            </p>
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

            {/* Lista de Dias com Status */}
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

          {/* Card 2: Gráfico */}
          <div className="card-theme p-8 lg:col-span-2 animate-fade-in-up card-header-accent">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Histórico dos Últimos 7 Dias
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Comparação da meta com os registros de {history.info.name}.
            </p>
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
