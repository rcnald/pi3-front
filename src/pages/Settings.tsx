import MainLayout from '../components/MainLayout';
// import { User, Bell, Moon, Droplet, Activity, ChevronRight, LogOut } from 'lucide-react'; // Exemplo de ícones

function Settings() {
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
          <li className="py-4 flex justify-between items-center hover:bg-gray-50 -mx-8 px-8 cursor-pointer">
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
      <button className="flex items-center gap-3 px-5 py-3 rounded-lg font-bold text-red-600 bg-red-100 hover:bg-red-200 transition-colors">
        {/* <LogOut size={20} /> */}
        <span>Sair da Conta</span>
      </button>
      
    </MainLayout>
  );
}

export default Settings;
