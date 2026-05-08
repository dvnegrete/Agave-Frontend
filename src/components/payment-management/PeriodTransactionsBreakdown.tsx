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
      render: (t) => <span className="font-semibold">${formatCurrency(t.amount)}</span>,
    },
    {
      id: 'concept',
      header: 'Concepto',
      align: 'left',
      render: (t) => (
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
      render: (t) => (
        <StatusBadge
          status={t.confirmation_status ? 'success' : 'warning'}
          label={t.confirmation_status ? 'Confirmada' : 'Pendiente'}
          icon={t.confirmation_status ? '✓' : '⏳'}
        />
      ),
    },
  ];

  return (
    <div className="mt-3">
      <h5 className="text-xs font-bold text-foreground mb-2">
        💳 Transacciones aplicadas a este período ({transactions.length})
      </h5>
      <Table<PeriodTransaction>
        columns={columns}
        data={transactions}
        keyField={(t) => t.transaction_id}
        emptyMessage="Sin transacciones"
        variant="compact"
        hoverable={false}
      />
    </div>
  );
}
