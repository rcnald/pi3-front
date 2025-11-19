import { useEffect, useState } from 'react';
import MainLayout from '../components/MainLayout';
import { api } from '../services/api';

function History() {
  const [activeTab, setActiveTab] = useState<Goal>('Sleep');

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

  // Tab styling using new theme classes
  const getTabClass = (tabName: Goal) => {
    const base = 'btn-outline-tab';
    const active = 'btn-outline-tab-active';
    return tabName === activeTab ? `${base} ${active}` : base;
  };

  return (
    <MainLayout activePage="progress">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6 animate-fade-in-up">
        Histórico de Registros
      </h1>

      {/* Filtro de Abas */}
      <div className="card-theme p-6 mb-8 animate-fade-in-up card-header-accent">
        <strong className="block text-sm font-medium text-gray-700 mb-3">
          Selecionar Objetivo
        </strong>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab('Sleep')}
            className={getTabClass('Sleep')}
          >
            Sono
          </button>
          <button
            onClick={() => setActiveTab('Water')}
            className={getTabClass('Water')}
          >
            Água
          </button>
          <button
            onClick={() => setActiveTab('PhysicalActivity')}
            className={getTabClass('PhysicalActivity')}
          >
            Atividade Física
          </button>
        </div>
      </div>

      {/* Grid de Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card 1: Visão Geral (ocupa 1 coluna em telas grandes) */}
        <div className="card-theme p-8 lg:col-span-1 animate-fade-in-up card-header-accent">
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
        <div className="card-theme p-8 lg:col-span-2 animate-fade-in-up card-header-accent">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Histórico de {activeTab} dos Últimos 7 Dias
          </h3>
          <p className="text-gray-600 text-sm mb-6">
            Comparação da meta com o sono registrado.
          </p>
          <div className="h-72 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 animate-fade-in-up">
            <p className="text-gray-500">📊 (Componente de Gráfico)</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default History;
