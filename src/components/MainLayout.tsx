import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, LogOut } from 'lucide-react';

const navItems = [
  { id: 'goals', name: 'Atividades', path: '/', emoji: '🎯' },
  { id: 'progress', name: 'Progresso', path: '/history', emoji: '📈' },
  { id: 'settings', name: 'Configurações', path: '/settings', emoji: '⚙️' },
];

function MainLayout({ children, activePage }: MainLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [isMenuOpen]);

  const getNavLinkClass = (page: string) => {
    const baseClass =
      'flex items-center gap-3 px-5 py-4 rounded-lg font-medium transition-all';
    if (page === activePage) {
      return `${baseClass} bg-white text-gray-900 shadow-md`;
    }
    return `${baseClass} text-gray-700 hover:bg-stone-200/70 hover:shadow-sm`;
  };

  return (
    <div className="flex min-h-screen bg-white">
      <nav className="hidden md:flex md:w-64 bg-gradient-to-b from-stone-200 via-stone-100 to-zinc-50 border-r border-stone-300 p-6 flex-col shadow-lg">
        <div className="text-2xl font-bold text-cyan-600 mb-10">Habitus</div>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={getNavLinkClass(item.id)}
                onClick={() => navigate(item.path)}
              >
                <span className="text-xl">{item.emoji}</span>
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsSidebarOpen(false)}
          />
          <nav className="relative z-50 w-64 h-full bg-gradient-to-b from-stone-200 via-stone-100 to-zinc-50 border-r border-stone-300 p-6 flex flex-col shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <div className="text-2xl font-bold text-cyan-600">Habitus</div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded hover:bg-gray-500/50 transition-all"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.path}
                    className={getNavLinkClass(item.id)}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span>{item.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-[70px] bg-gradient-to-r from-stone-200 via-stone-100 to-zinc-50 border-b border-stone-300 flex items-center justify-between px-4 sm:px-6 md:px-8 shadow-sm">
          <button
            className="md:hidden p-2 rounded hover:bg-stone-200 transition-all"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <div className="flex-1" />
          
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-stone-200 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
            >
              <User className="text-gray-700" size={20} />
            </button>

            {isMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-sm font-medium text-gray-900">Minha Conta</p>
                  <p className="text-xs text-gray-500 mt-0.5">Gerencie sua conta</p>
                </div>

                <div className="py-1.5">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    role="menuitem"
                  >
                    <User size={18} className="text-gray-500" />
                    <span>Meu Perfil</span>
                  </button>

                  <div className="my-1.5 border-t border-gray-100" />

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    role="menuitem"
                  >
                    <LogOut size={18} />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Conteúdo da Página */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-stone-200/80 via-stone-100/90 to-zinc-50 p-4 sm:p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;