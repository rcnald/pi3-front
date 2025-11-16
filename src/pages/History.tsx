import { useEffect, useState } from 'react';
import MainLayout from '../components/MainLayout';
import { api } from '../services/api';

type Objetivo = 'Sono' | 'Água' | 'Atividade Física';

function History() {
  const [activeTab, setActiveTab] = useState<Objetivo>('Sono');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/users');
        console.log(data);
      } catch (err) {
        console.error('Erro ao buscar usuários', err);
      }
    };
    fetchUsers();
  }, []);

  // Função para classes das Abas
  const getTabClass = (tabName: Objetivo) => {
    const baseClass = 'px-5 py-2 rounded-full font-medium transition-colors';
    if (tabName === activeTab) {
      return `${baseClass} bg-cyan-100 text-cyan-700 border border-cyan-200`;
    }
    return `${baseClass} bg-gray-100 text-gray-600 hover:bg-gray-200`;
  };

  return (
    <MainLayout activePage="progresso">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Histórico de Registros
      </h1>

      {/* Filtro de Abas */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <strong className="block text-sm font-medium text-gray-700 mb-3">
          Selecionar Objetivo
        </strong>
        <div className="flex space-x-3">
          <button
            onClick={() => setActiveTab('Sono')}
            className={getTabClass('Sono')}
          >
            Sono
          </button>
          <button
            onClick={() => setActiveTab('Água')}
            className={getTabClass('Água')}
          >
            Água
          </button>
          <button
            onClick={() => setActiveTab('Atividade Física')}
            className={getTabClass('Atividade Física')}
          >
            Atividade Física
          </button>
        </div>
      </div>

      {/* Grid de Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card 1: Visão Geral (ocupa 1 coluna em telas grandes) */}
        <div className="bg-white p-8 rounded-lg border border-gray-200 lg:col-span-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Visão Geral do {activeTab}
          </h3>
          <p className="text-gray-600 text-sm mb-6">
            Métricas de desempenho da sua qualidade de sono.
          </p>
          <div className="space-y-5">
            <div className="flex justify-between items-center py-4 border-b border-gray-100">
              <span className="text-gray-600">Média Semanal</span>
              <strong className="text-2xl text-gray-800">7.7 horas</strong>
            </div>
            <div className="flex justify-between items-center py-4">
              <span className="text-gray-600">Melhor Registro</span>
              <strong className="text-2xl text-gray-800">9.0 horas</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Gráfico (ocupa 2 colunas em telas grandes) */}
        <div className="bg-white p-8 rounded-lg border border-gray-200 lg:col-span-2">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Histórico de {activeTab} dos Últimos 7 Dias
          </h3>
          <p className="text-gray-600 text-sm mb-6">
            Comparação da meta com o sono registrado.
          </p>
          <div className="h-72 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <p className="text-gray-500">📊 (Componente de Gráfico)</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default History;
