import { usePeriodTransactionsQuery } from '@hooks/usePaymentManagement';
import { useFormatDate } from '@hooks/useFormatDate';
import { StatusBadge, Table, type TableColumn } from '@shared/ui';
import { formatCurrency } from '@/utils/formatters';
import type { PeriodTransaction } from '@shared';

interface Props {
  houseId: number;
  periodId: number;
}

export function PeriodTransactionsBreakdown({ houseId, periodId }: Props) {
  const { transactions, isLoading, error } = usePeriodTransactionsQuery(houseId, periodId);

  if (isLoading) {
    return <p className="text-xs text-foreground-secondary p-2">Cargando transacciones...</p>;
  }

  if (error) {
    return <p className="text-xs text-error p-2">Error al cargar transacciones: {error}</p>;
  }

  if (!transactions || transactions.length === 0) {
    return (
      <p className="text-xs text-foreground-secondary p-2 italic">
        Sin transacciones aplicadas a este período.
      </p>
    );
  }

  const columns: TableColumn<PeriodTransaction>[] = [
    {
      id: 'date',
      header: 'Fecha',
      align: 'left',
      render: (t) => <span className="font-mono text-xs">{useFormatDate(t.date)}</span>,
    },
    {
      id: 'amount',
      header: 'Monto',
      align: 'right',
      render: (t) =>
        t.source === 'system_credit' ? (
          <span className="text-xs italic text-foreground-secondary">
            (aplicado: ${formatCurrency(t.allocated_to_period)})
          </span>
        ) : (
          <span className="font-semibold">${formatCurrency(t.amount ?? 0)}</span>
        ),
    },
    {
      id: 'concept',
      header: 'Concepto',
      align: 'left',
      render: (t) =>
        t.source === 'system_credit' ? (
          <span className="text-xs font-semibold text-info">
            💰 Crédito del sistema (saldo a favor aplicado vía FIFO)
          </span>
        ) : (
          <span className="text-xs" title={t.concept ?? undefined}>
            {t.concept || '—'}
          </span>
        ),
    },
    {
      id: 'bank_name',
      header: 'Banco',
      align: 'left',
      render: (t) => <span className="text-xs">{t.bank_name || '—'}</span>,
    },
    {
      id: 'confirmation_status',
      header: 'Estado',
      align: 'center',
      render: (t) =>
        t.source === 'system_credit' ? (
          <StatusBadge status="info" label="Sistema" icon="⚙️" />
        ) : (
          <StatusBadge
            status={t.confirmation_status ? 'success' : 'warning'}
            label={t.confirmation_status ? 'Confirmada' : 'Pendiente'}
            icon={t.confirmation_status ? '✓' : '⏳'}
          />
        ),
    },
  ];

  const rowKey = (t: PeriodTransaction): string =>
    t.source === 'system_credit'
      ? `sc-${t.date}-${t.allocated_to_period}`
      : `bank-${t.transaction_id}`;

  return (
    <div className="mt-3">
      <h5 className="text-xs font-bold text-foreground mb-2">
        💳 Fuentes de pago aplicadas a este período ({transactions.length})
      </h5>
      <Table<PeriodTransaction>
        columns={columns}
        data={transactions}
        keyField={rowKey}
        emptyMessage="Sin fuentes de pago"
        variant="compact"
        hoverable={false}
      />
    </div>
  );
}
