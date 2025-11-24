import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react';

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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
      <header className="flex justify-between items-center p-6 md:p-10 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg shadow-lg">
            <Sparkles size={24} className="text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Habitus</span>
        </div>
        <a
          href="/signup"
          className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-md hover:shadow-lg"
        >
          Cadastrar
        </a>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-10 max-w-md w-full text-center animate-scale-in border border-white/20">
          <div className="mb-6">
            <div className="inline-flex p-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl shadow-lg mb-4">
              <LogIn size={40} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Bem-vindo de volta!
          </h2>
          <p className="text-gray-600 mb-8">
            Faça login para continuar na sua jornada Habitus.
          </p>

          <form onSubmit={handleSubmit} className="text-left space-y-5">
            <div>
              <label
                htmlFor="email"
                className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"
              >
                <Mail size={16} className="text-cyan-600" />
                Endereço de e-mail
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                id="email"
                placeholder="seu.email@exemplo.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"
              >
                <Lock size={16} className="text-cyan-600" />
                Palavra-passe
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                id="password"
                placeholder="Insira a sua palavra-passe"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              />
            </div>

            {error && (
              <div className="rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm" role="alert">
                <div className="flex items-center gap-2">
                  <span className="text-red-500 font-bold">⚠</span>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Entrar
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-sm text-gray-600">
            Não tem uma conta?
            <a
              href="/signup"
              className="font-bold text-cyan-600 hover:underline ml-1"
            >
              Registre-se
            </a>
          </p>
        </div>
      </main>

      <footer className="text-center p-6 text-sm text-gray-500 animate-fade-in-up">
        <p>© 2025. Habitus. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default Login;
