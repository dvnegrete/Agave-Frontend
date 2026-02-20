import { useState } from 'react';
import { usePaymentHistoryQuery, useBackfillAllocationsMutation } from '@hooks/usePaymentManagement';
import { useFormatDate } from '@hooks/useFormatDate';
import { useAlert } from '@hooks/useAlert';
import { Button, StatsCard, StatusBadge, ExpandableTable } from '@shared/ui';
import type { HousePaymentTransaction, UnreconciledVoucher, BackfillRecordResult } from '@shared';
import { formatCurrency } from '@/utils/formatters';

interface PaymentMovement extends HousePaymentTransaction {
  type: 'transaction' | 'voucher';
  _date: number;
  created_at?: string;
  confirmation_code?: string;
}

function mergeMovements(paymentHistory: ReturnType<typeof usePaymentHistoryQuery>['history']): PaymentMovement[] {
  if (!paymentHistory) return [];
  const movements: PaymentMovement[] = [];

  if (paymentHistory.transactions?.length > 0) {
    paymentHistory.transactions.forEach((t: HousePaymentTransaction) => {
      movements.push({ ...t, type: 'transaction', _date: new Date(t.date).getTime() });
    });
  }

  if (paymentHistory.unreconciled_vouchers?.vouchers?.length > 0) {
    paymentHistory.unreconciled_vouchers.vouchers.forEach((v: UnreconciledVoucher) => {
      movements.push({
        date: v.date,
        time: new Date(v.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        amount: v.amount,
        confirmation_status: v.confirmation_status,
        type: 'voucher',
        created_at: v.created_at,
        confirmation_code: v.confirmation_code,
        _date: new Date(v.date).getTime(),
      } as PaymentMovement);
    });
  }

  movements.sort((a, b) => b._date - a._date);
  return movements;
}

export function HousePaymentsTab() {
  const alert = useAlert();
  const [selectedHouseId, setSelectedHouseId] = useState<number | null>(null);
  const [backfillHouseNumber, setBackfillHouseNumber] = useState<number | undefined>(undefined);
  const [showBackfillResults, setShowBackfillResults] = useState(false);

  const { history: paymentHistory, isLoading: historyLoading } = usePaymentHistoryQuery(selectedHouseId);
  const { backfill, isPending: backfillPending, data: backfillData, error: backfillError } = useBackfillAllocationsMutation();

  const handleBackfillAllocations = async (): Promise<void> => {
    try {
      await backfill(backfillHouseNumber);
      setShowBackfillResults(true);
      alert.success('Éxito', 'Backfill completado exitosamente');
    } catch (err) {
      console.error('Error backfilling allocations:', err);
      alert.error('Error', 'No se pudo completar el backfill. Intenta de nuevo.');
    }
  };

  const allMovements = mergeMovements(paymentHistory);

  const renderMovementType = (movement: PaymentMovement) => (
    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${movement.type === 'transaction' ? 'text-info' : 'text-warning'}`}>
      {movement.type === 'transaction' ? '🏦 Transacción Bancaria' : '📋 Comprobante'}
    </span>
  );

  const renderMovementDate = (movement: PaymentMovement) => (
    <div className="text-sm font-mono">
      <div>{useFormatDate(movement.date)}</div>
      <div className="text-foreground-secondary text-xs">{movement.time}</div>
    </div>
  );

  const renderMovementConcept = (movement: PaymentMovement) => {
    if (movement.type === 'voucher') {
      return (
        <div className="space-y-1">
          <p className="text-xs text-foreground-secondary">Código de confirmación:</p>
          <p className="font-mono text-sm font-semibold text-primary">{(movement as any).confirmation_code || '-'}</p>
        </div>
      );
    }
    return (movement as HousePaymentTransaction).concept || 'N/A';
  };

  const renderMovementBank = (movement: PaymentMovement) => {
    if (movement.type === 'voucher') return '';
    return <p className="text-sm">{(movement as HousePaymentTransaction).bank_name || '-'}</p>;
  };

  const renderMovementStatus = (movement: PaymentMovement) => (
    <StatusBadge
      status={movement.confirmation_status ? 'success' : 'warning'}
      label={movement.confirmation_status ? 'Confirmada' : 'Pendiente'}
      icon={movement.confirmation_status ? '✓' : '⏳'}
    />
  );

  return (
    <div className="bg-secondary shadow-lg rounded-lg border-4 border-primary/10 p-6">
      <h2 className="text-2xl font-bold mb-6">🏠 Registros de Pagos por Casa</h2>

      {/* Backfill */}
      <details className="group mb-6 bg-tertiary rounded-lg border border-base p-4">
        <summary className="cursor-pointer font-semibold text-foreground flex items-center gap-2 list-none">
          <span className="transition-transform group-open:rotate-90">▶</span>
          🔄 Backfill de Asignaciones de Pagos
        </summary>
        <div className="mt-4 space-y-4">
          <p className="text-sm text-foreground-secondary">
            Sincronizar asignaciones de pagos pendientes. Operación idempotente y segura.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Número de Casa (Opcional, 1-66)
              </label>
              <input
                type="number"
                min="1"
                max="66"
                value={backfillHouseNumber || ''}
                onChange={(e) => setBackfillHouseNumber(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Dejar vacío para procesar todas las casas"
                disabled={backfillPending}
                className="w-full px-4 py-2 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed text-foreground placeholder-foreground-tertiary transition-all duration-200"
              />
            </div>
          </div>
          <Button onClick={handleBackfillAllocations} disabled={backfillPending} isLoading={backfillPending} variant="info">
            {backfillPending ? 'Procesando...' : 'Ejecutar Backfill'}
          </Button>

          {backfillError && (
            <div className="bg-error border-l-4 border-error rounded-lg p-3 flex items-start gap-2">
              <span className="text-error text-lg">❌</span>
              <div className="flex-1">
                <p className="font-semibold text-sm">Error al ejecutar backfill</p>
                <p className="text-xs mt-1">{backfillError}</p>
              </div>
            </div>
          )}

          {showBackfillResults && backfillData && (
            <div className="border-l-4 border-success rounded-lg p-4 space-y-2">
              <p className="font-semibold text-success">✅ Backfill Completado</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><p className="text-foreground-secondary">Total Encontrados</p><p className="font-bold text-success">{backfillData.total_records_found}</p></div>
                <div><p className="text-foreground-secondary">Procesados</p><p className="font-bold text-success">{backfillData.processed}</p></div>
                <div><p className="text-foreground-secondary">Omitidos</p><p className="font-bold text-success">{backfillData.skipped}</p></div>
                <div><p className="text-foreground-secondary">Errores</p><p className="font-bold text-error">{backfillData.failed}</p></div>
              </div>
              {backfillData.results.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-semibold text-foreground">
                    Ver detalles ({backfillData.results.length})
                  </summary>
                  <div className="mt-2 bg-secondary rounded p-2 max-h-48 overflow-y-auto space-y-1">
                    {backfillData.results.map((result: BackfillRecordResult, idx: number) => (
                      <div key={idx} className={`text-xs p-2 rounded ${result.status === 'processed' ? 'text-success' : result.status === 'skipped' ? 'text-info' : 'text-error'}`}>
                        <p>Casa #{result.house_number} - {result.status.toUpperCase()}</p>
                        <p className="text-xs opacity-75">
                          {result.period_year}-{String(result.period_month).padStart(2, '0')} - ${formatCurrency(result.amount)}
                        </p>
                        {result.error && <p className="text-xs opacity-75">Error: {result.error}</p>}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      </details>

      {/* House selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-foreground mb-2">Número de Casa</label>
        <input
          type="number"
          value={selectedHouseId || ''}
          onChange={(e) => setSelectedHouseId(e.target.value ? parseInt(e.target.value) : null)}
          placeholder="Ingresa el número de casa"
          className="w-full px-4 py-2 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder-foreground-tertiary transition-all duration-200"
        />
      </div>

      {historyLoading && (
        <div className="text-center py-8 text-foreground-secondary">Cargando registros de pagos...</div>
      )}

      {selectedHouseId && paymentHistory ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard label="Total de Transacciones" value={paymentHistory.total_transactions.toString()} variant="info" icon="📊" />
            <StatsCard label="Monto Total" value={`$${formatCurrency(paymentHistory.total_amount)}`} variant="success" icon="💰" />
            <StatsCard label="Confirmadas" value={paymentHistory.confirmed_transactions.toString()} variant="success" icon="✓" />
            <StatsCard label="Pendientes" value={paymentHistory.pending_transactions.toString()} variant="warning" icon="⏳" />
            {paymentHistory.unreconciled_vouchers && (
              <StatsCard label="Comprobantes No Conciliados" value={paymentHistory.unreconciled_vouchers.total_count.toString()} variant="warning" icon="📋" />
            )}
          </div>

          {allMovements.length > 0 ? (
            <ExpandableTable<PaymentMovement>
              data={allMovements}
              mainColumns={[
                { id: 'type', header: 'Tipo', align: 'center', render: renderMovementType },
                { id: 'date', header: 'Fecha y Hora', align: 'center', render: renderMovementDate },
                { id: 'amount', header: 'Monto', align: 'center', render: (m) => `$${formatCurrency(m.amount)}`, className: 'font-semibold text-primary-light' },
              ]}
              expandableColumns={[
                { id: 'concept', header: 'Concepto', align: 'left', render: renderMovementConcept },
                { id: 'bank_or_code', header: 'Banco', align: 'left', render: renderMovementBank },
                { id: 'confirmation_status', header: 'Estatus', align: 'center', render: renderMovementStatus },
              ]}
              expandedRowLayout="table"
              keyField={(m) => `${m.type}-${m.date}-${m.amount}`}
              variant="spacious"
              emptyMessage="No hay movimientos registrados"
            />
          ) : (
            <div className="text-center py-8 text-foreground-secondary">No hay movimientos disponibles</div>
          )}
        </div>
      ) : !selectedHouseId ? (
        <div className="text-center py-8 text-foreground-secondary">
          Selecciona una casa para ver sus movimientos de pagos
        </div>
      ) : null}
    </div>
  );
}
