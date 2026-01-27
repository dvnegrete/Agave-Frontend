import { useState } from 'react';
import { Modal, Button, InfoCard } from '@shared/ui';
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
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteUser = async (): Promise<void> => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await onDeleteUser();
      setShowDeleteConfirm(false);
      onClose();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Error desconocido al eliminar el usuario';
      setDeleteError(errorMessage);
      console.error('Error deleting user:', err);
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

  if (!isOpen || !user) return null;

  return (
    <>
      <Modal title="¿Qué deseas editar?" isOpen={isOpen} onClose={onClose}>
        <p className="text-sm text-foreground-secondary mb-4">
          Selecciona una acción
        </p>

        <InfoCard
          items={[
            {
              label: 'Usuario:',
              value: user.name,
            },
            {
              label: 'Email:',
              value: user.email,
            },
          ]}
        />

        <div className="space-y-3 mb-6">
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

        <div className="flex gap-3 justify-end">
          <Button variant="sameUi" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
          <div className="bg-secondary border-2 border-error rounded-lg p-8 max-w-md w-full shadow-xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-error mb-2">Eliminar Usuario</h2>
              <p className="text-foreground-secondary mb-4">
                ¿Estás seguro de que deseas eliminar a <span className="font-semibold text-foreground">{user.name}</span>?
              </p>
              <p className="text-sm text-error mb-2">Esta acción es irreversible.</p>
              <p className="text-sm text-foreground-secondary">
                Nota: Primero debes remover todas las casas asignadas al usuario.
              </p>
            </div>

            {deleteError && (
              <div className="border-l-4 border-error rounded px-4 py-3 mb-6">
                <p className="text-error text-sm">{deleteError}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button
                variant="sameUi"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                variant="error"
                onClick={handleDeleteUser}
                disabled={isDeleting}
                isLoading={isDeleting}
              >
                🗑️ Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
