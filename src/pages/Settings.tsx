import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import MainLayout from '../components/MainLayout';
import GoalModal, {
  type GoalType,
  type GoalValue,
} from '../components/GoalModal';
import { ProfileModal } from '../components/ProfileModal';
import { useAuth } from '../hooks/useAuth';
import { useHabits } from '../hooks';
// import { User, Bell, Moon, Droplet, Activity, ChevronRight, LogOut } from 'lucide-react'; // Exemplo de ícones

function Settings() {
  const navigate = useNavigate();
  const { getUser } = useAuth();
  const { habits, loading: habitsLoading, error: habitsError } = useHabits();
  const [success, setSuccess] = useState<string | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editOldPassword, setEditOldPassword] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const [activeGoalType, setActiveGoalType] = useState<GoalType | null>(null);
  const [goalModalError, setGoalModalError] = useState<string | null>(null);
  const [goalModalLoading, setGoalModalLoading] = useState(false);
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
      const payload: Record<string, string> = {};
      if (editName.trim()) payload.nome = editName;
      if (editOldPassword) payload.senha_antiga = editOldPassword;
      if (editNewPassword) payload.senha_nova = editNewPassword;

      const resp = await api.put<ProfileResponse>('/perfil', payload);
      setSuccess(`Profile updated successfully! New name: ${resp.data.name}`);
      setEditName('');
      setEditOldPassword('');
      setEditNewPassword('');
      setShowEditProfile(false);
    } catch (err: unknown) {
      const error = err as {
        response?: { status: number; data?: { erro?: string } };
        message?: string;
      };
      if (error?.response?.status === 400) {
        setEditError(error.response.data?.erro ?? 'Invalid request.');
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
    setGoalModalError(null);
    setActiveGoalType(goalType);
  };

  const closeGoalModal = () => {
    setActiveGoalType(null);
    setGoalModalError(null);
  };

  const handleSaveGoal = async (goal: GoalValue) => {
    if (!activeGoalType) return;

    const user = getUser();
    if (!user) {
      setGoalModalError('Usuário não identificado. Faça login novamente.');
      return;
    }

    if (habitsLoading) {
      setGoalModalError('Carregando hábitos...');
      return;
    }

    if (habitsError) {
      setGoalModalError('Erro ao carregar hábitos.');
      return;
    }

    // Mapeamento temporário de IDs de hábitos (ajuste conforme seu banco de dados)
    const habitIds: Record<GoalType, number> = {
      sleep: 2,
      water: 1,
      activity: 3,
    };

    const habitId = habitIds[activeGoalType];
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) {
      setGoalModalError('Hábito não encontrado.');
      return;
    }

    setGoalModalLoading(true);
    setGoalModalError(null);

    try {
      const payload = {
        userId: user.id,
        habitId: habitId,
        dailyGoal: goal.value,
        unit: goal.unit,
        weeklyFrequency: goal.weeklyFrequency,
        startDate: new Date().toISOString().split('T')[0],
      };

      await api.post('/user-habits', payload);

      setCurrentGoals((prev) => ({ ...prev, [activeGoalType]: goal }));
      setSuccess(
        `Meta de ${goalTypeLabels[activeGoalType]} salva com sucesso!`
      );
      closeGoalModal();
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
    <MainLayout activePage="settings">
      <h1 className="text-3xl font-semibold text-gray-800 mb-8 animate-fade-in-up">
        Configurações
      </h1>

      {/* Seção 1: Minha Conta */}
      <div className="card-theme p-8 mb-8 animate-fade-in-up card-header-accent">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Minha Conta
        </h3>
        <p className="text-gray-600 text-sm mb-6">
          Gerencie suas informações de perfil.
        </p>
        <ul className="divide-y divide-gray-200">
          <li
            onClick={() => {
              const user = getUser();
              if (user?.name) setEditName(user.name);
              setShowEditProfile(true);
            }}
            className="py-4 flex justify-between items-center hover:bg-gray-50 -mx-8 px-8 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              {/* <User className="text-gray-500" /> */}
              <span className="font-medium text-gray-700">Meu perfil</span>
            </div>
            {/* <ChevronRight className="text-gray-400" /> */}
            <span>&gt;</span>
          </li>
        </ul>
      </div>

      {/* Seção 2: Minhas Metas */}
      <div className="card-theme p-8 mb-8 animate-fade-in-up card-header-accent">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Minhas Metas
        </h3>
        <p className="text-gray-600 text-sm mb-6">
          Defina e ajuste suas metas de saúde e bem-estar.
        </p>
        <ul className="divide-y divide-gray-200">
          <li
            onClick={() => openGoalModal('sleep')}
            className="py-4 flex justify-between items-center hover:bg-gray-50 -mx-8 px-8 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              {/* <Moon className="text-gray-500" /> */}
              <span className="font-medium text-gray-700">Meta Sono</span>
            </div>
            <span>&gt;</span>
          </li>
          <li
            onClick={() => openGoalModal('water')}
            className="py-4 flex justify-between items-center hover:bg-gray-50 -mx-8 px-8 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              {/* <Droplet className="text-gray-500" /> */}
              <span className="font-medium text-gray-700">Meta Água</span>
            </div>
            <span>&gt;</span>
          </li>
          <li
            onClick={() => openGoalModal('activity')}
            className="py-4 flex justify-between items-center hover:bg-gray-50 -mx-8 px-8 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              {/* <Activity className="text-gray-500" /> */}
              <span className="font-medium text-gray-700">
                Meta Atividade Física
              </span>
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

      {activeGoalType && (
        <GoalModal
          isOpen
          goalType={activeGoalType}
          currentGoal={currentGoals[activeGoalType]}
          loading={goalModalLoading}
          errorMessage={goalModalError}
          onClose={closeGoalModal}
          onSave={handleSaveGoal}
        />
      )}

      <ProfileModal
        isOpen={showEditProfile}
        editName={editName}
        editOldPassword={editOldPassword}
        editNewPassword={editNewPassword}
        editError={editError}
        editLoading={editLoading}
        onNameChange={setEditName}
        onOldPasswordChange={setEditOldPassword}
        onNewPasswordChange={setEditNewPassword}
        onSubmit={handleEditProfile}
        onClose={() => {
          setShowEditProfile(false);
          setEditError(null);
          setEditName('');
          setEditOldPassword('');
          setEditNewPassword('');
        }}
      />

      <button onClick={handleLogout} className="btn-logout active:scale-[.98]">
        {/* <LogOut size={20} /> */}
        <span>Sair da Conta</span>
      </button>
    </MainLayout>
  );
}

export default Settings;
