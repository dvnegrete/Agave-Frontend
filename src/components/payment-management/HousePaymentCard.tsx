import { usePaymentHistoryQuery } from '@hooks/usePaymentManagement';
import { useFormatDate } from '@hooks/useFormatDate';
import { StatusBadge, ExpandableTable } from '@shared/ui';
import type { HousePaymentTransaction, UnreconciledVoucher } from '@shared';
import { formatCurrency } from '@/utils/formatters';

interface PaymentMovement extends HousePaymentTransaction {
  type: 'transaction' | 'voucher';
  _date: number;
  created_at?: string;
  confirmation_code?: string;
  house_number?: number;
}

function groupMovementsByYear(movements: PaymentMovement[]): Record<number, PaymentMovement[]> {
  return movements.reduce<Record<number, PaymentMovement[]>>((acc, m) => {
    const year = new Date(m._date).getFullYear();
    acc[year] = acc[year] ?? [];
    acc[year].push(m);
    return acc;
  }, {});
}

interface HousePaymentCardProps {
  houseId: number;
  isExpanded: boolean;
  /** undefined = no preference (show most recent); null = all collapsed; number = that year */
  activeYear: number | null | undefined;
  onToggleExpand: () => void;
  onToggleYear: (year: number) => void;
}

export function HousePaymentCard({ houseId, isExpanded, activeYear, onToggleExpand, onToggleYear }: HousePaymentCardProps) {
  const { history: paymentHistory, isLoading } = usePaymentHistoryQuery(houseId);

  if (isLoading) {
    return (
      <div className="bg-base shadow-lg rounded-lg border-4 p-6">
        <h2 className="text-lg font-bold mb-4">Casa #{houseId}</h2>
        <p className="text-foreground-secondary">Cargando datos...</p>
      </div>
    );
  }

  if (!paymentHistory) {
    return (
      <div className="bg-base shadow-lg rounded-lg border-4 p-6">
        <h2 className="text-lg font-bold mb-4">Casa #{houseId}</h2>
        <p className="text-foreground-secondary">Error al cargar datos</p>
      </div>
    );
  }

  // Combine movements
  const allMovements: PaymentMovement[] = [];

  if (paymentHistory.transactions?.length > 0) {
    paymentHistory.transactions.forEach((t: HousePaymentTransaction) => {
      allMovements.push({ ...t, type: 'transaction', _date: new Date(t.date).getTime(), house_number: houseId });
    });
  }

  if ((paymentHistory.unreconciled_vouchers?.vouchers?.length ?? 0) > 0) {
    paymentHistory.unreconciled_vouchers!.vouchers!.forEach((v: UnreconciledVoucher) => {
      allMovements.push({
        date: v.date,
        time: new Date(v.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        amount: v.amount,
        confirmation_status: v.confirmation_status,
        type: 'voucher',
        created_at: v.created_at,
        confirmation_code: v.confirmation_code,
        _date: new Date(v.date).getTime(),
        house_number: houseId,
      } as PaymentMovement);
    });
  }

  allMovements.sort((a, b) => b._date - a._date);
  const yearGroups = groupMovementsByYear(allMovements);
  const sortedYears = Object.keys(yearGroups).map(Number).sort((a, b) => b - a);
  // undefined → no preference → default to most recent year; null → all collapsed; number → that year
  const effectiveYear = activeYear === undefined ? (sortedYears[0] ?? null) : activeYear;

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
    <div className="bg-base shadow-lg rounded-lg border-2 border-primary p-6">
      <div className="flex items-center justify-between cursor-pointer mb-4" onClick={onToggleExpand}>
        <div className="flex-1">
          <h2 className="text-lg font-bold">🏠 Casa #{houseId}</h2>
          <p className="text-sm text-foreground-secondary">{allMovements.length} movimientos</p>
        </div>
        <span className="text-2xl">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-base">
            <div className="bg-secondary p-3 rounded">
              <p className="text-xs text-foreground-secondary mb-1">Total Transacciones</p>
              <p className="text-xl font-bold text-primary">{paymentHistory.total_transactions}</p>
            </div>
            <div className="bg-secondary p-3 rounded">
              <p className="text-xs text-foreground-secondary mb-1">Monto Total</p>
              <p className="text-xl font-bold text-success">${formatCurrency(paymentHistory.total_amount)}</p>
            </div>
            <div className="bg-secondary p-3 rounded">
              <p className="text-xs text-foreground-secondary mb-1">Confirmadas</p>
              <p className="text-xl font-bold text-success">{paymentHistory.confirmed_transactions}</p>
            </div>
            <div className="bg-secondary p-3 rounded">
              <p className="text-xs text-foreground-secondary mb-1">Pendientes</p>
              <p className="text-xl font-bold text-warning">{paymentHistory.pending_transactions}</p>
            </div>
          </div>

          {allMovements.length > 0 ? (
            <div className="space-y-2">
              {sortedYears.map((year) => {
                const isYearOpen = effectiveYear === year;
                const yearMovements = yearGroups[year];

                return (
                  <div key={year} className="rounded-lg border border-primary overflow-hidden">
                    <div
                      className="flex items-center justify-between cursor-pointer px-4 py-3 bg-base transition-colors"
                      onClick={() => onToggleYear(year)}
                    >
                      <span className="font-semibold text-foreground">{year}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-foreground">
                          {yearMovements.length} movimiento{yearMovements.length !== 1 ? 's' : ''}
                        </span>
                        <span className="text-lg text-foreground">{isYearOpen ? '▼' : '▶'}</span>
                      </div>
                    </div>

                    {isYearOpen && (
                      <div className="overflow-x-auto">
                        <ExpandableTable<PaymentMovement>
                          data={yearMovements}
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
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-foreground-secondary">No hay movimientos disponibles</div>
          )}
        </>
      )}
    </div>
  );
}
