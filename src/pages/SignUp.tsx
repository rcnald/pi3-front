import { useState } from 'react';
import { api } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, Sparkles } from 'lucide-react';

function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const resp = await api.post<CreatedUser>('/users', {
        name,
        email,
        password,
      });
      setCreatedUser(resp.data);
      setName('');
      setEmail('');
      setPassword('');
      setError(null);
      navigate('/login');
    } catch (err: unknown) {
      const error = err as {
        response?: {
          status: number;
          data?: { erro?: string; message?: string };
        };
        message?: string;
      };
      if (error?.response?.status === 400) {
        setError(error.response.data?.erro ?? 'Requisição inválida.');
      } else {
        if (import.meta.env.DEV) {
          setError(`${error?.response?.data?.message ?? 'Erro desconhecido'}`);
        } else {
          setError('Erro inesperado. Tente novamente mais tarde.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <header className="flex justify-between items-center p-6 md:p-10 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg shadow-lg">
            <Sparkles size={24} className="text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Habitus</span>
        </div>
        <a
          href="/login"
          className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-lg hover:from-violet-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
        >
          Entrar
        </a>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-10 max-w-md w-full text-center animate-scale-in border border-white/20">
          <div className="mb-6">
            <div className="inline-flex p-4 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl shadow-lg mb-4">
              <UserPlus size={40} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Cadastre-se para o Habitus
          </h2>
          <p className="text-gray-600 mb-8">
            Comece sua jornada de bem-estar hoje.
          </p>

          <form onSubmit={handleSubmit} className="text-left space-y-5">
            <div>
              <label
                htmlFor="name"
                className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"
              >
                <User size={16} className="text-violet-600" />
                Nome
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                id="name"
                placeholder="Seu nome completo"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"
              >
                <Mail size={16} className="text-violet-600" />
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                id="email"
                placeholder="seu.email@exemplo.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"
              >
                <Lock size={16} className="text-violet-600" />
                Senha
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                id="password"
                placeholder="Mínimo 8 caracteres"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
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

            {createdUser && (
              <div className="rounded-xl border-2 border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700 shadow-sm" role="status">
                <div className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span className="font-medium">Conta criada com sucesso! ID: {createdUser.id}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold rounded-xl hover:from-violet-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Criando...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Criar Conta
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-sm text-gray-600">
            Já tem uma conta?
            <Link
              to="/login"
              className="font-bold text-cyan-600 hover:underline ml-1"
            >
              Entrar
            </Link>
          </p>
        </div>
      </main>

      <footer className="text-center p-6 text-sm text-gray-500 animate-fade-in-up">
        <p>© 2025. Habitus. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default SignUp;
