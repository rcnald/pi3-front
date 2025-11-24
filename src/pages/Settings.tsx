import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import MainLayout from '../components/MainLayout';
import GoalModal, {
  type GoalType,
  type GoalValue,
} from '../components/GoalModal';
import GoalHistoryModal from '../components/GoalHistoryModal';
import { ProfileModal } from '../components/ProfileModal';
import { useAuth } from '../hooks/useAuth';
import { Activity, Droplet, LogOut, Moon, User, Settings as SettingsIcon, Sparkles, Target } from 'lucide-react';

function Settings() {
  const navigate = useNavigate();
  const { getUser, updateUser } = useAuth();
  const [success, setSuccess] = useState<string | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editOldPassword, setEditOldPassword] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const [activeGoalType, setActiveGoalType] = useState<GoalType | null>(null);
  const [showGoalHistory, setShowGoalHistory] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalModalError, setGoalModalError] = useState<string | null>(null);
  const [goalModalLoading, setGoalModalLoading] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [currentGoals, setCurrentGoals] = useState<
    Record<GoalType, GoalValue | null>
  >({
    sleep: null,
    water: null,
    activity: null,
  });

  const handleLogout = () => {
    setSuccess('Logout realizado com sucesso.');
    try {
      localStorage.removeItem('token');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      const user = getUser();
      if (!user?.id) {
        setEditError('Usuário não identificado.');
        return;
      }

      const payload: Record<string, string> = {};
      if (editName.trim()) payload.name = editName;
      if (editEmail.trim()) payload.email = editEmail;
      if (editOldPassword) payload.oldPassword = editOldPassword;
      if (editNewPassword) payload.newPassword = editNewPassword;

      await api.put(`/users/${user.id}`, payload);

      const updates: Partial<User> = {};
      if (editName.trim()) updates.name = editName;
      if (editEmail.trim()) updates.email = editEmail;
      updateUser(updates);

      setSuccess('Perfil atualizado com sucesso!');
      setEditName('');
      setEditEmail('');
      setEditOldPassword('');
      setEditNewPassword('');
      setShowEditProfile(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const error = err as {
        response?: { status: number; data?: string };
        message?: string;
      };
      if (error?.response?.status === 400) {
        setEditError(error.response.data ?? 'Requisição inválida.');
      } else {
        if (import.meta.env.DEV) {
          setEditError(
            `Erro ao atualizar perfil: ${error?.message ?? 'Erro desconhecido'}`
          );
        } else {
          setEditError('Erro ao atualizar perfil. Tente novamente.');
        }
      }
    } finally {
      setEditLoading(false);
    }
  };

  const goalTypeLabels: Record<GoalType, string> = {
    sleep: 'sono',
    water: 'água',
    activity: 'atividade física',
  };

  const openGoalModal = (goalType: GoalType) => {
    console.log('Opening goal modal for:', goalType);
    setGoalModalError(null);
    setActiveGoalType(goalType);
    setShowGoalHistory(true);
    setEditingGoalId(null);
    console.log('Modal state set - showGoalHistory:', true, 'activeGoalType:', goalType);
  };

  const closeGoalHistory = () => {
    setShowGoalHistory(false);
    setActiveGoalType(null);
  };

  const openGoalForm = () => {
    setShowGoalHistory(false);
    setShowGoalForm(true);
  };

  const closeGoalForm = () => {
    setShowGoalForm(false);
    setGoalModalError(null);
    setEditingGoalId(null);
  };

  const handleEditGoal = (goal: {
    id: number;
    dailyGoal: number;
    measurementUnitId: number;
    weeklyFrequency: number;
  }) => {
    console.log('Edit goal:', goal);
    
    if (!activeGoalType) return;
    
    // Salvar ID da meta sendo editada
    setEditingGoalId(goal.id);
    
    // Pré-preencher o formulário com os dados da meta
    setCurrentGoals((prev) => ({
      ...prev,
      [activeGoalType]: {
        value: goal.dailyGoal.toString(),
        measurementUnitId: goal.measurementUnitId,
        weeklyFrequency: goal.weeklyFrequency.toString(),
      },
    }));
    
    setShowGoalHistory(false);
    setShowGoalForm(true);
  };

  const handleSaveGoal = async (goal: GoalValue, habitId: number) => {
    if (!activeGoalType) return;

    const user = getUser();
    if (!user) {
      setGoalModalError('Usuário não identificado. Faça login novamente.');
      return;
    }

    setGoalModalLoading(true);
    setGoalModalError(null);

    try {
      const payload = {
        userId: user.id,
        habitId: habitId,
        measurementUnitId: goal.measurementUnitId,
        dailyGoal: parseFloat(goal.value.replace(',', '.')),
        weeklyFrequency: parseInt(goal.weeklyFrequency),
      };

      if (editingGoalId) {
        // Atualizar meta existente
        await api.put(`/user-habits/${editingGoalId}`, payload);
        setSuccess(
          `Meta de ${goalTypeLabels[activeGoalType]} atualizada com sucesso!`
        );
      } else {
        // Criar nova meta
        await api.post('/user-habits', payload);
        setSuccess(
          `Meta de ${goalTypeLabels[activeGoalType]} salva com sucesso!`
        );
      }

      setCurrentGoals((prev) => ({ ...prev, [activeGoalType]: goal }));
      closeGoalForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const error = err as { message?: string; response?: { status: number } };

      if (error?.response?.status === 401 || error?.response?.status === 403) {
        setGoalModalError(
          'Sessão expirada ou sem permissão. Faça login novamente.'
        );
      } else {
        setGoalModalError(
          error?.message ?? 'Erro ao salvar meta. Tente novamente.'
        );
      }
    } finally {
      setGoalModalLoading(false);
    }
  };

  return (
    <>
      <MainLayout activePage="settings">
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <SettingsIcon size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Configurações
            </h1>
          </div>
          <p className="text-gray-600 ml-16">Personalize sua experiência no Habitus</p>
        </div>

      {/* Seção 1: Minha Conta */}
      <div className="card-theme overflow-hidden mb-8 animate-fade-in-up">
        <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-8 py-6 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <User size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Minha Conta</h3>
              <p className="text-white/80 text-sm mt-1">Gerencie suas informações de perfil</p>
            </div>
          </div>
        </div>
        <div className="p-6">
        <ul className="divide-y divide-gray-200">
          <li
            onClick={() => {
              const user = getUser();
              if (user?.name) setEditName(user.name);
              if (user?.email) setEditEmail(user.email);
              setShowEditProfile(true);
            }}
            className="py-5 flex justify-between items-center hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 -mx-6 px-6 cursor-pointer transition-all rounded-lg group"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors">
                <User size={20} />
              </div>
              <span className="font-semibold text-gray-800">Meu perfil</span>
            </div>
            <span className="text-gray-400 group-hover:text-blue-600 transition-colors">›</span>
          </li>
        </ul>
        </div>
      </div>

      {/* Seção 2: Minhas Metas */}
      <div className="card-theme overflow-hidden mb-8 animate-fade-in-up">
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-8 py-6 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Target size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Minhas Metas</h3>
              <p className="text-white/80 text-sm mt-1">Defina e ajuste suas metas de saúde e bem-estar</p>
            </div>
          </div>
        </div>
        <div className="p-6">
        <ul className="space-y-3">
          <li
            onClick={() => openGoalModal('sleep')}
            className="py-5 flex justify-between items-center hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 -mx-6 px-6 cursor-pointer transition-all rounded-lg group border-2 border-transparent hover:border-indigo-200"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <Moon size={20} />
              </div>
              <span className="font-semibold text-gray-800">Meta Sono</span>
            </div>
            <span className="text-gray-400 group-hover:text-indigo-600 transition-colors">›</span>
          </li>
          <li
            onClick={() => openGoalModal('water')}
            className="py-5 flex justify-between items-center hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 -mx-6 px-6 cursor-pointer transition-all rounded-lg group border-2 border-transparent hover:border-cyan-200"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-cyan-100 text-cyan-600 rounded-lg group-hover:bg-cyan-200 transition-colors">
                <Droplet size={20} />
              </div>
              <span className="font-semibold text-gray-800">Meta Água</span>
            </div>
            <span className="text-gray-400 group-hover:text-cyan-600 transition-colors">›</span>
          </li>
          <li
            onClick={() => openGoalModal('activity')}
            className="py-5 flex justify-between items-center hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 -mx-6 px-6 cursor-pointer transition-all rounded-lg group border-2 border-transparent hover:border-orange-200"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Activity size={20} />
              </div>
              <span className="font-semibold text-gray-800">
                Meta Atividade Física
              </span>
            </div>
            <span className="text-gray-400 group-hover:text-orange-600 transition-colors">›</span>
          </li>
        </ul>
        </div>
      </div>

      {/* Botão de Sair */}
      {success && (
        <div className="rounded-xl border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-4 text-sm text-green-700 shadow-lg mb-6 animate-fade-in-up" role="status">
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-green-500" />
            <span className="font-semibold">{success}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-xl hover:from-red-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl active:scale-[.98] flex items-center justify-center gap-3"
      >
        <LogOut size={20} />
        <span>Sair da Conta</span>
      </button>
    </MainLayout>

    {/* Modais fora do MainLayout */}
    {activeGoalType && showGoalHistory && (
      <GoalHistoryModal
        isOpen={showGoalHistory}
        goalType={activeGoalType}
        habitId={activeGoalType === 'sleep' ? 2 : activeGoalType === 'water' ? 1 : 3}
        onClose={closeGoalHistory}
        onAddNew={openGoalForm}
        onEdit={handleEditGoal}
        getUser={getUser}
      />
    )}

    {activeGoalType && showGoalForm && (
      <GoalModal
        isOpen={showGoalForm}
        goalType={activeGoalType}
        currentGoal={currentGoals[activeGoalType]}
        loading={goalModalLoading}
        errorMessage={goalModalError}
        isEditing={editingGoalId !== null}
        onClose={closeGoalForm}
        onSave={handleSaveGoal}
      />
    )}

    <ProfileModal
      isOpen={showEditProfile}
      editName={editName}
      editEmail={editEmail}
      editOldPassword={editOldPassword}
      editNewPassword={editNewPassword}
      editError={editError}
      editLoading={editLoading}
      onNameChange={setEditName}
      onEmailChange={setEditEmail}
      onOldPasswordChange={setEditOldPassword}
      onNewPasswordChange={setEditNewPassword}
      onSubmit={handleEditProfile}
      onClose={() => {
        setShowEditProfile(false);
        setEditError(null);
        setEditName('');
        setEditEmail('');
        setEditOldPassword('');
        setEditNewPassword('');
      }}
    />
    </>
  );
}

export default Settings;
