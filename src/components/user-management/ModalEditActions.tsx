import { useState } from 'react';
import { Modal } from '@shared/ui';
import type { User } from '@/shared';

interface ModalEditActionsProps {
  isOpen: boolean;
  user: User | null;
  onSelectRole: () => void;
  onSelectStatus: () => void;
  onSelectObservations: () => void;
  onSelectHouse: () => void;
  onDeleteUser: () => Promise<void>;
  onClose: () => void;
}

interface ActionOption {
  id: 'role' | 'status' | 'observations' | 'house';
  label: string;
  description: string;
  icon: string;
  color: string;
}

export function ModalEditActions({
  isOpen,
  user,
  onSelectRole,
  onSelectStatus,
  onSelectObservations,
  onSelectHouse,
  onDeleteUser,
  onClose,
}: ModalEditActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteUser = async (): Promise<void> => {
    setIsDeleting(true);
    try {
      await onDeleteUser();
      setShowDeleteConfirm(false);
      onClose();
    } catch (err: unknown) {
      console.error('Error deleting user:', err);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const actions: ActionOption[] = [
    {
      id: 'role',
      label: 'Editar Rol',
      description: 'Cambiar el rol del usuario (admin, propietario, inquilino)',
      icon: '👤',
      color: 'border-primary',
    },
    {
      id: 'status',
      label: 'Editar Estado',
      description: 'Cambiar el estado del usuario (activo, suspendido, inactivo)',
      icon: '⚙️',
      color: 'border-success',
    },
    {
      id: 'observations',
      label: 'Editar Observaciones',
      description: 'Agregar o modificar notas sobre el usuario',
      icon: '📝',
      color: 'border-info',
    },
    {
      id: 'house',
      label: 'Gestionar Casas',
      description: 'Asignar o remover casas del usuario',
      icon: '🏠',
      color: 'border-warning',
    },
  ];

  const handleAction = (actionId: string) => {
    switch (actionId) {
      case 'role':
        onSelectRole();
        break;
      case 'status':
        onSelectStatus();
        break;
      case 'observations':
        onSelectObservations();
        break;
      case 'house':
        onSelectHouse();
        break;
    }
  };

  return (
    <Modal title='¿Qué deseas editar?' isOpen={isOpen} onClose={onClose}>
      <div className="bg-secondary rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="border-b border-base px-6 py-4">
          <h2 className="text-lg font-bold text-foreground">
            Seleciona una acción
          </h2>
          {user && (
            <p className="text-sm text-foreground-secondary mt-1">
              Usuario: <span className="font-semibold text-primary">{user.name}</span> ({user.email})
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              className={`w-full px-4 py-4 rounded-lg border-2 transition-all text-left ${action.color}`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">{action.icon}</span>
                <div className="flex-1 text-foreground">
                  <h3 className="font-bold text-lg">{action.label}</h3>
                  <p className="text-sm text-foreground-secondary mt-1">
                    {action.description}
                  </p>
                </div>
                <span className="text-2xl flex-shrink-0">→</span>
              </div>
            </button>
          ))}

          {/* Delete User Button */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="w-full px-4 py-4 rounded-lg border-2 transition-all text-left bg-error/20 hover:bg-error/30 border-error disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl flex-shrink-0">🗑️</span>
              <div className="flex-1 text-error">
                <h3 className="font-bold text-lg">Eliminar Usuario</h3>
                <p className="text-sm mt-1">
                  Eliminar este usuario del sistema de forma permanente
                </p>
              </div>
              <span className="text-2xl flex-shrink-0">→</span>
            </div>
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
            <div className="bg-secondary border-2 border-error rounded-lg p-8 max-w-md w-full shadow-xl">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-error mb-2">Eliminar Usuario</h2>
                <p className="text-foreground-secondary mb-4">
                  ¿Estás seguro de que deseas eliminar a <span className="font-semibold text-foreground">{user?.name}</span>?
                </p>
                <p className="text-sm text-error mb-2">Esta acción es irreversible.</p>
                <p className="text-sm text-foreground-secondary">
                  Nota: Primero debes remover todas las casas asignadas al usuario.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg bg-base border border-base text-foreground hover:bg-tertiary transition-colors font-medium disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg bg-error hover:bg-error/90 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? '⏳ Eliminando...' : '🗑️ Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-base px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-base border border-base text-foreground hover:bg-tertiary transition-colors font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}
