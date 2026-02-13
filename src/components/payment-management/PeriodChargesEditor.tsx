import { useState } from 'react';
import { Button, Table, StatusBadge, StatsCard } from '@shared/ui';
import type { TableColumn } from '@shared/ui';
import {
  usePeriodChargesQuery,
  useBatchUpdateChargesMutation,
  useReprocessAllocationsMutation,
} from '@hooks/usePaymentManagement';
import type {
  PeriodChargeSummary,
  BatchUpdateResult,
  ReprocessResult,
} from '@shared';

const MONTH_OPTIONS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => 2020 + i);

const formatCurrency = (amount: number | null): string => {
  if (amount === null) return '-';
  return `$${amount.toLocaleString('es-MX')}`;
};

export function PeriodChargesEditor() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Query & Mutations
  const { charges, isLoading, error, refetch } = usePeriodChargesQuery();
  const { batchUpdate, isPending: batchPending } = useBatchUpdateChargesMutation();
  const { reprocess, isPending: reprocessPending } = useReprocessAllocationsMutation();

  // Form state
  const [startYear, setStartYear] = useState(2024);
  const [startMonth, setStartMonth] = useState(12);
  const [endYear, setEndYear] = useState(currentYear);
  const [endMonth, setEndMonth] = useState(currentMonth);
  const [maintenance, setMaintenance] = useState(800);
  const [water, setWater] = useState('');
  const [extraordinary, setExtraordinary] = useState('');

  // UI state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchUpdateResult | null>(null);
  const [showReprocessPrompt, setShowReprocessPrompt] = useState(false);
  const [reprocessResult, setReprocessResult] = useState<ReprocessResult | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = () => {
    setFormError(null);

    if (maintenance < 0) {
      setFormError('El monto de mantenimiento debe ser mayor o igual a 0');
      return;
    }

    const startValue = startYear * 12 + startMonth;
    const endValue = endYear * 12 + endMonth;
    if (startValue > endValue) {
      setFormError('El periodo de inicio debe ser anterior o igual al periodo de fin');
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    try {
      const amounts: { maintenance_amount: number; water_amount?: number; extraordinary_fee_amount?: number } = {
        maintenance_amount: maintenance,
      };

      if (water !== '') {
        amounts.water_amount = parseFloat(water);
      }
      if (extraordinary !== '') {
        amounts.extraordinary_fee_amount = parseFloat(extraordinary);
      }

      const result = await batchUpdate({
        start_year: startYear,
        start_month: startMonth,
        end_year: endYear,
        end_month: endMonth,
        amounts,
      });

      setBatchResult(result);
      setShowConfirmDialog(false);

      if (result.has_retroactive_changes) {
        setShowReprocessPrompt(true);
      }

      await refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al actualizar cargos');
      setShowConfirmDialog(false);
    }
  };

  const handleReprocess = async () => {
    try {
      const result = await reprocess();
      setReprocessResult(result);
      setShowReprocessPrompt(false);
      await refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al reprocesar');
      setShowReprocessPrompt(false);
    }
  };

  const totalChargesForPeriod = (period: PeriodChargeSummary): number => {
    const extraFewAmount = period.extraordinary_fee_active && period.extraordinary_fee_amount ? period.extraordinary_fee_amount : 0;
    const waterAmount = period.water_active && period.water_amount ? period.water_amount : 0;
    return period.maintenance_amount + extraFewAmount + waterAmount;
  }

  // Table columns
  const columns: TableColumn<PeriodChargeSummary>[] = [
    {
      key: 'display_name',
      header: 'Periodo',
      render: (row) => (
        <span className="font-medium">{row.display_name}</span>
      ),
    },
    {
      key: 'maintenance_amount',
      header: 'Mantenimiento',
      align: 'center' as const,
      render: (row) => formatCurrency(row.maintenance_amount),
    },
    {
      key: 'water_amount',
      header: 'Agua',
      align: 'center' as const,
      render: (row) => (
        <span className={!row.water_active ? 'text-foreground/40' : ''}>
          {row.water_active ? formatCurrency(row.water_amount) : '-'}
        </span>
      ),
    },
    {
      key: 'extraordinary_fee_amount',
      header: 'Cuota Extra.',
      align: 'center' as const,
      render: (row) => (
        <span className={!row.extraordinary_fee_active ? 'text-foreground/40' : ''}>
          {row.extraordinary_fee_active
            ? formatCurrency(row.extraordinary_fee_amount)
            : '-'}
        </span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      align: 'center' as const,
      render: (row) => (
        <span className={!row.extraordinary_fee_active ? 'text-foreground/40' : ''}>
          {formatCurrency(totalChargesForPeriod(row))}
        </span>
      )

    },
    // {
    //   key: 'has_allocations',
    //   header: 'Pagos',
    //   align: 'center' as const,
    //   render: (row) =>
    //     row.has_allocations ? (
    //       <StatusBadge status="success" label="Con pagos" />
    //     ) : (
    //       <StatusBadge status="pending" label="Sin pagos" />
    //     ),
    // },
  ];

  const periodsInRange = (() => {
    const startValue = startYear * 12 + startMonth;
    const endValue = endYear * 12 + endMonth;
    if (startValue > endValue) return 0;
    return endValue - startValue + 1;
  })();

  return (
    <div className="space-y-6">
      {/* Tabla de Periodos */}
      <div className="bg-secondary shadow-lg rounded-lg border-4 border-primary/10 p-6">
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          Cargos por Periodo
        </h2>

        {error && (
          <div className="border-l-4 border-error rounded-lg p-4 mb-4">
            <p className="text-error font-semibold">Error al cargar</p>
            <p className="text-error text-sm">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <span className="ml-3 text-foreground/70">Cargando periodos...</span>
          </div>
        ) : (
          <Table
            columns={columns}
            data={charges}
            keyField="period_id"
            variant="compact"
            headerVariant="primary"
            striped
            hoverable
            emptyMessage="No hay periodos registrados"
          />
        )}
      </div>

      {/* Formulario Batch Editor */}
      <div className="bg-secondary shadow-lg rounded-lg border-4 border-primary/10 p-6">
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          Editar Cargos en Lote
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Periodo Inicio */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Periodo Inicio
            </label>
            <div className="flex gap-2">
              <select
                className="flex-1 rounded-lg border border-foreground/20 bg-base px-3 py-2 text-foreground"
                value={startMonth}
                onChange={(e) => setStartMonth(Number(e.target.value))}
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <select
                className="w-24 rounded-lg border border-foreground/20 bg-base px-3 py-2 text-foreground"
                value={startYear}
                onChange={(e) => setStartYear(Number(e.target.value))}
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Periodo Fin */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Periodo Fin
            </label>
            <div className="flex gap-2">
              <select
                className="flex-1 rounded-lg border border-foreground/20 bg-base px-3 py-2 text-foreground"
                value={endMonth}
                onChange={(e) => setEndMonth(Number(e.target.value))}
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <select
                className="w-24 rounded-lg border border-foreground/20 bg-base px-3 py-2 text-foreground"
                value={endYear}
                onChange={(e) => setEndYear(Number(e.target.value))}
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Mantenimiento */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Mantenimiento *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">
                $
              </span>
              <input
                type="number"
                min="0"
                className="w-full rounded-lg border border-foreground/20 bg-base pl-7 pr-3 py-2 text-foreground"
                value={maintenance}
                onChange={(e) => setMaintenance(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Agua */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Agua
              <span className="text-xs text-foreground/50 ml-1">
                (0 = desactivar, vacio = no cambiar)
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">
                $
              </span>
              <input
                type="number"
                min="0"
                className="w-full rounded-lg border border-foreground/20 bg-base pl-7 pr-3 py-2 text-foreground"
                value={water}
                onChange={(e) => setWater(e.target.value)}
                placeholder="No cambiar"
              />
            </div>
          </div>

          {/* Cuota Extraordinaria */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Cuota Extraordinaria
              <span className="text-xs text-foreground/50 ml-1">
                (0 = desactivar, vacio = no cambiar)
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">
                $
              </span>
              <input
                type="number"
                min="0"
                className="w-full rounded-lg border border-foreground/20 bg-base pl-7 pr-3 py-2 text-foreground"
                value={extraordinary}
                onChange={(e) => setExtraordinary(e.target.value)}
                placeholder="No cambiar"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <p className="text-sm text-foreground/60">
            {periodsInRange} periodo{periodsInRange !== 1 ? 's' : ''} x 66 casas
          </p>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={batchPending}
            isLoading={batchPending}
          >
            Aplicar Cambios
          </Button>
        </div>

        {formError && (
          <div className=" border-l-4 border-error rounded-lg p-4 mt-4">
            <p className="text-error text-sm">{formError}</p>
          </div>
        )}
      </div>

      {/* Dialogo de Confirmacion */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-secondary rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Confirmar Cambios
            </h3>
            <div className="space-y-2 mb-4">
              <p className="text-foreground/80">
                Se actualizaran los cargos de{' '}
                <strong>{periodsInRange} periodo{periodsInRange !== 1 ? 's' : ''}</strong> para{' '}
                <strong>66 casas</strong>.
              </p>
              <ul className="text-sm text-foreground/70 space-y-1 ml-4 list-disc">
                <li>Mantenimiento: {formatCurrency(maintenance)}</li>
                {water !== '' && (
                  <li>
                    Agua: {Number(water) === 0 ? 'Desactivar' : formatCurrency(Number(water))}
                  </li>
                )}
                {extraordinary !== '' && (
                  <li>
                    Cuota Extra:{' '}
                    {Number(extraordinary) === 0
                      ? 'Desactivar'
                      : formatCurrency(Number(extraordinary))}
                  </li>
                )}
              </ul>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="sameUi"
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                isLoading={batchPending}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Resultado del batch update */}
      {batchResult && !showReprocessPrompt && !reprocessResult && (
        <div className=" border-l-4 border-success rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-success font-semibold">Cargos actualizados</p>
              <p className="text-sm text-foreground/70">
                {batchResult.periods_affected} periodos afectados
                {batchResult.periods_created > 0 &&
                  `, ${batchResult.periods_created} creados`}
                , {batchResult.charges_updated} cargos actualizados
              </p>
            </div>
            <Button variant="sm" onClick={() => setBatchResult(null)}>
              Cerrar
            </Button>
          </div>
        </div>
      )}

      {/* Prompt para reprocesar */}
      {showReprocessPrompt && (
        <div className="border-l-4 border-warning rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-warning text-xl mt-0.5">!</span>
            <div className="flex-1">
              <p className="text-warning font-semibold">
                Cambios retroactivos detectados
              </p>
              <p className="text-sm text-foreground/70 mb-3">
                Algunos periodos modificados ya tienen pagos asignados. Para que los
                nuevos montos se reflejen correctamente, es necesario reprocesar las
                asignaciones FIFO.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="warning"
                  onClick={handleReprocess}
                  isLoading={reprocessPending}
                >
                  Reprocesar
                </Button>
                <Button
                  variant="sameUi"
                  onClick={() => {
                    setShowReprocessPrompt(false);
                    setBatchResult(null);
                  }}
                >
                  Despues
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resultado del reprocess */}
      {reprocessResult && (
        <div className="space-y-4">
          <div className="border-l-4 border-info rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-info font-semibold">
                Reprocesamiento completado
              </p>
              <Button
                variant="sm"
                onClick={() => {
                  setReprocessResult(null);
                  setBatchResult(null);
                }}
              >
                Cerrar
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              label="Allocations eliminadas"
              value={reprocessResult.allocations_deleted}
              variant="warning"
            />
            <StatsCard
              label="Balances reseteados"
              value={reprocessResult.balances_reset}
              variant="info"
            />
            <StatsCard
              label="Records procesados"
              value={reprocessResult.backfill_result.processed}
              variant="success"
            />
            <StatsCard
              label="Fallidos"
              value={reprocessResult.backfill_result.failed}
              variant={reprocessResult.backfill_result.failed > 0 ? 'error' : 'success'}
            />
          </div>
        </div>
      )}
    </div>
  );
}
