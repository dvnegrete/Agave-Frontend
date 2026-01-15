import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import type { User, AssignHouseRequest } from '../types/user-management.types';

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
      setError('Por favor ingresa un número de casa válido');
      return;
    }

    if (house < 1 || house > 999) {
      setError('El número de casa debe estar entre 1 y 999');
      return;
    }

    if (user.houses.includes(house)) {
      setError('Este usuario ya tiene asignada esta casa');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(user.id, { house_number: house });
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
          <h2 className="text-2xl font-bold text-foreground mb-2">🏠 Asignar Casa</h2>
          <p className="text-sm text-foreground-secondary">
            Asigna una casa a {user.name || 'este usuario'}
          </p>
        </div>

        {/* User Info */}
        <div className="bg-base rounded-lg p-4 mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground-secondary">Nombre:</span>
            <span className="font-semibold text-foreground">{user.name || 'Sin nombre'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground-secondary">Casas actuales:</span>
            <span className="font-semibold text-foreground">
              {user.houses.length > 0 ? user.houses.join(', ') : 'Ninguna'}
            </span>
          </div>
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
              min="1"
              max="999"
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              placeholder="Ej: 101"
              className="w-full px-4 py-2 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground transition-all duration-200"
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
            Asignar Casa
          </Button>
        </div>
      </div>
    </div>
  );
}
