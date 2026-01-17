import { Modal } from '@shared/ui';
import type { User } from '@/shared';

interface ModalEditActionsProps {
  isOpen: boolean;
  user: User | null;
  onSelectRole: () => void;
  onSelectStatus: () => void;
  onSelectObservations: () => void;
  onSelectHouse: () => void;
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
  onClose,
}: ModalEditActionsProps) {
  const actions: ActionOption[] = [
    {
      id: 'role',
      label: 'Editar Rol',
      description: 'Cambiar el rol del usuario (admin, propietario, inquilino)',
      icon: '👤',
      color: 'bg-primary/20 hover:bg-primary/30 border-primary',
    },
    {
      id: 'status',
      label: 'Editar Estado',
      description: 'Cambiar el estado del usuario (activo, suspendido, inactivo)',
      icon: '⚙️',
      color: 'bg-success/20 hover:bg-success/30 border-success',
    },
    {
      id: 'observations',
      label: 'Editar Observaciones',
      description: 'Agregar o modificar notas sobre el usuario',
      icon: '📝',
      color: 'bg-info/20 hover:bg-info/30 border-info',
    },
    {
      id: 'house',
      label: 'Gestionar Casas',
      description: 'Asignar o remover casas del usuario',
      icon: '🏠',
      color: 'bg-warning/20 hover:bg-warning/30 border-warning',
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
                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-lg">{action.label}</h3>
                  <p className="text-sm text-foreground-secondary mt-1">
                    {action.description}
                  </p>
                </div>
                <span className="text-2xl flex-shrink-0">→</span>
              </div>
            </button>
          ))}
        </div>

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
