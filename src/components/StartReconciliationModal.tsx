import { useState } from 'react';
import { Button } from '../ui/Button';
import type { StartReconciliationResponse } from '../types/api.types';

type StartReconciliationResult = StartReconciliationResponse;

interface StartReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (data: { startDate?: string; endDate?: string }) => Promise<StartReconciliationResult | undefined>;
  isProcessing: boolean;
}

export function StartReconciliationModal({
  isOpen,
  onClose,
  onStart,
  isProcessing,
}: StartReconciliationModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleStart = async (): Promise<void> => {
    try {
      const data: { startDate?: string; endDate?: string } = {};
      if (startDate) data.startDate = startDate;
      if (endDate) data.endDate = endDate;

      console.log('📤 Enviando petición de inicio de conciliación:', data);

      const response = await onStart(data);

      console.log('📥 Respuesta de la API:', response);

      if (response) {
        // Log detallado del resultado
        console.log('✅ Resultado del proceso:', {
          summary: response.summary,
          conciliados: response.conciliados.length,
          unfundedVouchers: response.unfundedVouchers.length,
          unclaimedDeposits: response.unclaimedDeposits.length,
          manualValidation: response.manualValidationRequired.length,
        });

        // Log detallado de cada sección
        console.group('📋 Detalles de Conciliación');
        console.log('Conciliados:', response.conciliados);
        console.log('Comprobantes NO conciliados:', response.unfundedVouchers);
        console.log('Movimientos bancarios No asociados ni conciliados:', response.unclaimedDeposits);
        console.log('Validación Manual:', response.manualValidationRequired);
        console.groupEnd();

        // Cerrar modal inmediatamente después de éxito
        handleClose();
      }
    } catch (err) {
      console.error('❌ Error al iniciar conciliación:', err);
      // En caso de error, no hay resultado que mostrar
      // El error ya se muestra en el error global del componente padre
    }
  };

  const handleClose = (): void => {
    setStartDate('');
    setEndDate('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 background-general bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-secondary border-2 border-primary/20 rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">🚀 Iniciar Conciliación</h2>
          <p className="text-sm text-foreground-secondary">
            Los campos de fecha son opcionales. Si no especificas fechas, se procesarán todos los registros.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Fecha Inicio (opcional)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isProcessing}
              className="w-full px-4 py-2 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed text-foreground placeholder-foreground-tertiary transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Fecha Fin (opcional)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isProcessing}
              className="w-full px-4 py-2 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed text-foreground placeholder-foreground-tertiary transition-all duration-200"
            />
          </div>

          <div className="flex gap-3 justify-end pt-6">
            <Button
              onClick={handleClose}
              disabled={isProcessing}
              variant="error"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleStart}
              disabled={isProcessing}
              isLoading={isProcessing}
              variant="success"
            >
              Iniciar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
