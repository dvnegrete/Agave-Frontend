import { useState } from 'react';
import { usePeriodsQuery, usePeriodMutations, usePaymentHistoryQuery, useHouseStatusQuery, usePeriodConfigMutations, useBackfillAllocationsMutation } from '@hooks/usePaymentManagement';
import { useFormatDate } from '@hooks/useFormatDate';
import { useAlert } from '@hooks/useAlert';
import { Button } from '@shared/ui';
import { Tabs, type TabItem } from '@shared/ui';
import { StatusBadge } from '@shared/ui';
import { StatsCard } from '@shared/ui';
import { Table, type TableColumn } from '@shared/ui';
import { ExpandableTable } from '@shared/ui';
import { UnclaimedDepositsSection } from '@components/reconciliation';
import { PeriodChargesEditor } from '@components/payment-management/PeriodChargesEditor';
import type { HousePaymentTransaction, UnreconciledVoucher, PeriodResponseDto, PeriodPaymentDetail, ConceptBreakdown, HouseStatus, BackfillRecordResult } from '@shared';
import type { ActiveTab } from '@/shared/types/payment-management.types';

interface PaymentMovement extends HousePaymentTransaction {
  type: 'transaction' | 'voucher';
  _date: number;
  created_at?: string;
  confirmation_code?: string;
}

