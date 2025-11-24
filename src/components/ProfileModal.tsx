import { User, Mail, Lock, X, Save } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  editName: string;
  editEmail: string;
  editOldPassword: string;
  editNewPassword: string;
  editError: string | null;
  editLoading: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onOldPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function ProfileModal(props: ProfileModalProps) {
  const {
    isOpen,
    editName,
    editEmail,
    editOldPassword,
    editNewPassword,
    editError,
    editLoading,
    onNameChange,
    onEmailChange,
    onOldPasswordChange,
    onNewPasswordChange,
    onSubmit,
    onClose,
  } = props;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      />

      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-slide-up">
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-8 py-8 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                <User size={32} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  Editar Perfil
                </h3>
                <p className="text-white/80 text-sm mt-1">Atualize suas informações pessoais</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-all duration-200 active:scale-95"
              aria-label="Fechar"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-8">

        {editError && (
          <div
            className="mb-6 rounded-xl border-2 border-red-300 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm animate-shake"
            role="alert"
          >
            <div className="flex items-center gap-2">
              <span className="text-red-500 font-bold text-lg">⚠</span>
              <span className="font-medium">{editError}</span>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="rounded-xl border-2 border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-shadow">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
              <User size={16} className="text-blue-600" />
              Nome
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Deixe em branco para não alterar"
              className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2 transition-all"
            />
          </div>

          <div className="rounded-xl border-2 border-gray-200 p-6 bg-gradient-to-br from-gray-50 to-white shadow-sm hover:shadow-md transition-shadow">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
              <Mail size={16} className="text-indigo-600" />
              E-mail
            </label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="Deixe em branco para não alterar"
              className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none focus:ring-2 transition-all"
            />
          </div>

          <div className="rounded-xl border-2 border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-shadow">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
              <Lock size={16} className="text-purple-600" />
              Senha Antiga (se for alterar senha)
            </label>
            <input
              type="password"
              value={editOldPassword}
              onChange={(e) => onOldPasswordChange(e.target.value)}
              placeholder="Deixe em branco se não for alterar"
              className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 focus:outline-none focus:ring-2 transition-all"
            />
          </div>

          <div className="rounded-xl border-2 border-gray-200 p-6 bg-gradient-to-br from-gray-50 to-white shadow-sm hover:shadow-md transition-shadow">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
              <Lock size={16} className="text-purple-600" />
              Senha Nova (se for alterar senha)
            </label>
            <input
              type="password"
              value={editNewPassword}
              onChange={(e) => onNewPasswordChange(e.target.value)}
              placeholder="Deixe em branco se não for alterar"
              className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 focus:outline-none focus:ring-2 transition-all"
            />
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <X size={20} />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={editLoading}
              className="flex-1 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {editLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Salvar
                </>
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
