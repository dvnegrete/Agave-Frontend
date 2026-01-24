import { useState, useEffect } from 'react';
import { Modal, ErrorAlert, ModalActions, InfoCard } from '@shared/ui';
import { USER_ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS, MODAL_MESSAGES } from '@shared';
import type { User, Role } from '@/shared';

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
      setError(MODAL_MESSAGES.ERRORS.REQUIRED_ROLE);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(user.id, { role: selectedRole });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : MODAL_MESSAGES.ERRORS.SAVE_FAILED);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={MODAL_MESSAGES.EDIT_ROLE.TITLE}
      maxWidth="sm"
    >
      <p className="text-sm text-foreground-secondary mb-6">
        {MODAL_MESSAGES.EDIT_ROLE.DESCRIPTION} {user.name || 'este usuario'}
      </p>

      <InfoCard
        items={[
          {
            label: 'Nombre:',
            value: user.name || 'Sin nombre',
          },
          {
            label: 'Email:',
            value: user.email || 'Sin email',
          },
          {
            label: 'Rol actual:',
            value: user.role,
          },
        ]}
      />

      <ErrorAlert message={error} />

      <div className="mb-6 space-y-2">
        <label className="block text-sm font-semibold text-foreground mb-3">
          Nuevo Rol *
        </label>
        {USER_ROLES.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            disabled={isSaving}
            className={`w-full p-3 rounded-lg border-2 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
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

      <ModalActions
        onCancel={onClose}
        onConfirm={handleSave}
        cancelDisabled={isSaving}
        confirmDisabled={!selectedRole || selectedRole === user.role}
        isLoading={isSaving}
        confirmText="Guardar Cambios"
      />
    </Modal>
  );
}
