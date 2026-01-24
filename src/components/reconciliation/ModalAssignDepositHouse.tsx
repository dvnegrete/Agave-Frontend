import { useState, useEffect } from 'react';
import { Modal, FormInput, FormTextarea, ErrorAlert, ModalActions, InfoCard } from '@shared/ui';
import { HOUSE_NUMBER_RANGE, VALIDATION_MESSAGES, MODAL_MESSAGES } from '@shared';
import type { UnclaimedDeposit, DepositAssignHouseRequest } from '@/shared';

interface ModalAssignDepositHouseProps {
  isOpen: boolean;
  deposit: UnclaimedDeposit | null;
  onSave: (data: DepositAssignHouseRequest) => Promise<void>;
  onClose: () => void;
}

export function ModalAssignDepositHouse({
  isOpen,
  deposit,
  onSave,
  onClose,
}: ModalAssignDepositHouseProps) {
  const [houseNumber, setHouseNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && deposit) {
      setHouseNumber(deposit.suggestedHouseNumber?.toString() || '');
      setNotes('');
      setError(null);
    }
  }, [isOpen, deposit]);

  if (!isOpen || !deposit) return null;

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

    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        houseNumber: house,
        adminNotes: notes || undefined,
      });
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
      title={MODAL_MESSAGES.ASSIGN_DEPOSIT.TITLE}
      maxWidth="sm"
    >
      <p className="text-sm text-foreground-secondary mb-6">
        {MODAL_MESSAGES.ASSIGN_DEPOSIT.DESCRIPTION}
      </p>

      <InfoCard
        items={[
          {
            label: 'Monto:',
            value: `$${deposit.amount.toFixed(2)}`,
            className: 'text-success',
          },
          {
            label: 'Concepto:',
            value: deposit.concept || 'N/A',
          },
          {
            label: 'Razón:',
            value: <span className="text-xs">{deposit.reason}</span>,
          },
          ...(deposit.suggestedHouseNumber
            ? [
                {
                  label: 'Casa Sugerida:',
                  value: deposit.suggestedHouseNumber,
                  className: 'text-primary',
                },
              ]
            : []),
        ]}
      />

      <ErrorAlert message={error} />

      <div className="mb-6 space-y-4">
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

        <FormTextarea
          id="notes"
          label="Notas"
          value={notes}
          onChange={setNotes}
          placeholder="Agregar comentarios sobre esta asignación..."
          rows={3}
          optional={true}
        />
      </div>

      <ModalActions
        onCancel={onClose}
        onConfirm={handleSave}
        cancelDisabled={isSaving}
        confirmDisabled={!houseNumber}
        isLoading={isSaving}
        confirmText="Asignar Depósito"
      />
    </Modal>
  );
}
