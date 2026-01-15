import { useState } from 'react';
import { usePeriodsQuery, usePeriodMutations, usePaymentHistoryQuery, useHouseBalanceQuery, usePeriodConfigMutations } from '@hooks/usePaymentManagement';
import { useFormatDate } from '@hooks/useFormatDate';
import { Button } from '@shared/ui';
import { Tabs } from '@shared/ui';
import { StatusBadge } from '@shared/ui';
import { StatsCard } from '@shared/ui';
import { Table, type TableColumn } from '@shared/ui';
import { ExpandableTable } from '@shared/ui';
import { UnclaimedDepositsSection } from './UnclaimedDepositsSection';
import type { HousePaymentTransaction, UnreconciledVoucher } from '@shared';

type ActiveTab = 'periods' | 'create-period' | 'house-payments' | 'house-balance' | 'unclaimed-deposits';

type PaymentMovement = (HousePaymentTransaction & { type: 'transaction'; _date: number }) |
  (Omit<UnreconciledVoucher, 'created_at'> & {
    type: 'voucher';
    time: string;
    created_at: string;
    confirmation_code: string;
    _date: number;
  });

type BalanceStatusVariant = 'success' | 'info' | 'error' | 'warning';

export function PaymentManagement() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('periods');
  const [selectedHouseId, setSelectedHouseId] = useState<number | null>(null);
  const [newYear, setNewYear] = useState<number>(new Date().getFullYear());
  const [newMonth, setNewMonth] = useState<number>(new Date().getMonth() + 1);
  const [newConfigData, setNewConfigData] = useState({
    maintenance_amount: 0,
    water_amount: 0,
    extraordinary_fee: 0,
    due_day: 15,
  });

  // Queries and Mutations
  const { periods, isLoading: periodsLoading, error: periodsError } = usePeriodsQuery();
  const { createPeriod, isLoading: periodMutating } = usePeriodMutations();
  const { createConfig, isLoading: configMutating } = usePeriodConfigMutations();
  const { history: paymentHistory, isLoading: historyLoading } = usePaymentHistoryQuery(selectedHouseId);
  const { balance, isLoading: balanceLoading } = useHouseBalanceQuery(selectedHouseId);

  // Handlers
  const handleCreatePeriod = async (): Promise<void> => {
    try {
      await createPeriod({ year: newYear, month: newMonth });
      setNewYear(new Date().getFullYear());
      setNewMonth(new Date().getMonth() + 1);
      setActiveTab('periods');
    } catch (err) {
      console.error('Error creating period:', err);
      alert('Error al crear el período');
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
      alert('Configuración creada exitosamente');
    } catch (err) {
      console.error('Error creating config:', err);
      alert('Error al crear la configuración');
    }
  };

  // Helper para mapear estados de saldo a variantes de StatusBadge
  const getBalanceStatusVariant = (status: string): BalanceStatusVariant => {
    switch (status) {
      case 'balanced':
        return 'success';
      case 'credited':
        return 'info';
      case 'in-debt':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">💰 Gestión de Pagos</h1>

      {/* Tab Navigation */}
      <Tabs
        tabs={[
          { id: 'periods', label: 'Períodos', icon: '📋', color: 'blue' },
          { id: 'create-period', label: 'Crear Período', icon: '➕', color: 'blue' },
          { id: 'house-payments', label: 'Pagos por Casa', icon: '🏠', color: 'blue' },
          { id: 'house-balance', label: 'Saldo de Casa', icon: '💵', color: 'blue' },
          { id: 'unclaimed-deposits', label: 'Depósitos No Reclamados', icon: '🏦', color: 'blue' },
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
                {
                  id: 'period_name',
                  header: 'Período',
                  align: 'left',
                  render: (period) => period.period_config_id,
                },
                {
                  id: 'year',
                  header: 'Año',
                  align: 'center',
                  render: (period) => period.year,
                },
                {
                  id: 'month',
                  header: 'Mes',
                  align: 'center',
                  render: (period) => period.month,
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
                {
                  id: 'created_at',
                  header: 'Creado',
                  align: 'center',
                  render: (period) => useFormatDate(period.created_at),
                },
              ] as TableColumn[]}
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
          <h2 className="text-2xl font-bold mb-4">🏠 Registros de Pagos por Casa</h2>

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
                    });
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
                        <p className="font-mono text-sm font-semibold text-primary">{movement.confirmation_code || '-'}</p>
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

      {/* Saldo de Casa Tab */}
      {activeTab === 'house-balance' && (
        <div className="bg-secondary shadow-lg rounded-lg border-4 border-primary/10 p-6">
          <h2 className="text-2xl font-bold mb-4">💵 Saldo de Casa</h2>

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

          {balanceLoading && (
            <div className="text-center py-8 text-foreground-secondary">Cargando saldo...</div>
          )}

          {selectedHouseId && balance ? (
            <div className="space-y-6">
              {/* Header con estado y número de casa */}
              <div className="bg-secondary shadow-lg rounded-lg border-4 border-primary/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">Casa #{balance.house_number}</h3>
                  <StatusBadge
                    status={getBalanceStatusVariant(balance.status)}
                    label={
                      balance.status === 'balanced'
                        ? 'Balanceado'
                        : balance.status === 'credited'
                        ? 'Acreedor'
                        : 'Deudor'
                    }
                    icon={
                      balance.status === 'balanced'
                        ? '⚖️'
                        : balance.status === 'credited'
                        ? '💚'
                        : '💔'
                    }
                  />
                </div>
              </div>

              {/* Cards de estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatsCard
                  label="Crédito Acumulado"
                  value={`$${balance.credit_balance.toFixed(2)}`}
                  variant="success"
                  icon="💰"
                />
                <StatsCard
                  label="Deuda Acumulada"
                  value={`$${balance.debit_balance.toFixed(2)}`}
                  variant="error"
                  icon="📉"
                />
                <StatsCard
                  label="Saldo Neto"
                  value={`$${balance.net_balance.toFixed(2)}`}
                  variant={balance.net_balance >= 0 ? 'success' : 'error'}
                  icon="⚖️"
                />
                <StatsCard
                  label="Centavos Acumulados"
                  value={`$${balance.accumulated_cents.toFixed(2)}`}
                  variant="info"
                  icon="🪙"
                />
              </div>

              {/* Footer con última actualización */}
              <div className="bg-secondary rounded-lg border border-base p-4 text-center text-sm text-foreground-secondary">
                <p>
                  Última Actualización: <span className="font-semibold">{useFormatDate(balance.updated_at)}</span>
                </p>
              </div>
            </div>
          ) : !selectedHouseId ? (
            <div className="text-center py-8 text-foreground-secondary">
              Selecciona una casa para ver su saldo
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
              console.log('✅ Casa asignada exitosamente');
            }}
          />
        </div>
      )}
    </div>
  );
}
