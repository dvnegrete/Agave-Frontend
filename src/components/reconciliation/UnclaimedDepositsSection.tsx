import { useState } from 'react';
import { ModalAssignDepositHouse } from './ModalAssignDepositHouse';
import { Button, Table, DateTimeCell } from '@shared';
import type { TableColumn } from '@shared/ui';
import type { UnclaimedDeposit, UnclaimedDepositsPage, DepositAssignHouseRequest, } from '@shared';
import { unclaimedDepositsService } from '@services/unclaimedDepositsService';

interface UnclaimedDepositsSectionProps {
  onDepositAssigned?: () => void;
}

export function UnclaimedDepositsSection({ onDepositAssigned }: UnclaimedDepositsSectionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UnclaimedDepositsPage | null>(null);
  const [selectedDeposit, setSelectedDeposit] = useState<UnclaimedDeposit | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [_assignLoading, setAssignLoading] = useState(false);
  const [_assignError, setAssignError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLoadDeposits = async (): Promise<void> => {
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
      console.error('Error cargando depósitos no reclamados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClick = (deposit: UnclaimedDeposit): void => {
    setSelectedDeposit(deposit);
    setShowAssignModal(true);
  };

  const handleAssignHouse = async (data: DepositAssignHouseRequest): Promise<void> => {
    if (!selectedDeposit) {
      console.error('No deposit selected');
      return;
    }

    setAssignLoading(true);
    setAssignError(null);

    try {
      await unclaimedDepositsService.assignHouseToDeposit(
        selectedDeposit.transactionBankId,
        data
      );

      // Éxito - cerrar modal y recargar datos
      setShowAssignModal(false);
      setSelectedDeposit(null);

      // Recargar la lista
      await handleLoadDeposits();

      // Llamar callback si existe
      onDepositAssigned?.();
    } catch (err) {
      setAssignError((err as Error).message || 'Error al asignar casa');
      console.error('Error asignando casa:', err);
    } finally {
      setAssignLoading(false);
    }
  };

  const columns: TableColumn<UnclaimedDeposit>[] = [
    {
      id: 'amount',
      header: 'Monto',
      align: 'right',
      render: (item) => `$${item.amount.toFixed(2)}`,
    },
    {
      id: 'dateTime',
      header: 'Fecha y Hora',
      align: 'center',
      render: (item) => (
        <DateTimeCell
          dateString={typeof item.date === 'string' ? item.date : item.date?.toISOString()}
          timeString={item.time}
          variant="compact"
          showIcon={true}
        />
      ),
    },
    {
      id: 'concept',
      header: 'Concepto',
      align: 'left',
      render: (item) => item.concept || 'N/A',
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
        <div className="border-l-4 border-error rounded-lg p-4 flex items-start gap-3">
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
      <ModalAssignDepositHouse
        isOpen={showAssignModal}
        deposit={selectedDeposit}
        onSave={handleAssignHouse}
        onClose={() => setShowAssignModal(false)}
      />
    </div>
  );
}
