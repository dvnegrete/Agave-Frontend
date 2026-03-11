import { useHouseStatusQuery } from '@hooks/usePaymentManagement';
import { useFormatDate } from '@hooks/useFormatDate';
import { StatsCard, StatusBadge, ExpandableTable, Table, type TableColumn } from '@shared/ui';
import {
  getHouseStatusVariant,
  getHouseStatusLabel,
  getHouseStatusIcon,
  getPeriodStatusVariant,
  getPeriodStatusLabel,
  getConceptLabel,
} from '@/utils/paymentStatusHelpers';
import type { PeriodPaymentDetail, ConceptBreakdown, MorosidadReason } from '@shared';
import { formatCurrency } from '@/utils/formatters';

interface HouseStatusCardProps {
  houseId: number;
}

export function HouseStatusCard({ houseId }: HouseStatusCardProps) {
  const { houseStatus, isLoading, error } = useHouseStatusQuery(houseId);

  if (isLoading) {
    return <div className="text-center py-8 text-foreground-secondary">Cargando estado de cuenta...</div>;
  }

  if (error) {
    return (
      <div className="border-l-4 border-error rounded-lg p-4 mb-4 flex items-start gap-3">
        <span className="text-error text-xl">❌</span>
        <div className="flex-1">
          <p className="text-error font-semibold">Error al cargar</p>
          <p className="text-error text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!houseStatus) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-secondary shadow-lg rounded-lg border-4 border-primary/20 p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold">Casa #{houseStatus.house_number}</h3>
          <StatusBadge
            status={getHouseStatusVariant(houseStatus.status)}
            label={getHouseStatusLabel(houseStatus.status)}
            icon={getHouseStatusIcon(houseStatus.status)}
          />
        </div>
        {houseStatus.deadline_message && (
          <p className="text-sm text-foreground-secondary mt-2">{houseStatus.deadline_message}</p>
        )}
      </div>

      {/* Razones de morosidad */}
      {houseStatus.status === 'morosa' && houseStatus.morosidad_reasons?.length > 0 && (
        <div className="rounded-lg border-l-4 border-error p-4">
          <p className="font-bold text-error mb-3">⚠️ Conceptos vencidos pendientes de pago</p>
          <div className="space-y-2">
            {houseStatus.morosidad_reasons.map((reason: MorosidadReason, idx: number) => (
              <div key={idx} className="flex items-center justify-between bg-secondary rounded-lg px-4 py-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-error font-semibold">{reason.period_display_name}</span>
                  <span className="text-foreground-secondary">—</span>
                  <span className="capitalize">{getConceptLabel(reason.concept_type)}</span>
                </div>
                <span className="font-bold text-error">${formatCurrency(reason.pending_amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Deuda Total" value={`$${formatCurrency(houseStatus.total_debt)}`} variant="error" icon="📉" />
        <StatsCard label="Crédito" value={`$${formatCurrency(houseStatus.credit_balance)}`} variant="success" icon="💰" />
        <StatsCard label="Penalidades" value={`$${formatCurrency(houseStatus.summary.total_penalties)}`} variant="warning" icon="⚠️" />
        <StatsCard label="Centavos Acumulados" value={`$${formatCurrency(houseStatus.accumulated_cents)}`} variant="info" icon="🪙" />
      </div>
      <p>Nota: Los centavos acumulados pasaran automaticamente a Crédito al sumar $50.00</p>

      {/* Períodos Pendientes */}
      {houseStatus.unpaid_periods.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-3 text-foreground">
            📋 Períodos Pendientes ({houseStatus.total_unpaid_periods})
          </h3>
          <ExpandableTable<PeriodPaymentDetail>
            data={houseStatus.unpaid_periods}
            mainColumns={[
              {
                id: 'display_name', header: 'Período', align: 'left',
                render: (period) => (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{period.display_name}</span>
                    {period.is_overdue && <span className="text-xs text-error px-2 py-0.5 rounded-full font-bold">Vencido</span>}
                  </div>
                ),
              },
              { id: 'expected_total', header: 'Esperado', align: 'center', render: (period) => `$${formatCurrency(period.expected_total)}` },
              { id: 'paid_total', header: 'Pagado', align: 'center', render: (period) => `$${formatCurrency(period.paid_total)}`, className: 'text-success font-semibold' },
              { id: 'pending_total', header: 'Pendiente', align: 'center', render: (period) => `$${formatCurrency(period.pending_total)}`, className: 'text-error font-semibold' },
              {
                id: 'status', header: 'Estado', align: 'center',
                render: (period) => (
                  <StatusBadge status={getPeriodStatusVariant(period.status)} label={getPeriodStatusLabel(period.status)} />
                ),
              },
            ]}
            expandedContent={(period) => (
              <div className="p-4">
                <h4 className="text-sm font-bold text-foreground mb-3">Desglose por Concepto</h4>
                <Table<ConceptBreakdown>
                  columns={[
                    { id: 'concept_type', header: 'Concepto', align: 'left', render: (concept) => <span className="font-medium capitalize">{concept.concept_type.replace(/_/g, ' ')}</span> },
                    { id: 'expected_amount', header: 'Esperado', align: 'center', render: (concept) => `$${formatCurrency(concept.expected_amount)}` },
                    { id: 'paid_amount', header: 'Pagado', align: 'center', render: (concept) => `$${formatCurrency(concept.paid_amount)}` },
                    {
                      id: 'pending_amount', header: 'Pendiente', align: 'center',
                      render: (concept) => (
                        <span className={concept.pending_amount > 0 ? 'text-error font-semibold' : 'text-success font-semibold'}>
                          ${formatCurrency(concept.pending_amount)}
                        </span>
                      ),
                    },
                  ]}
                  data={[
                    ...period.concepts,
                    ...(period.penalty_amount > 0
                      ? [{ concept_type: 'penalidad', expected_amount: period.penalty_amount, paid_amount: 0, pending_amount: period.penalty_amount }]
                      : []),
                  ]}
                  emptyMessage="Sin conceptos"
                  hoverable
                />
              </div>
            )}
            keyField="period_id"
            variant="spacious"
            headerVariant="warning"
            emptyMessage="No hay períodos pendientes"
            expandButtonLabel={{ expand: '▶ Desglose', collapse: '▼ Ocultar' }}
          />
        </div>
      )}

      {/* Períodos Pagados */}
      {houseStatus.paid_periods.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-lg font-bold mb-3 text-foreground list-none flex items-center gap-2">
            <span className="transition-transform group-open:rotate-90">▶</span>
            ✅ Períodos Pagados ({houseStatus.paid_periods.length})
          </summary>
          <div className="mt-3">
            <Table<PeriodPaymentDetail>
              columns={[
                { id: 'display_name', header: 'Período', align: 'left', render: (period) => <span className="font-semibold">{period.display_name}</span> },
                { id: 'expected_total', header: 'Esperado', align: 'center', render: (period) => `$${formatCurrency(period.expected_total)}` },
                { id: 'paid_total', header: 'Pagado', align: 'center', render: (period) => `$${formatCurrency(period.paid_total)}` },
                { id: 'status', header: 'Estado', align: 'center', render: () => <StatusBadge status="success" label="Pagado" icon="✅" /> },
              ] as TableColumn<PeriodPaymentDetail>[]}
              data={houseStatus.paid_periods}
              emptyMessage="No hay períodos pagados"
              hoverable
            />
          </div>
        </details>
      )}

      {/* Períodos Próximos */}
      {houseStatus.upcoming_periods && houseStatus.upcoming_periods.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-lg font-bold mb-3 text-foreground list-none flex items-center gap-2">
            <span className="transition-transform group-open:rotate-90">▶</span>
            📅 Períodos Próximos ({houseStatus.upcoming_periods.length})
          </summary>
          <div className="mt-3">
            <Table<PeriodPaymentDetail>
              columns={[
                { id: 'display_name', header: 'Período', align: 'left', render: (period) => <span className="font-semibold">{period.display_name}</span> },
                { id: 'expected_total', header: 'Esperado', align: 'center', render: (period) => `$${formatCurrency(period.expected_total)}` },
                { id: 'pending_total', header: 'Pendiente', align: 'center', render: (period) => `$${formatCurrency(period.pending_total)}`, className: 'text-foreground-secondary font-semibold' },
                { id: 'status', header: 'Estado', align: 'center', render: () => <StatusBadge status="info" label="Próximo" icon="📅" /> },
              ] as TableColumn<PeriodPaymentDetail>[]}
              data={houseStatus.upcoming_periods}
              emptyMessage="No hay períodos próximos"
              hoverable
            />
          </div>
        </details>
      )}

      {/* Cobertura Bancaria */}
      {houseStatus.bank_coverage_date && (
        <div className="border border-info rounded-lg p-3 text-sm text-foreground">
          <p className="font-semibold">📊 Cobertura Bancaria:</p>
          <p className="text-foreground-secondary">Datos bancarios hasta: <span className="font-mono">{houseStatus.bank_coverage_date}</span></p>
        </div>
      )}

      {/* Resumen */}
      <div className="bg-tertiary rounded-lg border border-base p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center"><p className="text-foreground-secondary">Total Esperado</p><p className="font-bold text-foreground">${formatCurrency(houseStatus.summary.total_expected)}</p></div>
          <div className="text-center"><p className="text-foreground-secondary">Total Pagado</p><p className="font-bold text-success">${formatCurrency(houseStatus.summary.total_paid)}</p></div>
          <div className="text-center"><p className="text-foreground-secondary">Total Pendiente</p><p className="font-bold text-error">${formatCurrency(houseStatus.summary.total_pending)}</p></div>
          <div className="text-center"><p className="text-foreground-secondary">Próx. Vencimiento</p><p className="font-bold text-foreground">{houseStatus.next_due_date ? useFormatDate(houseStatus.next_due_date) : 'N/A'}</p></div>
        </div>
      </div>
    </div>
  );
}
