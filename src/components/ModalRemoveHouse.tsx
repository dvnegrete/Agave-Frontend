import { useState } from 'react';
import { Button } from '../ui/Button';
import type { User } from '../types/user-management.types';

interface ModalRemoveHouseProps {
  isOpen: boolean;
  user: User | null;
  houseNumber: number | null;
  onConfirm: (userId: string, houseNumber: number) => Promise<void>;
  onClose: () => void;
}

export function ModalRemoveHouse({
  isOpen,
  user,
  houseNumber,
  onConfirm,
  onClose,
}: ModalRemoveHouseProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user || houseNumber === null) return null;

  const handleRemove = async (): Promise<void> => {
    setIsRemoving(true);
    setError(null);

    try {
      await onConfirm(user.id, houseNumber);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al remover la casa');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-secondary border-2 border-warning rounded-lg p-6 max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-warning mb-2">⚠️ Remover Casa</h2>
          <p className="text-sm text-foreground-secondary">
            ¿Estás seguro de que deseas remover esta casa?
          </p>
        </div>

        {/* Confirmation Details */}
        <div className="bg-base rounded-lg p-4 mb-6 space-y-2 text-sm border-l-4 border-warning">
          <div className="flex justify-between">
            <span className="text-foreground-secondary">Usuario:</span>
            <span className="font-semibold text-foreground">{user.name || 'Sin nombre'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground-secondary">Casa a remover:</span>
            <span className="font-bold text-warning">{houseNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground-secondary">Otras casas:</span>
            <span className="text-foreground">
              {user.houses.filter((h) => h !== houseNumber).length}
            </span>
          </div>
        </div>

        {/* Warning Message */}
        <div className="bg-warning/10 border border-warning text-warning-light p-3 rounded mb-4 text-sm">
          ⚠️ Esta acción desasignará la casa del usuario. Esta acción no se puede deshacer fácilmente.
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-error/20 border border-error text-error p-3 rounded mb-4 text-sm">
            ❌ {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="sameUi"
            onClick={onClose}
            disabled={isRemoving}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="error"
            onClick={handleRemove}
            isLoading={isRemoving}
            className="flex-1"
          >
            Remover Casa
          </Button>
        </div>
      </div>
    </div>
  );
}
