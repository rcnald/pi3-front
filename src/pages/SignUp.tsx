import { useState } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
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
    } catch (err: unknown) {
      const error = err as {
        response?: { status: number; data?: { erro?: string } };
        message?: string;
      };
      if (error?.response?.status === 400) {
        setError(error.response.data?.erro ?? 'Requisição inválida.');
      } else {
        if (import.meta.env.DEV) {
          setError(
            `Erro ao cadastrar: ${error?.message ?? 'Erro desconhecido'}`
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
          href="/login"
          className="font-medium text-gray-700 hover:text-cyan-600"
        >
          Entrar
        </a>
        {/* <Link to="/login" className="font-medium text-gray-700 hover:text-cyan-600">Entrar</Link> */}
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="card-soft p-8 md:p-10 max-w-md w-full text-center animate-scale-in">
          <h2 className="text-3xl font-semibold text-gray-800 mb-2">
            Cadastre-se para o Habitus
          </h2>
          <p className="text-gray-600 mb-8">
            Comece sua jornada de bem-estar hoje.
          </p>

          <form onSubmit={handleSubmit} className="text-left space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nome
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                id="name"
                placeholder="Seu nome completo"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
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
                Senha
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                id="password"
                placeholder="Mínimo 8 caracteres"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600" role="alert">
                {error}
              </div>
            )}

            {createdUser && (
              <div className="text-sm text-green-600" role="status">
                Conta criada com sucesso! ID: {createdUser.id}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full py-3 ${
                loading ? 'opacity-70' : ''
              }`}
            >
              {loading ? 'Criando...' : 'Criar Conta'}
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

      {/* Rodapé */}
      <footer className="text-center p-6 text-sm text-gray-500 animate-fade-in-up">
        <p>© 2025. Habitus. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default SignUp;
