import { useState, useEffect } from 'react';
import { Button } from '@shared/ui';
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
      setError(err instanceof Error ? err.message : 'Error al actualizar las observaciones');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = observations !== (user.observations || '');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-secondary border-2 border-primary/20 rounded-lg p-6 max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">📝 Editar Observaciones</h2>
          <p className="text-sm text-foreground-secondary">
            Actualiza las observaciones para {user.name || 'este usuario'}
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
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-error/20 border border-error text-error p-3 rounded mb-4 text-sm">
            ❌ {error}
          </div>
        )}

        {/* Observations Textarea */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-foreground mb-2">
            Observaciones
          </label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Agregar observaciones sobre el usuario..."
            className="w-full p-3 rounded-lg border-2 border-base bg-base text-foreground focus:border-primary focus:outline-none resize-none"
            rows={4}
            disabled={isSaving}
          />
          <div className="text-xs text-foreground-tertiary mt-2">
            {observations.length}/500 caracteres
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
            disabled={!hasChanges}
            className="flex-1"
          >
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
}
