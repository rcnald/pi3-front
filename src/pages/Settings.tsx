import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import MainLayout from '../components/MainLayout';
// import { User, Bell, Moon, Droplet, Activity, ChevronRight, LogOut } from 'lucide-react'; // Exemplo de ícones

type ProfileResponse = {
  id: number;
  nome: string;
  email: string;
};

function Settings() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState<string | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editSenhaAntiga, setEditSenhaAntiga] = useState('');
  const [editSenhaNova, setEditSenhaNova] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const handleLogout = () => {
    setSuccess('Logout realizado com sucesso.');
    try {
      localStorage.removeItem('token');
    } catch (e) {
      // ignore
    }
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setEditLoading(true);

    try {
      const payload: Record<string, string> = {};
      if (editNome.trim()) payload.nome = editNome;
      if (editSenhaAntiga) payload.senha_antiga = editSenhaAntiga;
      if (editSenhaNova) payload.senha_nova = editSenhaNova;

      const resp = await api.put<ProfileResponse>('/perfil', payload);
      setSuccess(`Perfil atualizado com sucesso! Novo nome: ${resp.data.nome}`);
      setEditNome('');
      setEditSenhaAntiga('');
      setEditSenhaNova('');
      setShowEditProfile(false);
    } catch (err: unknown) {
      const error = err as { response?: { status: number; data?: { erro?: string } }; message?: string };
      if (error?.response?.status === 400) {
        setEditError(error.response.data?.erro ?? 'Requisição inválida.');
      } else {
        if (import.meta.env.DEV) {
          setEditError(`Erro ao atualizar perfil: ${error?.message ?? 'Erro desconhecido'}`);
        } else {
          setEditError('Erro ao atualizar perfil. Tente novamente.');
        }
      }
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <MainLayout activePage="configuracoes">
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">
        Configurações
      </h1>
      
      {/* Seção 1: Minha Conta */}
      <div className="bg-white p-8 rounded-lg border border-gray-200 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Minha Conta</h3>
        <p className="text-gray-600 text-sm mb-6">
          Gerencie suas informações de perfil e notificações.
        </p>
        <ul className="divide-y divide-gray-200">
          <li 
            onClick={() => setShowEditProfile(true)}
            className="py-4 flex justify-between items-center hover:bg-gray-50 -mx-8 px-8 cursor-pointer">
            <div className="flex items-center gap-4">
              {/* <User className="text-gray-500" /> */}
              <span className="font-medium text-gray-700">Meu perfil</span>
            </div>
            {/* <ChevronRight className="text-gray-400" /> */}
            <span>&gt;</span>
          </li>
          <li className="py-4 flex justify-between items-center hover:bg-gray-50 -mx-8 px-8 cursor-pointer">
            <div className="flex items-center gap-4">
              {/* <Bell className="text-gray-500" /> */}
              <span className="font-medium text-gray-700">Notificações</span>
            </div>
            <span>&gt;</span>
          </li>
        </ul>
      </div>
      
      {/* Seção 2: Minhas Metas */}
      <div className="bg-white p-8 rounded-lg border border-gray-200 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Minhas Metas</h3>
        <p className="text-gray-600 text-sm mb-6">
          Defina e ajuste suas metas de saúde e bem-estar.
        </p>
        <ul className="divide-y divide-gray-200">
          <li className="py-4 flex justify-between items-center hover:bg-gray-50 -mx-8 px-8 cursor-pointer">
            <div className="flex items-center gap-4">
              {/* <Moon className="text-gray-500" /> */}
              <span className="font-medium text-gray-700">Meta Sono</span>
            </div>
            <span>&gt;</span>
          </li>
          <li className="py-4 flex justify-between items-center hover:bg-gray-50 -mx-8 px-8 cursor-pointer">
            <div className="flex items-center gap-4">
              {/* <Droplet className="text-gray-500" /> */}
              <span className="font-medium text-gray-700">Meta Água</span>
            </div>
            <span>&gt;</span>
          </li>
          <li className="py-4 flex justify-between items-center hover:bg-gray-50 -mx-8 px-8 cursor-pointer">
            <div className="flex items-center gap-4">
              {/* <Activity className="text-gray-500" /> */}
              <span className="font-medium text-gray-700">Meta Atividade Física</span>
            </div>
            <span>&gt;</span>
          </li>
        </ul>
      </div>
      
      {/* Botão de Sair */}
      {success && (
        <div className="text-sm text-green-600 mb-4" role="status">
          {success}
        </div>
      )}

      {/* Modal de Edição de Perfil */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Editar Perfil</h3>
            
            {editError && (
              <div className="text-sm text-red-600 mb-4" role="alert">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Novo Nome (opcional)
                </label>
                <input
                  type="text"
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  placeholder="Deixe em branco para não alterar"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha Antiga (se for alterar senha)
                </label>
                <input
                  type="password"
                  value={editSenhaAntiga}
                  onChange={(e) => setEditSenhaAntiga(e.target.value)}
                  placeholder="Deixe em branco se não for alterar"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha Nova (se for alterar senha)
                </label>
                <input
                  type="password"
                  value={editSenhaNova}
                  onChange={(e) => setEditSenhaNova(e.target.value)}
                  placeholder="Deixe em branco se não for alterar"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={editLoading}
                  className={`flex-1 py-2 rounded-md font-bold text-white ${editLoading ? 'bg-cyan-400' : 'bg-cyan-600 hover:bg-cyan-700'} transition`}
                >
                  {editLoading ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProfile(false);
                    setEditError(null);
                    setEditNome('');
                    setEditSenhaAntiga('');
                    setEditSenhaNova('');
                  }}
                  className="flex-1 py-2 rounded-md font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-5 py-3 rounded-lg font-bold text-red-600 bg-red-100 hover:bg-red-200 transition-colors"
      >
        {/* <LogOut size={20} /> */}
        <span>Sair da Conta</span>
      </button>
      
    </MainLayout>
  );
}

export default Settings;
