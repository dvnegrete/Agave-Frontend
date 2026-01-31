import { useState } from 'react';
import { usePaymentHistoryQuery } from '@hooks/usePaymentManagement';
import { useFormatDate } from '@hooks/useFormatDate';
import { useAuth } from '@hooks/useAuth';
import { StatusBadge } from '@shared/ui';
import { ExpandableTable } from '@shared/ui';
import type { HousePaymentTransaction, UnreconciledVoucher } from '@shared';

interface PaymentMovement extends HousePaymentTransaction {
  type: 'transaction' | 'voucher';
  _date: number;
  created_at?: string;
  confirmation_code?: string;
  house_number?: number;
}

export function MyHousePayments() {
  const { user } = useAuth();

  // Get house numbers from user
  const houseNumbers = user?.houses || [];

  // Initialize with first house expanded
  const [expandedHouses, setExpandedHouses] = useState<number[]>(() =>
    houseNumbers.length > 0 ? [houseNumbers[0]] : []
  );

  // Fetch payment history for each house
  const housePayments = houseNumbers.map((houseId) => ({
    houseId,
    ...usePaymentHistoryQuery(houseId),
  }));

  const toggleHouseExpanded = (houseNumber: number): void => {
    setExpandedHouses((prev) =>
      prev.includes(houseNumber)
        ? prev.filter((h) => h !== houseNumber)
        : [...prev, houseNumber]
    );
  };

  const renderMovementType = (movement: PaymentMovement) => (
    <span
      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
        movement.type === 'transaction'
          ? 'bg-info/20 text-info'
          : 'bg-warning/20 text-warning'
      }`}
    >
      {movement.type === 'transaction' ? '🏦 Transacción Bancaria' : '📋 Comprobante'}
    </span>
  );

  const renderMovementDate = (movement: PaymentMovement) => (
    <div className="text-sm font-mono">
      <div>{useFormatDate(movement.date)}</div>
      <div className="text-foreground-secondary text-xs">{movement.time}</div>
    </div>
  );

  const renderMovementAmount = (movement: PaymentMovement): string =>
    `$${movement.amount.toFixed(2)}`;

  const renderMovementConcept = (movement: PaymentMovement) => {
    if (movement.type === 'voucher') {
      return (
        <div className="space-y-1">
          <p className="text-xs text-foreground-secondary">Código de confirmación:</p>
          <p className="font-mono text-sm font-semibold text-primary">
            {(movement as any).confirmation_code || '-'}
          </p>
        </div>
      );
    }
    return (movement as HousePaymentTransaction).concept || 'N/A';
  };

  const renderMovementBank = (movement: PaymentMovement) => {
    if (movement.type === 'voucher') {
      return '';
    }
    return <p className="text-sm">{(movement as HousePaymentTransaction).bank_name || '-'}</p>;
  };

  const renderMovementStatus = (movement: PaymentMovement) => (
    <StatusBadge
      status={movement.confirmation_status ? 'success' : 'warning'}
      label={movement.confirmation_status ? 'Confirmada' : 'Pendiente'}
      icon={movement.confirmation_status ? '✓' : '⏳'}
    />
  );

  const getMovementKey = (movement: PaymentMovement): string =>
    `${movement.type}-${movement.date}-${movement.amount}`;

  if (houseNumbers.length === 0) {
    return (
      <div className="container flex-1 mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">🏠 Mis Pagos de Casa</h1>
        <div className="bg-base shadow-lg rounded-lg border-4 border-info p-6 text-center">
          <p className="text-foreground-secondary">
            No tienes casas registradas en el sistema
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex-1 mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">🏠 Mis Pagos de Casa</h1>

      <div className="space-y-6">
        {housePayments.map(({ houseId, history: paymentHistory, isLoading: historyLoading }) => {
          const isExpanded = expandedHouses.includes(houseId);

          if (historyLoading) {
            return (
              <div key={houseId} className="bg-base shadow-lg rounded-lg border-4 p-6">
                <h2 className="text-lg font-bold mb-4">Casa #{houseId}</h2>
                <p className="text-foreground-secondary">Cargando datos...</p>
              </div>
            );
          }

          if (!paymentHistory) {
            return (
              <div key={houseId} className="bg-base shadow-lg rounded-lg border-4 p-6">
                <h2 className="text-lg font-bold mb-4">Casa #{houseId}</h2>
                <p className="text-foreground-secondary">Error al cargar datos</p>
              </div>
            );
          }

          // Combine transactions and vouchers
          const allMovements: PaymentMovement[] = [];

          if (paymentHistory.transactions && paymentHistory.transactions.length > 0) {
            paymentHistory.transactions.forEach((transaction: HousePaymentTransaction) => {
              allMovements.push({
                ...transaction,
                type: 'transaction',
                _date: new Date(transaction.date).getTime(),
                house_number: houseId,
              });
            });
          }

          if (
            paymentHistory.unreconciled_vouchers?.vouchers &&
            paymentHistory.unreconciled_vouchers.vouchers.length > 0
          ) {
            paymentHistory.unreconciled_vouchers.vouchers.forEach(
              (voucher: UnreconciledVoucher) => {
                allMovements.push({
                  date: voucher.date,
                  time: new Date(voucher.date).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  }),
                  amount: voucher.amount,
                  confirmation_status: voucher.confirmation_status,
                  type: 'voucher',
                  created_at: voucher.created_at,
                  confirmation_code: voucher.confirmation_code,
                  _date: new Date(voucher.date).getTime(),
                  house_number: houseId,
                } as PaymentMovement);
              }
            );
          }

          // Sort by date descending
          allMovements.sort((a: PaymentMovement, b: PaymentMovement) => b._date - a._date);

          return (
            <div key={houseId} className="bg-base shadow-lg rounded-lg border-4 border-primary/10 p-6">
              {/* Header con toggle */}
              <div
                className="flex items-center justify-between cursor-pointer mb-4"
                onClick={() => toggleHouseExpanded(houseId)}
              >
                <div className="flex-1">
                  <h2 className="text-lg font-bold">🏠 Casa #{houseId}</h2>
                  <p className="text-sm text-foreground-secondary">
                    {allMovements.length} movimientos
                  </p>
                </div>
                <span className="text-2xl">
                  {isExpanded ? '▼' : '▶'}
                </span>
              </div>

              {/* Contenido expandible */}
              {isExpanded && (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-base">
                    <div className="bg-secondary p-3 rounded">
                      <p className="text-xs text-foreground-secondary mb-1">Total Transacciones</p>
                      <p className="text-xl font-bold text-primary">
                        {paymentHistory.total_transactions}
                      </p>
                    </div>
                    <div className="bg-secondary p-3 rounded">
                      <p className="text-xs text-foreground-secondary mb-1">Monto Total</p>
                      <p className="text-xl font-bold text-success">
                        ${paymentHistory.total_amount.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-secondary p-3 rounded">
                      <p className="text-xs text-foreground-secondary mb-1">Confirmadas</p>
                      <p className="text-xl font-bold text-success">
                        {paymentHistory.confirmed_transactions}
                      </p>
                    </div>
                    <div className="bg-secondary p-3 rounded">
                      <p className="text-xs text-foreground-secondary mb-1">Pendientes</p>
                      <p className="text-xl font-bold text-warning">
                        {paymentHistory.pending_transactions}
                      </p>
                    </div>
                  </div>

                  {/* Transactions Table */}
                  {allMovements.length > 0 ? (
                    <div className="overflow-x-auto">
                      <ExpandableTable<PaymentMovement>
                        data={allMovements}
                        mainColumns={[
                          {
                            id: 'type',
                            header: 'Tipo',
                            align: 'center',
                            render: renderMovementType,
                          },
                          {
                            id: 'date',
                            header: 'Fecha y Hora',
                            align: 'center',
                            render: renderMovementDate,
                          },
                          {
                            id: 'amount',
                            header: 'Monto',
                            align: 'center',
                            render: renderMovementAmount,
                            className: 'font-semibold text-primary-light',
                          },
                        ]}
                        expandableColumns={[
                          {
                            id: 'concept',
                            header: 'Concepto',
                            align: 'left',
                            render: renderMovementConcept,
                          },
                          {
                            id: 'bank_or_code',
                            header: 'Banco',
                            align: 'left',
                            render: renderMovementBank,
                          },
                          {
                            id: 'confirmation_status',
                            header: 'Estatus',
                            align: 'center',
                            render: renderMovementStatus,
                          },
                        ]}
                        expandedRowLayout="table"
                        keyField={getMovementKey}
                        variant="spacious"
                        emptyMessage="No hay movimientos registrados"
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8 text-foreground-secondary">
                      No hay movimientos disponibles
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
