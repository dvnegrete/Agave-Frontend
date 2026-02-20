import { usePeriodsQuery } from '@hooks/usePaymentManagement';
import { useFormatDate } from '@hooks/useFormatDate';
import { Table, type TableColumn } from '@shared/ui';
import type { PeriodResponseDto } from '@shared';

export function PeriodsTab() {
  const { periods, isLoading, error } = usePeriodsQuery();

  return (
    <div className="bg-secondary shadow-lg rounded-lg border-4 border-primary/10 p-6">
      <h2 className="text-2xl font-bold mb-4 text-foreground">📋 Períodos de Facturación</h2>

      {error && (
        <div className="border-l-4 border-error rounded-lg p-4 mb-4 flex items-start gap-3">
          <span className="text-error text-xl">❌</span>
          <div className="flex-1">
            <p className="text-error font-semibold">Error al cargar</p>
            <p className="text-error text-sm">{error}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-foreground-secondary">Cargando períodos...</div>
      ) : (
        <Table
          columns={[
            { id: 'month', header: 'Mes', align: 'center', render: (period) => period.month },
            { id: 'year', header: 'Año', align: 'center', render: (period) => period.year },
            { id: 'start_date', header: 'Fecha Inicio', align: 'center', render: (period) => useFormatDate(period.start_date) },
            { id: 'end_date', header: 'Fecha Fin', align: 'center', render: (period) => useFormatDate(period.end_date) },
          ] as TableColumn<PeriodResponseDto>[]}
          data={periods}
          emptyMessage="No hay períodos registrados"
          hoverable
        />
      )}
    </div>
  );
}
