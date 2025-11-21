interface ProfileModalProps {
  isOpen: boolean;
  editName: string;
  editOldPassword: string;
  editNewPassword: string;
  editError: string | null;
  editLoading: boolean;
  onNameChange: (value: string) => void;
  onOldPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function ProfileModal(props: ProfileModalProps) {
  const {
    isOpen,
    editName,
    editOldPassword,
    editNewPassword,
    editError,
    editLoading,
    onNameChange,
    onOldPasswordChange,
    onNewPasswordChange,
    onSubmit,
    onClose,
  } = props;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/40">
      <div className="card-soft p-8 shadow-lg max-w-md w-full animate-scale-in bg-white">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Editar Perfil
        </h3>

        {editError && (
          <div className="text-sm text-red-600 mb-4" role="alert">
            {editError}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Novo Nome (opcional)
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Deixe em branco para não alterar"
              className="input-theme text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha Antiga (se for alterar senha)
            </label>
            <input
              type="password"
              value={editOldPassword}
              onChange={(e) => onOldPasswordChange(e.target.value)}
              placeholder="Deixe em branco se não for alterar"
              className="input-theme text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha Nova (se for alterar senha)
            </label>
            <input
              type="password"
              value={editNewPassword}
              onChange={(e) => onNewPasswordChange(e.target.value)}
              placeholder="Deixe em branco se não for alterar"
              className="input-theme text-gray-900"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={editLoading}
              className={`flex-1 py-2 rounded-md font-bold text-white ${
                editLoading ? 'bg-cyan-400' : 'bg-cyan-600 hover:bg-cyan-700'
              } transition`}
            >
              {editLoading ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-md font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
