import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api'; 
import MainLayout from '../components/MainLayout'; 

function Settings() {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('habitus_user_data');
    if (!saved) {
      return { id: null, name: '', email: '' };
    }
    
    try {
      const parsed = JSON.parse(saved);
      const userData = parsed;

      if (userData && userData.id !== undefined) {
          return { 
              id: userData.id, 
              name: userData.name || '', 
              email: userData.email || '' 
          };
      }
      
      return { id: null, name: '', email: '' };
      
    } catch (e) {
      return { id: null, name: '', email: '' };
    }
  });
  
  const [success, setSuccess] = useState<string | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editOldPassword, setEditOldPassword] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const handleLogout = () => {
    setSuccess('Logout realizado com sucesso.');
    localStorage.removeItem('habitus_user_data'); 
    localStorage.removeItem('token');
    
    setTimeout(() => {
      navigate('/login'); 
    }, 1000);
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setSuccess(null);
    
    if (!user || !user.id) {
        setEditError(`Erro: Usuário sem ID (id: ${user?.id}). Faça Logout e Login novamente.`);
        return; 
    }
    
    if (editNewPassword.trim() !== "" && editOldPassword.trim() === "") {
      setEditError("Para alterar sua senha, você precisa informar a senha atual.");
      return;
    }

    setEditLoading(true);

    try {
      const payload: any = {};
      
      if (editName !== user.name && editName.trim() !== "") payload.nome = editName.trim();
      if (editEmail !== user.email && editEmail.trim() !== "") payload.email = editEmail.trim();
      
      if (editNewPassword.trim() !== "") {
        payload.senha_nova = editNewPassword;
        payload.senha_antiga = editOldPassword;
      }

      if (Object.keys(payload).length === 0) {
         setEditLoading(false);
         setShowEditProfile(false);
         return;
      }

      const userId = user.id; 
      
      const resp = await api.put(`/users/${userId}`, payload);

      const updatedUser = {
        ...user,
        name: resp.data?.name || resp.data?.nome || (payload.nome ? payload.nome : user.name),
        email: resp.data?.email || (payload.email ? payload.email : user.email)
      };

      localStorage.setItem('habitus_user_data', JSON.stringify(updatedUser));

      setUser(updatedUser);

      if (payload.senha_nova) setSuccess("Senha atualizada com sucesso!");
      else if (payload.email) setSuccess("Email atualizado com sucesso!");
      else if (payload.nome) setSuccess("Nome atualizado com sucesso!");
      else setSuccess("Perfil atualizado com sucesso!");

      setEditName('');
      setEditEmail('');
      setEditOldPassword('');
      setEditNewPassword('');
      setShowEditProfile(false);

    } catch (err: any) {
      let msg = "Erro ao atualizar perfil.";
      const errorData = err.response?.data;

      if (typeof errorData === 'string') {
        msg = errorData;
      } else if (errorData?.message) {
        msg = errorData.message;
      } else if (errorData?.erro) {
        msg = errorData.erro;
      } else if (errorData?.error) {
        msg = errorData.error;
      }
      setEditError(msg);
    } finally {
      setEditLoading(false);
    }
  };

  const openModal = () => {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
      setShowEditProfile(true);
  }

  return (
    <MainLayout activePage="settings">
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">
        Configurações
      </h1>

      {/* Seção 1: Minha Conta */}
      <div className="bg-white p-8 rounded-lg border border-gray-200 mb-8 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Minha Conta
        </h3>
        <p className="text-gray-600 text-sm mb-6">
          Gerencie suas informações de perfil e notificações.
        </p>
        <ul className="divide-y divide-gray-200">
          <li
            onClick={openModal}
            className="py-4 flex justify-between items-center hover:bg-gray-50 -mx-8 px-8 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
              </div>
              <div>
                  <span className="font-medium text-gray-700 block">Meu perfil</span>
                  <span className="text-xs text-gray-500">
                    {user.name || "Sem nome"} ({user.email || "Sem email"})
                  </span>
              </div>
            </div>
            <span className="text-gray-400">&gt;</span>
          </li>
          <li className="py-4 flex justify-between items-center hover:bg-gray-50 -mx-8 px-8 cursor-pointer transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <span className="font-medium text-gray-700">Notificações</span>
            </div>
            <span>&gt;</span>
          </li>
        </ul>
      </div>

      {/* Seção 2: Minhas Metas */}
      <div className="bg-white p-8 rounded-lg border border-gray-200 mb-8 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Minhas Metas
        </h3>
        <p className="text-gray-600 text-sm mb-6">
          Defina e ajuste suas metas de saúde e bem-estar.
        </p>
        <ul className="divide-y divide-gray-200">
          <li className="py-4 flex justify-between items-center hover:bg-gray-50 -mx-8 px-8 cursor-pointer transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <span className="font-medium text-gray-700">Meta Sono</span>
            </div>
            <span>&gt;</span>
          </li>
          <li className="py-4 flex justify-between items-center hover:bg-gray-50 -mx-8 px-8 cursor-pointer transition-colors">
             <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v.25a.75.75 0 01-1.5 0v-.25A.75.75 0 0110 2zM5.5 8.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4c0 1.5-1 2.5-2 3l-.5.25A2.5 2.5 0 0110 14a2.5 2.5 0 01-2-2.25l-.5-.25c-1-.5-2-1.5-2-3z" clipRule="evenodd" />
                   <path d="M10 3.5c-2.5 3.5-5 6-5 8.5a5 5 0 1010 0c0-2.5-2.5-5-5-8.5z" /> 
                </svg>
              </div>
              <span className="font-medium text-gray-700">Meta Água</span>
            </div>
            <span>&gt;</span>
          </li>
          <li className="py-4 flex justify-between items-center hover:bg-gray-50 -mx-8 px-8 cursor-pointer transition-colors">
            <div className="flex items-center gap-4">
               <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium text-gray-700">
                Meta Atividade Física
              </span>
            </div>
            <span>&gt;</span>
          </li>
        </ul>
      </div>

      {success && (
        <div className="text-sm text-green-600 mb-4 p-3 bg-green-100 rounded" role="status">
          {success}
        </div>
      )}

      {showEditProfile && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Editar Perfil
            </h3>

            {editError && (
              <div className="text-sm text-red-600 mb-4 p-2 bg-red-100 rounded border border-red-200" role="alert">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                  </label>
                  <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Seu email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                
                <hr className="my-4 border-gray-200" />
                <p className="text-xs text-gray-500 italic mb-2">Preencha abaixo apenas se deseja alterar a senha</p>
                
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha Atual {editNewPassword ? <span className="text-red-500 text-xs">(Obrigatório para confirmar)</span> : <span className="text-gray-400 text-xs font-normal">(Opcional)</span>}
                </label>
                <input
                  type="password"
                  value={editOldPassword}
                  onChange={(e) => setEditOldPassword(e.target.value)}
                  placeholder={editNewPassword ? "Digite sua senha atual" : "Deixe em branco se não for alterar"}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nova Senha (Opcional)
                </label>
                <input
                  type="password"
                  value={editNewPassword}
                  onChange={(e) => setEditNewPassword(e.target.value)}
                  placeholder="Deixe em branco se não for alterar"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={editLoading}
                  className={`flex-1 py-2 rounded-md font-bold text-white ${
                    editLoading
                      ? 'bg-cyan-400'
                      : 'bg-cyan-600 hover:bg-cyan-700'
                  } transition`}
                >
                  {editLoading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProfile(false);
                    setEditError(null);
                    setEditOldPassword('');
                    setEditNewPassword('');
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
        className="flex items-center gap-3 px-5 py-3 rounded-lg font-bold text-red-600 bg-red-100 hover:bg-red-200 transition-colors mt-8"
      >
        <span>Sair da Conta</span>
      </button>
    </MainLayout>
  );
}

export default Settings;