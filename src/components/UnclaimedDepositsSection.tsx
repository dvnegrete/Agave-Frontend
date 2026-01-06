import { useState } from 'react';
import { Button } from '../ui/Button';
import { Table, type TableColumn } from '../ui/Table';
import { StatusBadge } from '../ui/StatusBadge';
import { unclaimedDepositsService } from '../services/unclaimedDepositsService';
import { useFormatDate } from '../hooks/useFormatDate';
import type { UnclaimedDeposit, UnclaimedDepositsPage, AssignHouseRequest } from '../types/unclaimed-deposits';

interface UnclaimedDepositsSectionProps {
  onDepositAssigned?: () => void;
}

export function UnclaimedDepositsSection({ onDepositAssigned }: UnclaimedDepositsSectionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UnclaimedDepositsPage | null>(null);
  const [selectedDeposit, setSelectedDeposit] = useState<UnclaimedDeposit | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [houseNumber, setHouseNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLoadDeposits = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await unclaimedDepositsService.getUnclaimedDeposits({
        page: 1,
        limit: 20,
        validationStatus: 'all',
      });
      setData(result);
      setIsExpanded(true);
    } catch (err) {
      setError((err as Error).message || 'Error al cargar depósitos');
      console.error('❌ Error cargando depósitos no reclamados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClick = (deposit: UnclaimedDeposit) => {
    setSelectedDeposit(deposit);
    setHouseNumber(deposit.suggestedHouseNumber?.toString() || '');
    setNotes('');
    setAssignError(null);
    setShowAssignModal(true);
  };

  const handleAssignHouse = async () => {
    if (!selectedDeposit || !houseNumber) {
      setAssignError('Por favor ingresa un número de casa válido');
      return;
    }

    setAssignLoading(true);
    setAssignError(null);

    try {
      const request: AssignHouseRequest = {
        houseNumber: parseInt(houseNumber),
        adminNotes: notes || undefined,
      };

      await unclaimedDepositsService.assignHouseToDeposit(
        selectedDeposit.transactionBankId,
        request
      );

      // Éxito - cerrar modal y recargar datos
      setShowAssignModal(false);
      setSelectedDeposit(null);
      setHouseNumber('');
      setNotes('');

      // Recargar la lista
      await handleLoadDeposits();

      // Llamar callback si existe
      onDepositAssigned?.();
    } catch (err) {
      setAssignError((err as Error).message || 'Error al asignar casa');
      console.error('❌ Error asignando casa:', err);
    } finally {
      setAssignLoading(false);
    }
  };

  const columns: TableColumn<UnclaimedDeposit>[] = [
    {
      id: 'transactionBankId',
      header: 'ID Transacción',
      align: 'left',
      render: (item) => item.transactionBankId,
    },
    {
      id: 'amount',
      header: 'Monto',
      align: 'right',
      render: (item) => `$${item.amount.toFixed(2)}`,
    },
    {
      id: 'date',
      header: 'Fecha',
      align: 'center',
      render: (item) => useFormatDate(item.date),
    },
    {
      id: 'concept',
      header: 'Concepto',
      align: 'left',
      render: (item) => item.concept || 'N/A',
    },
    {
      id: 'validationStatus',
      header: 'Estado',
      align: 'center',
      render: (item) => (
        <StatusBadge
          status={item.validationStatus === 'conflict' ? 'warning' : 'error'}
          label={item.validationStatus === 'conflict' ? 'Conflicto' : 'No Encontrado'}
          icon={item.validationStatus === 'conflict' ? '⚠️' : '❌'}
        />
      ),
    },
    {
      id: 'suggestedHouseNumber',
      header: 'Casa Sugerida',
      align: 'center',
      render: (item) => item.suggestedHouseNumber ? `Casa ${item.suggestedHouseNumber}` : '-',
    },
    {
      id: 'reason',
      header: 'Razón',
      align: 'left',
      render: (item) => (
        <span title={item.reason} className="text-sm">
          {item.reason.substring(0, 40)}...
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Acción',
      align: 'center',
      render: (item) => (
        <Button
          onClick={() => handleAssignClick(item)}
          variant="info"
          className="text-xs px-2 py-1"
        >
          Asignar
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Encabezado con botón expandible */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span>🏦 Depósitos No Reclamados</span>
          {data && (
            <span className="bg-warning/20 text-warning px-3 py-1 rounded-full text-sm font-bold">
              {data.totalCount}
            </span>
          )}
        </h3>
        <Button
          onClick={handleLoadDeposits}
          disabled={loading}
          isLoading={loading}
          variant="info"
        >
          {isExpanded ? '🔄 Recargar' : '📥 Cargar Depósitos'}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-error/10 border-l-4 border-error rounded-lg p-4 flex items-start gap-3">
          <span className="text-error text-xl">❌</span>
          <div className="flex-1">
            <p className="text-error font-semibold">Error al cargar</p>
            <p className="text-error text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-error hover:text-error/80 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabla de depósitos */}
      {isExpanded && data && (
        <>
          {data.items.length === 0 ? (
            <div className="bg-success/10 border border-success rounded-lg p-8 text-center">
              <p className="text-success font-semibold text-lg">✅ No hay depósitos no reclamados</p>
              <p className="text-foreground-secondary text-sm mt-2">Todos los depósitos han sido asignados correctamente</p>
            </div>
          ) : (
            <Table
              columns={columns}
              data={data.items}
              emptyMessage="No hay depósitos para mostrar"
              hoverable
              variant="compact"
            />
          )}

          {/* Información de paginación */}
          {data.totalPages > 1 && (
            <div className="text-center text-sm text-foreground-secondary py-4">
              Página 1 de {data.totalPages} • Total: {data.totalCount} depósitos
            </div>
          )}
        </>
      )}

      {/* Modal para asignar casa */}
      {showAssignModal && selectedDeposit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-secondary border-2 border-primary/20 rounded-lg p-6 max-w-md w-full shadow-xl">
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
                <span className="font-mono text-foreground">{selectedDeposit.transactionBankId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Monto:</span>
                <span className="font-bold text-foreground">${selectedDeposit.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Fecha:</span>
                <span className="text-foreground">{useFormatDate(selectedDeposit.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Estado:</span>
                <StatusBadge
                  status={selectedDeposit.validationStatus === 'conflict' ? 'warning' : 'error'}
                  label={selectedDeposit.validationStatus === 'conflict' ? 'Conflicto' : 'No Encontrado'}
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
                  onChange={(e) => setHouseNumber(e.target.value)}
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
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Confirmado con el residente..."
                  rows={3}
                  className="w-full px-4 py-2 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder-foreground-tertiary transition-all duration-200 resize-none"
                />
              </div>
            </div>

            {/* Error del formulario */}
            {assignError && (
              <div className="bg-error/10 border-l-4 border-error rounded-lg p-3 mb-4 text-sm text-error">
                {assignError}
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowAssignModal(false)}
                disabled={assignLoading}
                variant="sameUi"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAssignHouse}
                disabled={assignLoading || !houseNumber}
                isLoading={assignLoading}
                variant="success"
              >
                Asignar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
