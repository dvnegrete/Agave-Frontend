import { useState, useEffect } from 'react';
import { Button } from '../shared/Button';
import type { User, Status } from '../types/user-management.types';

interface ModalEditUserStatusProps {
  isOpen: boolean;
  user: User | null;
  onSave: (userId: string, data: { status: Status }) => Promise<void>;
  onClose: () => void;
}

const STATUSES: Status[] = ['active', 'suspend', 'inactive'];
const STATUS_LABELS: Record<Status, { label: string; icon: string; description: string }> = {
  active: {
    label: '✅ Activo',
    icon: '✅',
    description: 'Usuario activo en el sistema',
  },
  suspend: {
    label: '⏸️ Suspendido',
    icon: '⏸️',
    description: 'Acceso temporalmente desactivado',
  },
  inactive: {
    label: '❌ Inactivo',
    icon: '❌',
    description: 'Usuario desactivado permanentemente',
  },
};

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
      setError('Por favor selecciona un estado');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(user.id, { status: selectedStatus });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el estado');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-secondary border-2 border-primary/20 rounded-lg p-6 max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">🔄 Cambiar Estado</h2>
          <p className="text-sm text-foreground-secondary">
            Cambia el estado para {user.name || 'este usuario'}
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
            <span className="text-foreground-secondary">Estado actual:</span>
            <span className="font-semibold text-foreground capitalize">{user.status}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-error/20 border border-error text-error p-3 rounded mb-4 text-sm">
            ❌ {error}
          </div>
        )}

        {/* Status Selection */}
        <div className="mb-6 space-y-2">
          <label className="block text-sm font-semibold text-foreground mb-3">
            Nuevo Estado *
          </label>
          {STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
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
            disabled={!selectedStatus || selectedStatus === user.status}
            className="flex-1"
          >
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
}
