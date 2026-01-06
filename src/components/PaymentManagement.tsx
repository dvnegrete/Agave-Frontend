import { useState } from 'react';
import { usePeriodsQuery, usePeriodMutations, usePaymentHistoryQuery, useHouseBalanceQuery, usePeriodConfigMutations } from '../hooks/usePaymentManagement';
import { useFormatDate } from '../hooks/useFormatDate';
import { Button } from '../ui/Button';
import { Tabs, type TabItem } from '../ui/Tabs';
import { StatusBadge } from '../ui/StatusBadge';
import { StatsCard } from '../ui/StatsCard';
import { Table, type TableColumn } from '../ui/Table';

type ActiveTab = 'periods' | 'create-period' | 'house-payments' | 'house-balance';

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
  const handleCreatePeriod = async () => {
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

  const handleCreateConfig = async () => {
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
  const getBalanceStatusVariant = (status: string) => {
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
                  render: (period) => period.period_name,
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
          <h2 className="text-2xl font-bold mb-4">🏠 Historial de Pagos por Casa</h2>

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
            <div className="text-center py-8 text-foreground-secondary">Cargando historial de pagos...</div>
          )}

          {selectedHouseId && paymentHistory ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <h3 className="font-semibold text-lg mb-2">
                  Casa #{paymentHistory.house_number}
                </h3>
                <p className="text-sm text-gray-700">
                  Total Facturado: <span className="font-bold">${paymentHistory.total_expected.toFixed(2)}</span>
                </p>
                <p className="text-sm text-gray-700">
                  Total Pagado: <span className="font-bold">${paymentHistory.total_paid.toFixed(2)}</span>
                </p>
                <p className="text-sm text-gray-700">
                  Saldo Pendiente:{' '}
                  <span className="font-bold text-red-600">
                    ${(paymentHistory.total_expected - paymentHistory.total_paid).toFixed(2)}
                  </span>
                </p>
              </div>

              {(paymentHistory.history || []).map((period: any) => (
                <div key={period.period_id} className="border rounded p-4">
                  <h4 className="font-semibold text-lg mb-3">
                    {period.period_name} ({period.year}-{String(period.month).padStart(2, '0')})
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left">Concepto</th>
                          <th className="px-3 py-2 text-right">Monto</th>
                          <th className="px-3 py-2 text-left">Vencimiento</th>
                          <th className="px-3 py-2 text-left">Estado</th>
                          <th className="px-3 py-2 text-right">Pagado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {period.assignments.map((assignment: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-3 py-2">{assignment.concept}</td>
                            <td className="px-3 py-2 text-right font-semibold">
                              ${assignment.amount.toFixed(2)}
                            </td>
                            <td className="px-3 py-2">{useFormatDate(assignment.due_date)}</td>
                            <td className="px-3 py-2">
                              <StatusBadge
                                status={
                                  assignment.payment_status === 'paid'
                                    ? 'success'
                                    : assignment.payment_status === 'pending'
                                      ? 'pending'
                                      : assignment.payment_status === 'partially_paid'
                                        ? 'warning'
                                        : 'error'
                                }
                                label={
                                  assignment.payment_status === 'pending'
                                    ? 'Pendiente'
                                    : assignment.payment_status === 'paid'
                                      ? 'Pagado'
                                      : assignment.payment_status === 'partially_paid'
                                        ? 'Parcialmente Pagado'
                                        : 'Vencido'
                                }
                                icon={
                                  assignment.payment_status === 'paid'
                                    ? '✓'
                                    : assignment.payment_status === 'pending'
                                      ? '⏳'
                                      : assignment.payment_status === 'partially_paid'
                                        ? '⚠️'
                                        : '❌'
                                }
                              />
                            </td>
                            <td className="px-3 py-2 text-right">
                              ${(assignment.paid_amount || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-100 font-semibold">
                        <tr>
                          <td colSpan={1} className="px-3 py-2">
                            Total Período
                          </td>
                          <td className="px-3 py-2 text-right">
                            ${period.total_amount.toFixed(2)}
                          </td>
                          <td colSpan={2}></td>
                          <td className="px-3 py-2 text-right">
                            ${period.total_paid.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : !selectedHouseId ? (
            <div className="text-center py-8 text-gray-500">
              Selecciona una casa para ver su historial de pagos
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
    </div>
  );
}