export function PaymentManagement() {
  const alert = useAlert();
  const [activeTab, setActiveTab] = useState<ActiveTab>('unclaimed-deposits');
  const [selectedHouseId, setSelectedHouseId] = useState<number | null>(null);
  const [newYear, setNewYear] = useState<number>(new Date().getFullYear());
  const [newMonth, setNewMonth] = useState<number>(new Date().getMonth() + 1);
  const [newConfigData, setNewConfigData] = useState({
    maintenance_amount: 0,
    water_amount: 0,
    extraordinary_fee: 0,
    due_day: 15,
  });
  const [backfillHouseNumber, setBackfillHouseNumber] = useState<number | undefined>(undefined);
  const [showBackfillResults, setShowBackfillResults] = useState(false);

  // Queries and Mutations
  const { periods, isLoading: periodsLoading, error: periodsError } = usePeriodsQuery();
  const { createPeriod, isLoading: periodMutating } = usePeriodMutations();
  const { createConfig, isLoading: configMutating } = usePeriodConfigMutations();
  const { history: paymentHistory, isLoading: historyLoading } = usePaymentHistoryQuery(selectedHouseId);
  const { houseStatus, isLoading: statusLoading, error: statusError } = useHouseStatusQuery(selectedHouseId);
  const { backfill, isPending: backfillPending, data: backfillData, error: backfillError } = useBackfillAllocationsMutation();

  // Handlers
  const handleCreatePeriod = async (): Promise<void> => {
    try {
      await createPeriod({ year: newYear, month: newMonth });
      setNewYear(new Date().getFullYear());
      setNewMonth(new Date().getMonth() + 1);
      setActiveTab('periods');
    } catch (err) {
      console.error('Error creating period:', err);
    }
  };

  const handleCreateConfig = async (): Promise<void> => {
    try {
      await createConfig(newConfigData);
      setNewConfigData({
        maintenance_amount: 0,
        water_amount: 0,
        extraordinary_fee: 0,
        due_day: 15,
      });
      alert.success('Éxito', 'Configuración creada exitosamente');
    } catch (err) {
      console.error('Error creating config:', err);
      alert.error('Error', 'No se pudo crear la configuración. Intenta de nuevo.');
    }
  };

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

  // Helpers para mapear HouseStatus a variantes de UI
  const getHouseStatusVariant = (status: HouseStatus): 'success' | 'info' | 'error' => {
    switch (status) {
      case 'al_dia': return 'success';
      case 'saldo_a_favor': return 'info';
      case 'morosa': return 'error';
    }
  };

  const getHouseStatusLabel = (status: HouseStatus): string => {
    switch (status) {
      case 'al_dia': return 'Al Día';
      case 'saldo_a_favor': return 'Saldo a Favor';
      case 'morosa': return 'Morosa';
    }
  };

  const getHouseStatusIcon = (status: HouseStatus): string => {
    switch (status) {
      case 'al_dia': return '✅';
      case 'saldo_a_favor': return '💚';
      case 'morosa': return '🔴';
    }
  };

  const getPeriodStatusVariant = (status: string): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'paid': return 'success';
      case 'partial': return 'warning';
      case 'unpaid': return 'error';
      default: return 'error';
    }
  };

  const getPeriodStatusLabel = (status: string): string => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'partial': return 'Parcial';
      case 'unpaid': return 'No Pagado';
      default: return status;
    }
  };

  return (
    <div className="container flex-1 mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">💰 Gestión de Pagos</h1>

      {/* Tab Navigation */}
      <Tabs
        tabs={[
          { id: 'periods', label: 'Períodos', icon: '📋', color: 'blue' },
          { id: 'create-period', label: 'Crear Período', icon: '➕', color: 'blue' },
          { id: 'house-payments', label: 'Pagos por Casa', icon: '🏠', color: 'blue' },
          { id: 'house-balance', label: 'Estado de Cuenta', icon: '💵', color: 'blue' },
          { id: 'unclaimed-deposits', label: 'Depósitos No Reclamados', icon: '🏦', color: 'blue' },
          { id: 'period-charges', label: 'Configurar Períodos', icon: '⚙️', color: 'blue' },
        ] as TabItem[]}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as ActiveTab)}
      />

      {/* Períodos Tab */}
      {activeTab === 'periods' && (
        <div className="bg-secondary shadow-lg rounded-lg border-4 border-primary/10 p-6">
          <h2 className="text-2xl font-bold mb-4 text-foreground">📋 Períodos de Facturación</h2>

          {periodsError && (
            <div className="bg-error/10 border-l-4 border-error rounded-lg p-4 mb-4 flex items-start gap-3">
              <span className="text-error text-xl">❌</span>
              <div className="flex-1">
                <p className="text-error font-semibold">Error al cargar</p>
                <p className="text-error text-sm">{periodsError}</p>
              </div>
            </div>
          )}

          {periodsLoading ? (
            <div className="text-center py-8 text-foreground-secondary">Cargando períodos...</div>
          ) : (
            <Table
              columns={[
                // {
                //   id: 'period_name',
                //   header: 'Período',
                //   align: 'left',
                //   render: (period) => period.period_config_id,
                // },
                {
                  id: 'month',
                  header: 'Mes',
                  align: 'center',
                  render: (period) => period.month,
                },
                {
                  id: 'year',
                  header: 'Año',
                  align: 'center',
                  render: (period) => period.year,
                },
                {
                  id: 'start_date',
                  header: 'Fecha Inicio',
                  align: 'center',
                  render: (period) => useFormatDate(period.start_date),
                },
                {
                  id: 'end_date',
                  header: 'Fecha Fin',
                  align: 'center',
                  render: (period) => useFormatDate(period.end_date),
                },
                // {
                //   id: 'created_at',
                //   header: 'Creado',
                //   align: 'center',
                //   render: (period) => useFormatDate(period.created_at),
                // },
              ] as TableColumn<PeriodResponseDto>[]}
              data={periods}
              emptyMessage="No hay períodos registrados"
              hoverable
            />
          )}
        </div>
      )}

      {/* Crear Período Tab */}
      {activeTab === 'create-period' && (
        <div className="bg-secondary shadow-lg rounded-lg border-4 border-primary/10 p-6">
          <h2 className="text-2xl font-bold mb-4">➕ Crear Nuevo Período</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Año
              </label>
              <input
                type="number"
                value={newYear}
                onChange={(e) => setNewYear(parseInt(e.target.value))}
                disabled={periodMutating}
                className="w-full px-4 py-2 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed text-foreground transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Mes (1-12)
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={newMonth}
                onChange={(e) => setNewMonth(parseInt(e.target.value))}
                disabled={periodMutating}
                className="w-full px-4 py-2 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed text-foreground transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleCreatePeriod}
              disabled={periodMutating}
              isLoading={periodMutating}
              variant="success"
            >
              Crear Período
            </Button>
            <Button
              onClick={() => setActiveTab('periods')}
              disabled={periodMutating}
              variant="sameUi"
            >
              Cancelar
            </Button>
          </div>

          {/* Crear Configuración */}
          <div className="mt-8 pt-8 border-t border-gray-300">
            <h3 className="text-xl font-bold mb-4">Crear Configuración de Período</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Monto Mantenimiento
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newConfigData.maintenance_amount}
                  onChange={(e) =>
                    setNewConfigData({
                      ...newConfigData,
                      maintenance_amount: parseFloat(e.target.value),
                    })
                  }
                  disabled={configMutating}
                  className="w-full px-4 py-2 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed text-foreground transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Monto Agua
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newConfigData.water_amount}
                  onChange={(e) =>
                    setNewConfigData({
                      ...newConfigData,
                      water_amount: parseFloat(e.target.value),
                    })
                  }
                  disabled={configMutating}
                  className="w-full px-4 py-2 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed text-foreground transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Cuota Extraordinaria
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newConfigData.extraordinary_fee}
                  onChange={(e) =>
                    setNewConfigData({
                      ...newConfigData,
                      extraordinary_fee: parseFloat(e.target.value),
                    })
                  }
                  disabled={configMutating}
                  className="w-full px-4 py-2 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed text-foreground transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Día de Vencimiento
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={newConfigData.due_day}
                  onChange={(e) =>
                    setNewConfigData({
                      ...newConfigData,
                      due_day: parseInt(e.target.value),
                    })
                  }
                  disabled={configMutating}
                  className="w-full px-4 py-2 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed text-foreground transition-all duration-200"
                />
              </div>
            </div>

            <Button
              onClick={handleCreateConfig}
              disabled={configMutating}
              isLoading={configMutating}
              variant="info"
            >
              Crear Configuración
            </Button>
          </div>
        </div>
      )}

      {/* Pagos por Casa Tab */}
      {activeTab === 'house-payments' && (
        <div className="bg-secondary shadow-lg rounded-lg border-4 border-primary/10 p-6">
          <h2 className="text-2xl font-bold mb-6">🏠 Registros de Pagos por Casa</h2>

          {/* Backfill Allocations Section */}
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
                    onChange={(e) =>
                      setBackfillHouseNumber(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                    placeholder="Dejar vacío para procesar todas las casas"
                    disabled={backfillPending}
                    className="w-full px-4 py-2 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed text-foreground placeholder-foreground-tertiary transition-all duration-200"
                  />
                </div>
              </div>
              <Button
                onClick={handleBackfillAllocations}
                disabled={backfillPending}
                isLoading={backfillPending}
                variant="info"
              >
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
                    <div>
                      <p className="text-foreground-secondary">Total Encontrados</p>
                      <p className="font-bold text-success">{backfillData.total_records_found}</p>
                    </div>
                    <div>
                      <p className="text-foreground-secondary">Procesados</p>
                      <p className="font-bold text-success">{backfillData.processed}</p>
                    </div>
                    <div>
                      <p className="text-foreground-secondary">Omitidos</p>
                      <p className="font-bold text-success">{backfillData.skipped}</p>
                    </div>
                    <div>
                      <p className="text-foreground-secondary">Errores</p>
                      <p className="font-bold text-error">{backfillData.failed}</p>
                    </div>
                  </div>
                  {backfillData.results.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs font-semibold text-foreground">
                        Ver detalles ({backfillData.results.length})
                      </summary>
                      <div className="mt-2 bg-secondary rounded p-2 max-h-48 overflow-y-auto space-y-1">
                        {backfillData.results.map((result: BackfillRecordResult, idx: number) => (
                          <div
                            key={idx}
                            className={`text-xs p-2 rounded ${
                              result.status === 'processed'
                                ? 'text-success'
                                : result.status === 'skipped'
                                  ? 'text-info'
                                  : 'text-error'
                            }`}
                          >
                            <p>Casa #{result.house_number} - {result.status.toUpperCase()}</p>
                            <p className="text-xs opacity-75">
                              {result.period_year}-{String(result.period_month).padStart(2, '0')} - ${result.amount.toFixed(2)}
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

          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-2">
              Número de Casa
            </label>
            <input
              type="number"
              value={selectedHouseId || ''}
              onChange={(e) =>
                setSelectedHouseId(e.target.value ? parseInt(e.target.value) : null)
              }
              placeholder="Ingresa el número de casa"
              className="w-full px-4 py-2 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder-foreground-tertiary transition-all duration-200"
            />
          </div>

          {historyLoading && (
            <div className="text-center py-8 text-foreground-secondary">Cargando registros de pagos...</div>
          )}

          {selectedHouseId && paymentHistory ? (
            <div className="space-y-6">
              {/* Resumen de la casa - Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                  label="Total de Transacciones"
                  value={paymentHistory.total_transactions.toString()}
                  variant="info"
                  icon="📊"
                />
                <StatsCard
                  label="Monto Total"
                  value={`$${paymentHistory.total_amount.toFixed(2)}`}
                  variant="success"
                  icon="💰"
                />
                <StatsCard
                  label="Confirmadas"
                  value={paymentHistory.confirmed_transactions.toString()}
                  variant="success"
                  icon="✓"
                />
                <StatsCard
                  label="Pendientes"
                  value={paymentHistory.pending_transactions.toString()}
                  variant="warning"
                  icon="⏳"
                />
                {paymentHistory.unreconciled_vouchers && (
                  <StatsCard
                    label="Comprobantes No Conciliados"
                    value={paymentHistory.unreconciled_vouchers.total_count.toString()}
                    variant="warning"
                    icon="📋"
                  />
                )}
              </div>

              {/* Tabla de transacciones y vouchers expandible */}
              {(() => {
                // Combinar transacciones y vouchers no reconciliados
                const allMovements: PaymentMovement[] = [];

                if (paymentHistory.transactions && paymentHistory.transactions.length > 0) {
                  paymentHistory.transactions.forEach((transaction: HousePaymentTransaction) => {
                    allMovements.push({
                      ...transaction,
                      type: 'transaction',
                      _date: new Date(transaction.date).getTime(),
                    });
                  });
                }

                if (paymentHistory.unreconciled_vouchers?.vouchers && paymentHistory.unreconciled_vouchers.vouchers.length > 0) {
                  paymentHistory.unreconciled_vouchers.vouchers.forEach((voucher: UnreconciledVoucher) => {
                    allMovements.push({
                      date: voucher.date,
                      time: new Date(voucher.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                      amount: voucher.amount,
                      confirmation_status: voucher.confirmation_status,
                      type: 'voucher',
                      created_at: voucher.created_at,
                      confirmation_code: voucher.confirmation_code,
                      _date: new Date(voucher.date).getTime(),
                    } as PaymentMovement);
                  });
                }

                // Ordenar por fecha descendente
                allMovements.sort((a: PaymentMovement, b: PaymentMovement) => b._date - a._date);

                const renderMovementType = (movement: PaymentMovement): React.ReactNode => (
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                    movement.type === 'transaction'
                      ? 'bg-info/20 text-info'
                      : 'bg-warning/20 text-warning'
                  }`}>
                    {movement.type === 'transaction' ? '🏦 Transacción Bancaria' : '📋 Comprobante'}
                  </span>
                );

                const renderMovementDate = (movement: PaymentMovement): React.ReactNode => (
                  <div className="text-sm font-mono">
                    <div>{useFormatDate(movement.date)}</div>
                    <div className="text-foreground-secondary text-xs">{movement.time}</div>
                  </div>
                );

                const renderMovementAmount = (movement: PaymentMovement): string =>
                  `$${movement.amount.toFixed(2)}`;

                const renderMovementConcept = (movement: PaymentMovement): React.ReactNode => {
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

                const renderMovementBank = (movement: PaymentMovement): React.ReactNode => {
                  if (movement.type === 'voucher') {
                    return '';
                  }
                  return <p className="text-sm">{(movement as HousePaymentTransaction).bank_name || '-'}</p>;
                };

                const renderMovementStatus = (movement: PaymentMovement): React.ReactNode => (
                  <StatusBadge
                    status={movement.confirmation_status ? 'success' : 'warning'}
                    label={movement.confirmation_status ? 'Confirmada' : 'Pendiente'}
                    icon={movement.confirmation_status ? '✓' : '⏳'}
                  />
                );

                const getMovementKey = (movement: PaymentMovement): string =>
                  `${movement.type}-${movement.date}-${movement.amount}`;

                return allMovements.length > 0 ? (
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
                ) : (
                  <div className="text-center py-8 text-foreground-secondary">
                    No hay movimientos disponibles
                  </div>
                );
              })()}
            </div>
          ) : !selectedHouseId ? (
            <div className="text-center py-8 text-foreground-secondary">
              Selecciona una casa para ver sus movimientos de pagos
            </div>
          ) : null}
        </div>
      )}

      {/* Estado de Cuenta Tab */}
      {activeTab === 'house-balance' && (
        <div className="bg-secondary shadow-lg rounded-lg border-4 border-primary/10 p-6">
          <h2 className="text-2xl font-bold mb-4">💵 Estado de Cuenta</h2>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-2">
              Número de Casa
            </label>
            <input
              type="number"
              min="1"
              max="66"
              value={selectedHouseId || ''}
              onChange={(e) =>
                setSelectedHouseId(e.target.value ? parseInt(e.target.value) : null)
              }
              placeholder="Ingresa el número de casa (1-66)"
              className="w-full px-4 py-2 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder-foreground-tertiary transition-all duration-200"
            />
          </div>

          {statusLoading && (
            <div className="text-center py-8 text-foreground-secondary">Cargando estado de cuenta...</div>
          )}

          {statusError && (
            <div className="bg-error/10 border-l-4 border-error rounded-lg p-4 mb-4 flex items-start gap-3">
              <span className="text-error text-xl">❌</span>
              <div className="flex-1">
                <p className="text-error font-semibold">Error al cargar</p>
                <p className="text-error text-sm">{statusError}</p>
              </div>
            </div>
          )}

          {selectedHouseId && houseStatus ? (
            <div className="space-y-6">
              {/* Header con estado y número de casa */}
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
                  <p className="text-sm text-foreground-secondary mt-2">
                    {houseStatus.deadline_message}
                  </p>
                )}
              </div>

              {/* Cards de estadísticas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                  label="Deuda Total"
                  value={`$${houseStatus.total_debt.toFixed(2)}`}
                  variant="error"
                  icon="📉"
                />
                <StatsCard
                  label="Crédito"
                  value={`$${houseStatus.credit_balance.toFixed(2)}`}
                  variant="success"
                  icon="💰"
                />
                <StatsCard
                  label="Penalidades"
                  value={`$${houseStatus.summary.total_penalties.toFixed(2)}`}
                  variant="warning"
                  icon="⚠️"
                />
                <StatsCard
                  label="Centavos Acumlados"
                  value={`$${houseStatus.accumulated_cents.toFixed(2)}`}
                  variant="info"
                  icon="🪙"
                />
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
                        id: 'display_name',
                        header: 'Período',
                        align: 'left',
                        render: (period) => (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{period.display_name}</span>
                            {period.is_overdue && (
                              <span className="text-xs bg-error/20 text-error px-2 py-0.5 rounded-full font-bold">Vencido</span>
                            )}
                          </div>
                        ),
                      },
                      {
                        id: 'expected_total',
                        header: 'Esperado',
                        align: 'center',
                        render: (period) => `$${period.expected_total.toFixed(2)}`,
                      },
                      {
                        id: 'paid_total',
                        header: 'Pagado',
                        align: 'center',
                        render: (period) => `$${period.paid_total.toFixed(2)}`,
                        className: 'text-success font-semibold',
                      },
                      {
                        id: 'pending_total',
                        header: 'Pendiente',
                        align: 'center',
                        render: (period) => `$${period.pending_total.toFixed(2)}`,
                        className: 'text-error font-semibold',
                      },
                      {
                        id: 'status',
                        header: 'Estado',
                        align: 'center',
                        render: (period) => (
                          <StatusBadge
                            status={getPeriodStatusVariant(period.status)}
                            label={getPeriodStatusLabel(period.status)}
                          />
                        ),
                      },
                    ]}
                    expandedContent={(period) => (
                      <div className="p-4">
                        <h4 className="text-sm font-bold text-foreground mb-3">Desglose por Concepto</h4>
                        <Table<ConceptBreakdown>
                          columns={[
                            {
                              id: 'concept_type',
                              header: 'Concepto',
                              align: 'left',
                              render: (concept) => (
                                <span className="font-medium capitalize">{concept.concept_type.replace(/_/g, ' ')}</span>
                              ),
                            },
                            {
                              id: 'expected_amount',
                              header: 'Esperado',
                              align: 'center',
                              render: (concept) => `$${concept.expected_amount.toFixed(2)}`,
                            },
                            {
                              id: 'paid_amount',
                              header: 'Pagado',
                              align: 'center',
                              render: (concept) => `$${concept.paid_amount.toFixed(2)}`,
                            },
                            {
                              id: 'pending_amount',
                              header: 'Pendiente',
                              align: 'center',
                              render: (concept) => (
                                <span className={concept.pending_amount > 0 ? 'text-error font-semibold' : 'text-success font-semibold'}>
                                  ${concept.pending_amount.toFixed(2)}
                                </span>
                              ),
                            },
                          ]}
                          data={[
                            ...period.concepts,
                            ...(period.penalty_amount > 0
                              ? [{
                                  concept_type: 'penalidad',
                                  expected_amount: period.penalty_amount,
                                  paid_amount: 0,
                                  pending_amount: period.penalty_amount,
                                }]
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
                        {
                          id: 'display_name',
                          header: 'Período',
                          align: 'left',
                          render: (period) => <span className="font-semibold">{period.display_name}</span>,
                        },
                        {
                          id: 'expected_total',
                          header: 'Esperado',
                          align: 'center',
                          render: (period) => `$${period.expected_total.toFixed(2)}`,
                        },
                        {
                          id: 'paid_total',
                          header: 'Pagado',
                          align: 'center',
                          render: (period) => `$${period.paid_total.toFixed(2)}`,
                        },
                        {
                          id: 'status',
                          header: 'Estado',
                          align: 'center',
                          render: () => (
                            <StatusBadge status="success" label="Pagado" icon="✅" />
                          ),
                        },
                      ]}
                      data={houseStatus.paid_periods}
                      emptyMessage="No hay períodos pagados"
                      hoverable
                    />
                  </div>
                </details>
              )}

              {/* Resumen */}
              <div className="bg-tertiary rounded-lg border border-base p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-foreground-secondary">Total Esperado</p>
                    <p className="font-bold text-foreground">${houseStatus.summary.total_expected.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-foreground-secondary">Total Pagado</p>
                    <p className="font-bold text-success">${houseStatus.summary.total_paid.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-foreground-secondary">Total Pendiente</p>
                    <p className="font-bold text-error">${houseStatus.summary.total_pending.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-foreground-secondary">Próx. Vencimiento</p>
                    <p className="font-bold text-foreground">{houseStatus.next_due_date ? useFormatDate(houseStatus.next_due_date) : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : !selectedHouseId ? (
            <div className="text-center py-8 text-foreground-secondary">
              Selecciona una casa para ver su estado de cuenta
            </div>
          ) : null}
        </div>
      )}

      {/* Depósitos No Reclamados Tab */}
      {activeTab === 'unclaimed-deposits' && (
        <div className="bg-secondary shadow-lg rounded-lg border-4 border-primary/10 p-6">
          <h2 className="text-2xl font-bold mb-4">🏦 Depósitos No Reclamados</h2>
          <UnclaimedDepositsSection
            onDepositAssigned={() => {
              // Callback when deposit is assigned
            }}
          />
        </div>
      )}

      {activeTab === 'period-charges' && (
        <PeriodChargesEditor />
      )}
    </div>
  );
}
