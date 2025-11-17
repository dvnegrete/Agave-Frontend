import { useState } from 'react';

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

  const handleStart = async () => {
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

  const handleClose = () => {
    setStartDate('');
    setEndDate('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 background-general bg-opacity-50 z-50 flex items-center justify-center">
      <div className="border-gray-200 border-2 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Iniciar Conciliación</h2>
        <p className="text-sm mb-4">
          Los campos de fecha son opcionales. Si no especificas fechas, se procesarán todos los registros.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Fecha Inicio (opcional)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isProcessing}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Fecha Fin (opcional)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isProcessing}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>


          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="px-4 py-2 bg-red-800 rounded hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleStart}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-400 text-gray-100 px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isProcessing ? 'Procesando...' : 'Iniciar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
