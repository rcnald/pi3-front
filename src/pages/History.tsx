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

  // Formata os dados para o gráfico
  const chartData = history?.grafico.map((item) => ({
    data: formatDate(item.data),
    Total: item.total,
    Meta: history.metaInfo.metaDiaria,
  })) || [];

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card 1: Visão Geral */}
          <div className="card-theme p-8 lg:col-span-1 animate-fade-in-up card-header-accent">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Visão Geral
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Métricas de desempenho de {history.metaInfo.nome}.
            </p>
            <div className="space-y-5">
              <div className="flex justify-between items-center py-4 border-b border-gray-100">
                <span className="text-gray-600">Média Semanal</span>
                <strong className="text-2xl text-gray-800">
                  {history.metricas.mediaSemanal.toFixed(2)} {history.metaInfo.unidade}
                </strong>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-gray-100">
                <span className="text-gray-600">Melhor Registro</span>
                <strong className="text-2xl text-gray-800">
                  {history.metricas.melhorRegistro.toFixed(2)} {history.metaInfo.unidade}
                </strong>
              </div>
              <div className="flex justify-between items-center py-4">
                <span className="text-gray-600">Meta Diária</span>
                <strong className="text-2xl text-gray-800">
                  {history.metaInfo.metaDiaria.toFixed(2)} {history.metaInfo.unidade}
                </strong>
              </div>
            </div>
          </div>

          {/* Card 2: Gráfico */}
          <div className="card-theme p-8 lg:col-span-2 animate-fade-in-up card-header-accent">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Histórico dos Últimos 7 Dias
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Comparação da meta com os registros de {history.metaInfo.nome}.
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
                    value: history.metaInfo.unidade, 
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
                  name={`Total (${history.metaInfo.unidade})`}
                />
                <Line 
                  type="monotone" 
                  dataKey="Meta" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                  name={`Meta (${history.metaInfo.unidade})`}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
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
