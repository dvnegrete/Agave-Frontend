import { useMemo, useState } from 'react';
import { useHousesSummaryQuery } from '@hooks/usePaymentManagement';
import { useFormatDate } from '@hooks/useFormatDate';
import { StatsCard, StatusBadge, Table, type TableColumn } from '@shared/ui';
import {
  getHouseStatusVariant,
  getHouseStatusLabel,
  getHouseStatusIcon,
} from '@/utils/paymentStatusHelpers';
import type { EnrichedHouseBalance, HouseStatus } from '@shared';
import { formatCurrency } from '@/utils/formatters';

type StatusFilter = 'all' | HouseStatus;

interface HousesOverviewPanelProps {
  onSelectHouse: (houseNumber: number) => void;
}

const STATUS_PRIORITY: Record<HouseStatus, number> = {
  morosa: 0,
  saldo_a_favor: 1,
  al_dia: 2,
};

const FILTER_OPTIONS: Array<{ value: StatusFilter; label: string; icon?: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'morosa', label: 'Morosas', icon: '🔴' },
  { value: 'al_dia', label: 'Al Día', icon: '✅' },
  { value: 'saldo_a_favor', label: 'Saldo a Favor', icon: '💚' },
];

export function HousesOverviewPanel({ onSelectHouse }: HousesOverviewPanelProps) {
  const { summary, isLoading, error, refetch, isFetching } = useHousesSummaryQuery();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const sortedFiltered = useMemo(() => {
    if (!summary?.houses) return [];
    const filtered = statusFilter === 'all'
      ? summary.houses
      : summary.houses.filter((h) => h.status === statusFilter);
    return [...filtered].sort((a, b) => {
      const priorityDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
      if (priorityDiff !== 0) return priorityDiff;
      return a.house_number - b.house_number;
    });
  }, [summary, statusFilter]);

  if (isLoading) {
    return <div className="text-center py-8 text-foreground-secondary">Cargando resumen global...</div>;
  }

  if (error) {
    return (
      <div className="border-l-4 border-error rounded-lg p-4 mb-4 flex items-start gap-3">
        <span className="text-error text-xl">❌</span>
        <div className="flex-1">
          <p className="text-error font-semibold">Error al cargar el resumen</p>
          <p className="text-error text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const columns: TableColumn<EnrichedHouseBalance>[] = [
    {
      id: 'house_number',
      header: 'Casa',
      align: 'center',
      render: (house) => <span className="font-bold text-foreground">#{house.house_number}</span>,
    },
    {
      id: 'status',
      header: 'Estado',
      align: 'center',
      render: (house) => (
        <StatusBadge
          status={getHouseStatusVariant(house.status)}
          label={getHouseStatusLabel(house.status)}
          icon={getHouseStatusIcon(house.status)}
        />
      ),
    },
    {
      id: 'total_debt',
      header: 'Deuda',
      align: 'right',
      render: (house) => (
        <span className={house.total_debt > 0 ? 'text-error font-semibold' : 'text-foreground-secondary'}>
          ${formatCurrency(house.total_debt)}
        </span>
      ),
    },
    {
      id: 'credit_balance',
      header: 'Crédito',
      align: 'right',
      render: (house) => (
        <span className={house.credit_balance > 0 ? 'text-success font-semibold' : 'text-foreground-secondary'}>
          ${formatCurrency(house.credit_balance)}
        </span>
      ),
    },
    {
      id: 'total_unpaid_periods',
      header: 'Vencidos',
      align: 'center',
      render: (house) => (
        <span className={house.total_unpaid_periods > 0 ? 'text-error font-semibold' : 'text-foreground-secondary'}>
          {house.total_unpaid_periods}
        </span>
      ),
    },
    {
      id: 'next_due_date',
      header: 'Próx. Vencimiento',
      align: 'center',
      render: (house) =>
        house.next_due_date
          ? <span className="font-mono text-xs">{useFormatDate(house.next_due_date)}</span>
          : <span className="text-foreground-secondary">—</span>,
    },
    {
      id: 'action',
      header: '',
      align: 'center',
      render: () => <span className="text-primary text-lg">→</span>,
    },
  ];

  const rowClassName = (house: EnrichedHouseBalance) => {
    if (house.status === 'morosa') return 'bg-error/5';
    if (house.status === 'saldo_a_favor') return 'bg-success/5';
    return '';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Total Casas" value={summary.total_houses} variant="primary" icon="🏘️" />
        <StatsCard label="Morosas" value={summary.morosas} variant="error" icon="🔴" />
        <StatsCard label="Al Día" value={summary.al_dia} variant="success" icon="✅" />
        <StatsCard label="Saldo a Favor" value={summary.saldo_a_favor} variant="info" icon="💚" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard label="Deuda Total Acumulada" value={`$${formatCurrency(summary.total_debt)}`} variant="error" icon="📉" />
        <StatsCard label="Crédito Total Acumulado" value={`$${formatCurrency(summary.total_credit)}`} variant="success" icon="💰" />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-foreground-secondary">Filtrar:</span>
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1 rounded-full text-sm font-semibold transition-all border ${
                statusFilter === opt.value
                  ? 'bg-primary text-tertiary border-primary'
                  : 'bg-secondary text-foreground border-base hover:border-primary/50'
              }`}
            >
              {opt.icon && <span className="mr-1">{opt.icon}</span>}
              {opt.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => { void refetch(); }}
          disabled={isFetching}
          className="text-sm text-primary hover:underline disabled:opacity-50"
        >
          {isFetching ? 'Actualizando...' : '🔄 Refrescar'}
        </button>
      </div>

      <div>
        <p className="text-xs text-foreground-secondary mb-2">
          Mostrando {sortedFiltered.length} de {summary.total_houses} casas. Haz clic en una fila para ver el detalle.
        </p>
        <Table<EnrichedHouseBalance>
          columns={columns}
          data={sortedFiltered}
          keyField={(house) => house.house_id}
          rowClassName={rowClassName}
          onRowClick={(house) => onSelectHouse(house.house_number)}
          emptyMessage="No hay casas que coincidan con el filtro"
          hoverable
          variant="compact"
          headerVariant="primary"
        />
      </div>
    </div>
  );
}
