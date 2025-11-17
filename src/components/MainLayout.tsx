import type { ReactNode } from 'react';
// import { Link, NavLink } from 'react-router-dom';
// import { Bell, User, LayoutDashboard, LineChart, Settings } from 'lucide-react'; // Exemplo de ícones

// Tipagem das props
interface MainLayoutProps {
  children: ReactNode;
  activePage: 'objetivos' | 'progresso' | 'configuracoes';
}

// Map para facilitar a navegação (melhor que if/else)
const navItems = [
  { id: 'objetivos', name: 'Objetivos', path: '/' }, // icon: LayoutDashboard
  { id: 'progresso', name: 'Progresso', path: '/history' }, // icon: LineChart
  { id: 'configuracoes', name: 'Configurações', path: '/settings' }, // icon: Settings
];

function MainLayout({ children, activePage }: MainLayoutProps) {
  
  // Função para classes ativas (CSS-in-JS do Tailwind)
  const getNavLinkClass = (page: string) => {
    const baseClass = "flex items-center gap-3 px-5 py-4 rounded-lg font-medium transition-colors";
    if (page === activePage) {
      return `${baseClass} bg-white text-gray-900 shadow-sm`;
    }
    return `${baseClass} text-gray-600 hover:bg-gray-200/50`;
  };

  return (
    <div className="flex h-screen bg-white">
      {/* 1. Sidebar (Menu Lateral) */}
      <nav className="w-64 bg-gray-50 border-r border-gray-200 p-6 flex flex-col">
        <div className="text-2xl font-bold text-cyan-600 mb-10">Habitus</div>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              {/* Troque 'a' por 'NavLink' do react-router-dom */}
              <a href={item.path} className={getNavLinkClass(item.id)}>
                {/* <item.icon size={20} /> */}
                <span>{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* 2. Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Barra do Topo */}
        <header className="h-[70px] border-b border-gray-200 flex justify-end items-center px-8">
          <div className="flex items-center gap-4">
            {/* <Bell size={20} className="text-gray-500 cursor-pointer" /> */}
            <span className="text-gray-500">🔔</span> {/* Placeholder Ícone */}
            <img 
              src="https://i.pravatar.cc/40" // Placeholder
              alt="Avatar do usuário" 
              className="w-10 h-10 rounded-full cursor-pointer" 
            />
          </div>
        </header>
        
        {/* Conteúdo da Página */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-10">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
