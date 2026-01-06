import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { DateTimeCell } from '../ui/DateTimeCell';
import type { UnclaimedDeposit } from '../types/unclaimed-deposits';

interface ModalAssignHouseProps {
  isOpen: boolean;
  deposit: UnclaimedDeposit | null;
  houseNumber: string;
  notes: string;
  isLoading: boolean;
  error: string | null;
  onHouseNumberChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onAssign: () => void;
  onClose: () => void;
}

/**
 * Modal para asignar una casa a un depósito no reclamado
 * Muestra los detalles del depósito y un formulario para ingresar el número de casa
 */
export function ModalAssignHouse({
  isOpen,
  deposit,
  houseNumber,
  notes,
  isLoading,
  error,
  onHouseNumberChange,
  onNotesChange,
  onAssign,
  onClose,
}: ModalAssignHouseProps) {
  if (!isOpen || !deposit) return null;

  return (
    <div className="fixed inset-0 bg-base z-50 flex items-center justify-center p-4">
      <div className="bg-secondary border-2 border-primary/20 rounded-lg p-6 max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">🏠 Asignar Casa</h2>
          <p className="text-sm text-foreground-secondary">
            Asigna una casa a este depósito no reclamado
          </p>
        </div>

        {/* Resumen del depósito */}
        <div className="bg-base rounded-lg p-4 mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground-secondary">ID:</span>
            <span className="font-mono text-foreground">{deposit.transactionBankId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground-secondary">Monto:</span>
            <span className="font-bold text-foreground">${deposit.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-foreground-secondary">Fecha y Hora:</span>
            <div className="text-right">
              <DateTimeCell
                dateString={typeof deposit.date === 'string' ? deposit.date : deposit.date?.toISOString()}
                timeString={deposit.time}
                variant="compact"
                showIcon={false}
              />
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground-secondary">Estado:</span>
            <StatusBadge
              status={deposit.validationStatus === 'conflict' ? 'warning' : 'error'}
              label={deposit.validationStatus === 'conflict' ? 'Conflicto' : 'No Encontrado'}
            />
          </div>
        </div>

        {/* Formulario */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Número de Casa (1-66) *
            </label>
            <input
              type="number"
              min="1"
              max="66"
              value={houseNumber}
              onChange={(e) => onHouseNumberChange(e.target.value)}
              placeholder="Ej: 15"
              className="w-full px-4 py-2 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Notas (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Ej: Confirmado con el residente..."
              rows={3}
              className="w-full px-4 py-2 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder-foreground-tertiary transition-all duration-200 resize-none"
            />
          </div>
        </div>

        {/* Error del formulario */}
        {error && (
          <div className="bg-error/10 border-l-4 border-error rounded-lg p-3 mb-4 text-sm text-error">
            {error}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 justify-end">
          <Button
            onClick={onClose}
            disabled={isLoading}
            variant="sameUi"
          >
            Cancelar
          </Button>
          <Button
            onClick={onAssign}
            disabled={isLoading || !houseNumber}
            isLoading={isLoading}
            variant="success"
          >
            Asignar
          </Button>
        </div>
      </div>
    </div>
  );
}
