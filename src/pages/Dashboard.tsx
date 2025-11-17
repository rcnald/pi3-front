import MainLayout from '../components/MainLayout';
import { useHabits } from '../hooks';

function Dashboard() {
  const { habits, loading, error } = useHabits();
  const registros = [
    { id: 1, obj: 'Beber Água', qtd: 2000, un: 'mL', data: '24/10/2025' },
    { id: 2, obj: 'Caminhar', qtd: 30, un: 'min', data: '24/10/2025' },
    { id: 3, obj: 'Meditar', qtd: 10, un: 'min', data: '23/10/2025' },
    { id: 4, obj: 'Ler Livros', qtd: 20, un: 'páginas', data: '23/10/2025' },
    { id: 5, obj: 'Alongamento', qtd: 15, un: 'min', data: '22/10/2025' },
  ];

  return (
    <MainLayout activePage="goals">
      {/* Seção 1: Registrar Novo Objetivo */}
      <div className="bg-white p-8 rounded-lg border border-gray-200 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Registrar Novo Objetivo
        </h2>

        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objetivo
            </label>
            {loading && <p className="text-sm text-gray-500">Carregando hábitos...</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!loading && !error && (
              <select className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white">
                <option>Selecione um hábito</option>
                {habits.map((habit) => (
                  <option key={habit.id} value={habit.id}>
                    {habit.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade
              </label>
              <input
                type="number"
                placeholder="1000"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidade
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white">
                <option>mL</option>
                <option>min</option>
                <option>páginas</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-600 text-white py-3 rounded-md font-bold hover:bg-cyan-700 transition duration-200"
          >
            Registrar Objetivo
          </button>
        </form>
      </div>

      {/* Seção 2: Registros Diários */}
      <div className="bg-white p-8 rounded-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Registros Diários
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Objetivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidade
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
              {registros.map((reg) => (
                <tr key={reg.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reg.obj}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {reg.qtd}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {reg.un}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {reg.data}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <button className="text-cyan-600 hover:text-cyan-800">
                      ✏️
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Removido ApiDemo conforme preferência de teste na History */}
    </MainLayout>
  );
}

export default Dashboard;
