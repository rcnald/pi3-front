import { useState } from 'react';
import { api } from '../services/api';

// import { Link } from 'react-router-dom';

type LoginResponse = {
  token: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
  };
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<LoginResponse['usuario'] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Por favor, preencha e-mail e senha.');
      return;
    }

    setLoading(true);
    try {
      const resp = await api.post<LoginResponse>('/users/auth', {
        email,
        password,
      });

      const data = resp.data;
      try {
        localStorage.setItem('token', data.token);
      } catch (e) {
        // ignore
      }
      setUsuario(data.usuario);
      setEmail('');
      setSenha('');
      setError(null);
    } catch (err: unknown) {
      const error = err as { response?: { status: number; data?: { erro?: string } }; message?: string };
      if (error?.response?.status === 401) {
        setError(error.response.data?.erro ?? 'Usuário ou senha inválidos.');
      } else {
        if (import.meta.env.DEV) {
          setError(`Erro ao fazer login: ${error?.message ?? 'Erro desconhecido'}`);
        } else {
          setError('Erro inesperado. Tente novamente mais tarde.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Cabeçalho */}
      <header className="flex justify-between items-center p-6 md:p-10">
        <span className="text-2xl font-bold text-cyan-600">Habitus</span>
        <a href="/signup" className="font-medium text-gray-700 hover:text-cyan-600">
          Cadastrar
        </a>
        {/* <Link to="/signup" className="font-medium text-gray-700 hover:text-cyan-600">Cadastrar</Link> */}
      </header>
      
      {/* Conteúdo Principal */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white p-8 md:p-10 rounded-lg shadow-sm max-w-md w-full text-center">
          <h2 className="text-3xl font-semibold text-gray-800 mb-2">
            Bem-vindo de volta!
          </h2>
          <p className="text-gray-600 mb-8">
            Faça login para continuar na sua jornada Habitus.
          </p>
          
          <form onSubmit={handleSubmit} className="text-left space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Endereço de e-mail
              </label>
              <input 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email" 
                id="email" 
                placeholder="seu.email@exemplo.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Palavra-passe
              </label>
              <input 
                value={password}
                onChange={(e) => setSenha(e.target.value)}
                type="password" 
                id="password" 
                placeholder="Insira a sua palavra-passe"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600" role="alert">
                {error}
              </div>
            )}

            {usuario && (
              <div className="text-sm text-green-600" role="status">
                Entrou com sucesso! Bem-vindo, {usuario.nome} (ID: {usuario.id})
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full ${loading ? 'bg-cyan-400' : 'bg-cyan-600 hover:bg-cyan-700'} text-white py-3 rounded-md font-bold transition duration-200`}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          
          <a href="#" className="block text-sm font-bold text-cyan-600 hover:underline mt-6">
            Esqueceu a palavra-passe?
          </a>
          
          <p className="mt-8 text-sm text-gray-600">
            Não tem uma conta? 
            <a href="/signup" className="font-bold text-cyan-600 hover:underline ml-1">
              Registe-se
            </a>
            {/* <Link to="/signup" className="font-bold text-cyan-600 hover:underline ml-1">Registe-se</Link> */}
          </p>
        </div>
      </main>
      
      {/* Rodapé (Opcional, não está na tela de login mas estava na de cadastro) */}
      <footer className="text-center p-6 text-sm text-gray-500">
        <p>© 2025. Habitus. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default Login;
