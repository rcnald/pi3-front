import { useState } from 'react';
import { Dashboard, SignUp, Login, History, Settings } from './pages';

type PageType = 'signup' | 'login' | 'dashboard' | 'history' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'signup':
        return <SignUp />;
      case 'login':
        return <Login />;
      case 'dashboard':
        return <Dashboard />;
      case 'history':
        return <History />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  // Navegação temporária para testar as páginas
  // Remova esta seção quando implementar React Router
  const showNavigation = !['signup', 'login'].includes(currentPage);

  return (
    <div>
      {showNavigation && (
        <div className="fixed top-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg border">
          <p className="text-sm font-medium mb-2">Navegação de Teste:</p>
          <div className="space-y-1">
            <button onClick={() => setCurrentPage('signup')} className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded">
              Sign Up
            </button>
            <button onClick={() => setCurrentPage('login')} className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded">
              Login
            </button>
            <button onClick={() => setCurrentPage('dashboard')} className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded">
              Dashboard
            </button>
            <button onClick={() => setCurrentPage('history')} className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded">
              Histórico
            </button>
            <button onClick={() => setCurrentPage('settings')} className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded">
              Configurações
            </button>
          </div>
        </div>
      )}
      {renderPage()}
    </div>
  );
}

export default App
