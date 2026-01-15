import { useState, useEffect } from 'react';
import { Button } from '@shared/ui';
import { USER_ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS } from '@shared/constants';
import type { User, Role } from '@/shared/types/user-management.types';

interface ModalEditUserRoleProps {
  isOpen: boolean;
  user: User | null;
  onSave: (userId: string, data: { role: Role }) => Promise<void>;
  onClose: () => void;
}

export function ModalEditUserRole({ isOpen, user, onSave, onClose }: ModalEditUserRoleProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
      setError(null);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSave = async (): Promise<void> => {
    if (!selectedRole) {
      setError('Por favor selecciona un rol');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(user.id, { role: selectedRole });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el rol');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-secondary border-2 border-primary/20 rounded-lg p-6 max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">👑 Cambiar Rol</h2>
          <p className="text-sm text-foreground-secondary">
            Cambia el rol para {user.name || 'este usuario'}
          </p>
        </div>

        {/* User Info */}
        <div className="bg-base rounded-lg p-4 mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground-secondary">Nombre:</span>
            <span className="font-semibold text-foreground">{user.name || 'Sin nombre'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground-secondary">Email:</span>
            <span className="font-semibold text-foreground">{user.email || 'Sin email'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground-secondary">Rol actual:</span>
            <span className="font-semibold text-foreground capitalize">{user.role}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-error/20 border border-error text-error p-3 rounded mb-4 text-sm">
            ❌ {error}
          </div>
        )}

        {/* Role Selection */}
        <div className="mb-6 space-y-2">
          <label className="block text-sm font-semibold text-foreground mb-3">
            Nuevo Rol *
          </label>
          {USER_ROLES.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                selectedRole === role
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-base bg-base text-foreground-secondary hover:border-primary/50'
              }`}
            >
              <div className="font-semibold">{ROLE_LABELS[role]}</div>
              <div className="text-xs text-foreground-tertiary mt-1">
                {ROLE_DESCRIPTIONS[role]}
              </div>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="sameUi"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
            disabled={!selectedRole || selectedRole === user.role}
            className="flex-1"
          >
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
}
