import { useState } from 'react';
import { usePaymentHistoryQuery, usePeriodChargesQuery } from '@hooks/usePaymentManagement';
import { useFormatDate } from '@hooks/useFormatDate';
import { useAuth } from '@hooks/useAuth';
import { StatusBadge } from '@shared/ui';
import { ExpandableTable } from '@shared/ui';
import type { HousePaymentTransaction, UnreconciledVoucher, PeriodChargeSummary } from '@shared';
import { formatCurrency } from '@/utils/formatters';

interface PaymentMovement extends HousePaymentTransaction {
  type: 'transaction' | 'voucher';
  _date: number;
  created_at?: string;
  confirmation_code?: string;
  house_number?: number;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function groupMovementsByYear(movements: PaymentMovement[]): Record<number, PaymentMovement[]> {
  return movements.reduce<Record<number, PaymentMovement[]>>((acc, m) => {
    const year = new Date(m._date).getFullYear();
    acc[year] = acc[year] ?? [];
    acc[year].push(m);
    return acc;
  }, {});
}

function groupChargesByYear(charges: PeriodChargeSummary[]): Record<number, PeriodChargeSummary[]> {
  return charges.reduce<Record<number, PeriodChargeSummary[]>>((acc, c) => {
    acc[c.year] = acc[c.year] ?? [];
    acc[c.year].push(c);
    return acc;
  }, {});
}

// ── PeriodChargesTable ───────────────────────────────────────────────────────

function PeriodChargesTable() {
  const { charges, isLoading } = usePeriodChargesQuery();
  const currentYear = new Date().getFullYear();

  const [isOpen, setIsOpen] = useState(false);
  const [expandedYear, setExpandedYear] = useState<number | null>(currentYear);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm mb-6">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
        Cargando cuotas...
      </div>
    );
  }

  if (charges.length === 0) return null;

  const chargesByYear = groupChargesByYear(charges);
  const sortedYears = Object.keys(chargesByYear).map(Number).sort((a, b) => b - a);

  // Compute presence of optional concepts across ALL charges
  const hasWater = charges.some((c) => c.water_active);
  const hasExtraordinary = charges.some((c) => c.extraordinary_fee_active);

  const toggleYear = (year: number) => {
    setExpandedYear((prev) => (prev === year ? null : year));
  };

  return (
    <div className="shadow-lg rounded-lg border-4 border-info mb-6">
      {/* Header colapsable */}
      <div
        className="flex items-center justify-between cursor-pointer p-6"
        onClick={() => setIsOpen((v) => !v)}
      >
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">Cuotas por mes</h2>
          <p className="text-sm text-foreground-tertiary mt-0.5">
            {charges.length} periodos · {sortedYears.length} años
          </p>
        </div>
        <span className="text-2xl text-info">{isOpen ? '▼' : '▶'}</span>
      </div>

      {isOpen && (
        <div className="px-6 pb-6 space-y-2">
          {sortedYears.map((year) => {
            const yearCharges = chargesByYear[year];
            const isYearOpen = expandedYear === year;

            return (
              <div key={year} className="rounded-lg border border-info overflow-hidden">
                {/* Año header */}
                <div
                  className="flex items-center justify-between cursor-pointer px-4 py-3 bg-base transition-colors"
                  onClick={() => toggleYear(year)}
                >
                  <span className="font-semibold text-foreground">{year}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-foreground">{yearCharges.length} meses</span>
                    <span className="text-lg text-foreground">{isYearOpen ? '▼' : '▶'}</span>
                  </div>
                </div>

                {isYearOpen && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-info text-foreground">
                          <th className="text-left px-4 py-2 font-semibold">Periodo</th>
                          <th className="text-center px-4 py-2 font-semibold">Mantenimiento</th>
                          {hasWater && (
                            <th className="text-center px-4 py-2 font-semibold">Agua</th>
                          )}
                          {hasExtraordinary && (
                            <th className="text-center px-4 py-2 font-semibold">Cuota Extra</th>
                          )}
                          <th className="text-center px-4 py-2 font-semibold">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearCharges.map((charge, idx) => {
                          const waterAmt =
                            charge.water_active && charge.water_amount ? charge.water_amount : 0;
                          const extraAmt =
                            charge.extraordinary_fee_active && charge.extraordinary_fee_amount
                              ? charge.extraordinary_fee_amount
                              : 0;
                          const total = charge.maintenance_amount + waterAmt + extraAmt;

                          return (
                            <tr
                              key={charge.period_id}
                              className={idx % 2 === 0 ? 'bg-secondary' : ''}
                            >
                              <td className="px-4 py-2 font-medium">{charge.display_name}</td>
                              <td className="px-4 py-2 text-center">
                                ${formatCurrency(charge.maintenance_amount)}
                              </td>
                              {hasWater && (
                                <td className="px-4 py-2 text-center">
                                  {charge.water_active && charge.water_amount ? (
                                    `$${formatCurrency(charge.water_amount)}`
                                  ) : (
                                    <span className="text-foreground">—</span>
                                  )}
                                </td>
                              )}
                              {hasExtraordinary && (
                                <td className="px-4 py-2 text-center">
                                  {charge.extraordinary_fee_active &&
                                  charge.extraordinary_fee_amount ? (
                                    `$${formatCurrency(charge.extraordinary_fee_amount)}`
                                  ) : (
                                    <span className="text-foreground-secondary">—</span>
                                  )}
                                </td>
                              )}
                              <td className="px-4 py-2 text-center font-semibold text-primary">
                                ${formatCurrency(total)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── MyHousePayments ──────────────────────────────────────────────────────────

export function MyHousePayments() {
  const { user } = useAuth();

  const houseNumbers = user?.houses || [];

  const [expandedHouses, setExpandedHouses] = useState<number[]>(() =>
    houseNumbers.length > 0 ? [houseNumbers[0]] : []
  );

  // Per-house: which year is expanded (null = all collapsed).
  // If a house has no entry, the most recent year is shown by default.
  const [expandedHouseYears, setExpandedHouseYears] = useState<Record<number, number | null>>({});

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

  const toggleHouseYear = (houseId: number, year: number): void => {
    setExpandedHouseYears((prev) => ({
      ...prev,
      [houseId]: prev[houseId] === year ? null : year,
    }));
  };

  // ── Render helpers for movements ─────────────────────────────────────────

  const renderMovementType = (movement: PaymentMovement) => (
    <span
      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
        movement.type === 'transaction' ? 'text-info' : 'text-warning'
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
    `$${formatCurrency(movement.amount)}`;

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

  const getMovementKey = (movement: PaymentMovement): string =>
    `${movement.type}-${movement.date}-${movement.amount}`;

  // ── Empty state ───────────────────────────────────────────────────────────

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

      <div className="space-y-6 my-2">
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

          // Combinar transacciones y vouchers
          const allMovements: PaymentMovement[] = [];

          if (paymentHistory.transactions?.length > 0) {
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

          allMovements.sort((a, b) => b._date - a._date);

          // Agrupar movimientos por año
          const yearGroups = groupMovementsByYear(allMovements);
          const sortedYears = Object.keys(yearGroups).map(Number).sort((a, b) => b - a);
          const mostRecentYear = sortedYears[0] ?? null;
          // Si no hay entrada explícita para esta casa, expandir el año más reciente
          const activeYear =
            houseId in expandedHouseYears ? expandedHouseYears[houseId] : mostRecentYear;

          return (
            <div
              key={houseId}
              className="bg-base shadow-lg rounded-lg border-2 border-primary p-6"
            >
              {/* Header colapsable de casa */}
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
                <span className="text-2xl">{isExpanded ? '▼' : '▶'}</span>
              </div>

              {isExpanded && (
                <>
                  {/* Resumen estadístico */}
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
                        ${formatCurrency(paymentHistory.total_amount)}
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

                  {/* Movimientos agrupados por año */}
                  {allMovements.length > 0 ? (
                    <div className="space-y-2">
                      {sortedYears.map((year) => {
                        const isYearOpen = activeYear === year;
                        const yearMovements = yearGroups[year];

                        return (
                          <div
                            key={year}
                            className="rounded-lg border border-primary overflow-hidden"
                          >
                            {/* Año header */}
                            <div
                              className="flex items-center justify-between cursor-pointer px-4 py-3 bg-base transition-colors"
                              onClick={() => toggleHouseYear(houseId, year)}
                            >
                              <span className="font-semibold text-foreground">{year}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-foreground">
                                  {yearMovements.length} movimiento
                                  {yearMovements.length !== 1 ? 's' : ''}
                                </span>
                                <span className="text-lg text-foreground">
                                  {isYearOpen ? '▼' : '▶'}
                                </span>
                              </div>
                            </div>

                            {isYearOpen && (
                              <div className="overflow-x-auto">
                                <ExpandableTable<PaymentMovement>
                                  data={yearMovements}
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
                            )}
                          </div>
                        );
                      })}
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

      <PeriodChargesTable />
    </div>
  );
}
