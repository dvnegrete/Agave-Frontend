import { useState, useEffect } from 'react';
import { Modal, FormTextarea, ErrorAlert, ModalActions, InfoCard } from '@shared/ui';
import { MODAL_MESSAGES } from '@shared';
import type { User } from '@/shared';

interface ModalEditObservationsProps {
  isOpen: boolean;
  user: User | null;
  onSave: (userId: string, data: { observations: string | null }) => Promise<void>;
  onClose: () => void;
}

export function ModalEditObservations({
  isOpen,
  user,
  onSave,
  onClose,
}: ModalEditObservationsProps) {
  const [observations, setObservations] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setObservations(user.observations || '');
      setError(null);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    setError(null);

    try {
      await onSave(user.id, { observations: observations || null });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : MODAL_MESSAGES.ERRORS.SAVE_FAILED);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = observations !== (user.observations || '');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={MODAL_MESSAGES.EDIT_OBSERVATIONS.TITLE}
      maxWidth="sm"
    >
      <p className="text-sm text-foreground-secondary mb-6">
        {MODAL_MESSAGES.EDIT_OBSERVATIONS.DESCRIPTION} {user.name || 'este usuario'}
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
        ]}
      />

      <ErrorAlert message={error} />

      <div className="mb-6">
        <FormTextarea
          id="observations"
          label="Observaciones"
          value={observations}
          onChange={setObservations}
          placeholder="Agregar observaciones sobre el usuario..."
          rows={4}
          maxLength={500}
          showCounter={true}
          disabled={isSaving}
        />
      </div>

      <ModalActions
        onCancel={onClose}
        onConfirm={handleSave}
        cancelDisabled={isSaving}
        confirmDisabled={!hasChanges}
        isLoading={isSaving}
        confirmText="Guardar Cambios"
      />
    </Modal>
  );
}
