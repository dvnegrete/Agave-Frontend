import { useState, useEffect } from 'react';
import { Button } from '@shared/ui';
import { HOUSE_NUMBER_RANGE, VALIDATION_MESSAGES } from '@shared';
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
      setError('Por favor ingresa un número de casa válido');
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
      setError(err instanceof Error ? err.message : 'Error al asignar la casa');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-secondary border-2 border-primary/20 rounded-lg p-6 max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">🏠 Asignar Depósito a Casa</h2>
          <p className="text-sm text-foreground-secondary">
            Asigna este depósito a una casa del condominio
          </p>
        </div>

        {/* Deposit Info */}
        <div className="bg-base rounded-lg p-4 mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground-secondary">Monto:</span>
            <span className="font-semibold text-success">${deposit.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground-secondary">Concepto:</span>
            <span className="font-semibold text-foreground">{deposit.concept || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground-secondary">Razón:</span>
            <span className="font-semibold text-foreground text-xs">{deposit.reason}</span>
          </div>
          {deposit.suggestedHouseNumber && (
            <div className="flex justify-between">
              <span className="text-foreground-secondary">Casa Sugerida:</span>
              <span className="font-semibold text-primary">{deposit.suggestedHouseNumber}</span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-error/20 border border-error text-error p-3 rounded mb-4 text-sm">
            ❌ {error}
          </div>
        )}

        {/* Form */}
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Número de Casa *
            </label>
            <input
              type="number"
              min={HOUSE_NUMBER_RANGE.MIN}
              max={HOUSE_NUMBER_RANGE.MAX}
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              placeholder="Ej: 101"
              className="w-full px-4 py-2 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Notas (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agregar comentarios sobre esta asignación..."
              rows={3}
              className="w-full px-4 py-2 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground transition-all duration-200 resize-none"
            />
          </div>
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
            disabled={!houseNumber}
            className="flex-1"
          >
            Asignar Depósito
          </Button>
        </div>
      </div>
    </div>
  );
}
