import { useState, useEffect } from 'react';
import { Modal, FormInput, ErrorAlert, ModalActions, InfoCard } from '@shared/ui';
import { HOUSE_NUMBER_RANGE, VALIDATION_MESSAGES, MODAL_MESSAGES } from '@shared';
import type { User, AssignHouseRequest } from '@/shared';

interface ModalAssignHouseProps {
  isOpen: boolean;
  user: User | null;
  onSave: (userId: string, data: AssignHouseRequest) => Promise<void>;
  onClose: () => void;
}

export function ModalAssignHouse({ isOpen, user, onSave, onClose }: ModalAssignHouseProps) {
  const [houseNumber, setHouseNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setHouseNumber('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleSave = async (): Promise<void> => {
    const house = parseInt(houseNumber, 10);

    // Validation
    if (!houseNumber || isNaN(house)) {
      setError(MODAL_MESSAGES.ERRORS.INVALID_HOUSE);
      return;
    }

    if (house < HOUSE_NUMBER_RANGE.MIN || house > HOUSE_NUMBER_RANGE.MAX) {
      setError(VALIDATION_MESSAGES.HOUSE_NUMBER_INVALID);
      return;
    }

    if (user.houses.includes(house)) {
      setError(MODAL_MESSAGES.ERRORS.HOUSE_ALREADY_ASSIGNED);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(user.id, { house_number: house });
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
      title={MODAL_MESSAGES.ASSIGN_HOUSE.TITLE}
      maxWidth="sm"
    >
      <p className="text-sm text-foreground-secondary mb-6">
        {MODAL_MESSAGES.ASSIGN_HOUSE.DESCRIPTION} {user.name || 'este usuario'}
      </p>

      <InfoCard
        items={[
          {
            label: 'Nombre:',
            value: user.name || 'Sin nombre',
          },
          {
            label: 'Casas actuales:',
            value: user.houses.length > 0 ? user.houses.join(', ') : 'Ninguna',
          },
        ]}
      />

      <ErrorAlert message={error} />

      <div className="mb-6">
        <FormInput
          id="house-number"
          label="Número de Casa"
          type="number"
          value={houseNumber}
          onChange={setHouseNumber}
          placeholder="Ej: 101"
          min={HOUSE_NUMBER_RANGE.MIN}
          max={HOUSE_NUMBER_RANGE.MAX}
        />
      </div>

      <ModalActions
        onCancel={onClose}
        onConfirm={handleSave}
        cancelDisabled={isSaving}
        confirmDisabled={!houseNumber}
        isLoading={isSaving}
        confirmText="Asignar Casa"
      />
    </Modal>
  );
}
