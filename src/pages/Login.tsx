import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Por favor, preencha e-mail e senha.');
      return;
    }

    setLoading(true);
    try {
      const user = await api.post<User | null>('/users/auth', {
        email,
        password,
      });

      if (user === null || user === undefined) {
        setError('Usuário ou senha inválidos.');
        return;
      }

      login(user);
      navigate('/');
    } catch (err: unknown) {
      const error = err as {
        response?: { status: number; data?: { erro?: string } };
        message?: string;
      };
      if (error?.response?.status === 401 || error?.response?.status === 404) {
        setError('Usuário ou senha inválidos.');
      } else {
        if (import.meta.env.DEV) {
          setError(
            `Erro ao fazer login: ${error?.message ?? 'Erro desconhecido'}`
          );
        } else {
          setError('Erro inesperado. Tente novamente mais tarde.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-app bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Cabeçalho */}
      <header className="flex justify-between items-center p-6 md:p-10 animate-fade-in-up">
        <span className="text-2xl font-bold text-cyan-600">Habitus</span>
        <a
          href="/signup"
          className="font-medium text-gray-700 hover:text-cyan-600"
        >
          Cadastrar
        </a>
        {/* <Link to="/signup" className="font-medium text-gray-700 hover:text-cyan-600">Cadastrar</Link> */}
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="card-soft p-8 md:p-10 max-w-md w-full text-center animate-scale-in">
          <h2 className="text-3xl font-semibold text-gray-800 mb-2">
            Bem-vindo de volta!
          </h2>
          <p className="text-gray-600 mb-8">
            Faça login para continuar na sua jornada Habitus.
          </p>

          <form onSubmit={handleSubmit} className="text-left space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
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
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Palavra-passe
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full py-3 ${
                loading ? 'opacity-70' : ''
              }`}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <a
            href="#"
            className="block text-sm font-bold text-cyan-600 hover:underline mt-6 transition-colors"
          >
            Esqueceu a palavra-passe?
          </a>

          <p className="mt-8 text-sm text-gray-600">
            Não tem uma conta?
            <a
              href="/signup"
              className="font-bold text-cyan-600 hover:underline ml-1"
            >
              Registe-se
            </a>
            {/* <Link to="/signup" className="font-bold text-cyan-600 hover:underline ml-1">Registe-se</Link> */}
          </p>
        </div>
      </main>

      {/* Rodapé (Opcional, não está na tela de login mas estava na de cadastro) */}
      <footer className="text-center p-6 text-sm text-gray-500 animate-fade-in-up">
        <p>© 2025. Habitus. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default Login;
