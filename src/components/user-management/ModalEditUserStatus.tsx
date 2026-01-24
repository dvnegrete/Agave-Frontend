import { useState, useEffect } from 'react';
import { Modal, ErrorAlert, ModalActions, InfoCard } from '@shared/ui';
import { USER_STATUSES, STATUS_LABELS, MODAL_MESSAGES } from '@shared';
import type { User, Status } from '@/shared';

interface ModalEditUserStatusProps {
  isOpen: boolean;
  user: User | null;
  onSave: (userId: string, data: { status: Status }) => Promise<void>;
  onClose: () => void;
}

export function ModalEditUserStatus({ isOpen, user, onSave, onClose }: ModalEditUserStatusProps) {
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setSelectedStatus(user.status);
      setError(null);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSave = async (): Promise<void> => {
    if (!selectedStatus) {
      setError(MODAL_MESSAGES.ERRORS.REQUIRED_STATUS);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(user.id, { status: selectedStatus });
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
      title={MODAL_MESSAGES.EDIT_STATUS.TITLE}
      maxWidth="sm"
    >
      <p className="text-sm text-foreground-secondary mb-6">
        {MODAL_MESSAGES.EDIT_STATUS.DESCRIPTION} {user.name || 'este usuario'}
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
            label: 'Estado actual:',
            value: user.status,
          },
        ]}
      />

      <ErrorAlert message={error} />

      <div className="mb-6 space-y-2">
        <label className="block text-sm font-semibold text-foreground mb-3">
          Nuevo Estado *
        </label>
        {USER_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            disabled={isSaving}
            className={`w-full p-3 rounded-lg border-2 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              selectedStatus === status
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-base bg-base text-foreground-secondary hover:border-primary/50'
            }`}
          >
            <div className="font-semibold">{STATUS_LABELS[status].label}</div>
            <div className="text-xs text-foreground-tertiary mt-1">
              {STATUS_LABELS[status].description}
            </div>
          </button>
        ))}
      </div>

      <ModalActions
        onCancel={onClose}
        onConfirm={handleSave}
        cancelDisabled={isSaving}
        confirmDisabled={!selectedStatus || selectedStatus === user.status}
        isLoading={isSaving}
        confirmText="Guardar Cambios"
      />
    </Modal>
  );
}
