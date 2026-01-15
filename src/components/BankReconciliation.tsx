import { useState } from 'react';
import { useBankReconciliationMutations } from '../hooks/useBankReconciliationQuery';
import { useTransactionsBankQuery } from '../hooks/useTransactionsBankQuery';
import { useVouchersQuery } from '../hooks/useVouchersQuery';
import { useFormatDate } from '../hooks/useFormatDate';
import { StartReconciliationModal } from './StartReconciliationModal';
import { UnclaimedDepositsSection } from './UnclaimedDepositsSection';
import { Button } from '../shared/Button';
import { StatusBadge } from '../shared/StatusBadge';
import { StatsCard } from '../shared/StatsCard';
import { Tabs, type TabItem } from '../shared/Tabs';
import { ReconciliationCard } from '../shared/ReconciliationCard';
import { DateTimeCell } from '../shared/DateTimeCell';
import { Table, type TableColumn } from '../shared/Table';
import type { StartReconciliationResponse } from '../shared';

export function BankReconciliation() {
  const {
    transactions,
    refetch: refetchTransactions,
  } = useTransactionsBankQuery({
    reconciled: false,
  });

  const {
    vouchers,
    refetch: refetchVouchers,
  } = useVouchersQuery({
    confirmation_status: true,
  });

  const { start, reconcile, reconcileBulk, undo, reconciling, error } =
    useBankReconciliationMutations();

  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(
    null
  );
  const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [reconciliationResult, setReconciliationResult] = useState<StartReconciliationResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'conciliados' | 'unfundedVouchers' | 'unclaimedDeposits' | 'manual'>('summary');

  // Suppress unused variable warnings for commented code
  void transactions;
  void vouchers;
  void reconcileBulk;
  void undo;

  const handleManualReconcile = async (): Promise<void> => {
    if (!selectedTransaction || !selectedVoucher) {
      alert('Por favor selecciona una transacción y un voucher');
      return;
    }

    try {
      await reconcile({
        transactionId: selectedTransaction,
        voucherId: selectedVoucher,
      });
      alert('Conciliación exitosa');
      setSelectedTransaction(null);
      setSelectedVoucher(null);
      refetchTransactions();
      refetchVouchers();
    } catch (err) {
      console.error('Error reconciling:', err);
    }
  };

  const handleStartReconciliation = async (data: { startDate?: string; endDate?: string }): Promise<StartReconciliationResponse | null> => {
    const result = await start(data);
    if (result) {
      // Save result to state
      setReconciliationResult(result);
      // Switch to summary tab
      setActiveTab('summary');
      // Refresh data after starting reconciliation
      refetchTransactions();
      refetchVouchers();
    }
    return result;
  };

  const handleManualValidation = async (voucherId: number, transactionId: number): Promise<void> => {
    try {
      console.log('🔧 [Manual Validation] Iniciando conciliación manual:', {
        voucherId,
        transactionId,
      });

      await reconcile({
        transactionId: transactionId.toString(),
        voucherId: voucherId.toString(),
      });

      console.log('✅ [Manual Validation] Conciliación manual exitosa');

      // Re-run reconciliation to get updated results
      const updatedResult = await start({});
      if (updatedResult) {
        setReconciliationResult(updatedResult);
        // Stay on manual validation tab to continue working
      }

      // Also refresh other data
      refetchTransactions();
      refetchVouchers();
    } catch (err) {
      console.error('❌ [Manual Validation] Error en conciliación manual:', err);
      alert('Error al realizar la conciliación manual. Por favor intenta de nuevo.');
    }
  };

  const handleCloseModal = (): void => {
    setShowStartModal(false);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Conciliación Bancaria</h1>
        <Button
          onClick={() => setShowStartModal(true)}
          variant="success"
        >
          🚀 Iniciar Conciliación
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      )}


      {/* Start Reconciliation Modal */}
      <StartReconciliationModal
        isOpen={showStartModal}
        onClose={handleCloseModal}
        onStart={handleStartReconciliation}
        isProcessing={reconciling}
      />

      {/* Reconciliation Results */}
      {reconciliationResult && (
        <div className="background-general shadow-lg rounded-lg border-4 p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Resultados de Conciliación</h2>

          {/* Tabs */}
          <Tabs
            tabs={[
              { id: 'summary', label: 'Resumen', icon: '📊', color: 'blue' },
              { id: 'conciliados', label: 'Conciliados', icon: '✅', badge: reconciliationResult.conciliados.length, color: 'green' },
              { id: 'unfundedVouchers', label: 'Comprobantes NO Conciliados', icon: '⏳', badge: reconciliationResult.unfundedVouchers.length, color: 'yellow' },
              { id: 'unclaimedDeposits', label: 'Depósitos NO Asociados', icon: '➕', badge: reconciliationResult.unclaimedDeposits.length, color: 'orange' },
              { id: 'manual', label: 'Validación Manual', icon: '🔍', badge: reconciliationResult.manualValidationRequired.length, color: 'red' },
            ] as TabItem[]}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as 'summary' | 'conciliados' | 'unfundedVouchers' | 'unclaimedDeposits' | 'manual')}
          />

          {/* Tab Content */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatsCard
                  label="Total Vouchers"
                  value={reconciliationResult.summary.totalVouchers}
                  variant="primary"
                  icon="📋"
                />
                <StatsCard
                  label="Total Transacciones"
                  value={reconciliationResult.summary.totalTransactions}
                  variant="info"
                  icon="💳"
                />
                <StatsCard
                  label="Conciliados"
                  value={reconciliationResult.summary.matched}
                  variant="success"
                  icon="✅"
                />
                <StatsCard
                  label="Pendientes"
                  value={reconciliationResult.summary.pendingVouchers}
                  variant="warning"
                  icon="⏳"
                />
                <StatsCard
                  label="Sobrantes"
                  value={reconciliationResult.summary.surplusTransactions}
                  variant="warning"
                  icon="➕"
                />
                <StatsCard
                  label="Validación Manual"
                  value={reconciliationResult.summary.manualValidationRequired}
                  variant="error"
                  icon="🔍"
                />
              </div>
            </div>
          )}

          {activeTab === 'conciliados' && (
            <Table
              columns={[
                {
                  id: 'houseNumber',
                  header: 'Casa',
                  align: 'center',
                  render: (item) => item.houseNumber ?? 'N/A',
                },
                {
                  id: 'amount',
                  header: 'Monto',
                  align: 'center',
                  render: (item) => `$${item.amount ? item.amount.toFixed(2) : '0.00'}`,
                },
                {
                  id: 'confidenceLevel',
                  header: 'Nivel de Confianza',
                  align: 'center',
                  render: (item) => (
                    <StatusBadge
                      status={
                        item.confidenceLevel === 'high'
                          ? 'success'
                          : item.confidenceLevel === 'medium'
                            ? 'warning'
                            : item.confidenceLevel === 'low'
                              ? 'warning'
                              : 'info'
                      }
                      label={
                        item.confidenceLevel === 'high'
                          ? 'Alta'
                          : item.confidenceLevel === 'medium'
                            ? 'Media'
                            : item.confidenceLevel === 'low'
                              ? 'Baja'
                              : 'Manual'
                      }
                      icon={
                        item.confidenceLevel === 'high'
                          ? '✅'
                          : item.confidenceLevel === 'medium'
                            ? '⚖️'
                            : item.confidenceLevel === 'low'
                              ? '⚠️'
                              : '🔧'
                      }
                    />
                  ),
                },
              ] as TableColumn[]}
              data={reconciliationResult.conciliados}
              emptyMessage="No hay registros conciliados"
              headerVariant="success"
              hoverable
            />
          )}

          {activeTab === 'unfundedVouchers' && (
            <Table
              columns={[
                {
                  id: 'voucherId',
                  header: 'Voucher ID',
                  align: 'center',
                  render: (item) => item.voucherId ?? 'N/A',
                },
                {
                  id: 'date',
                  header: 'Fecha',
                  align: 'center',
                  render: (item) => useFormatDate(item.date),
                },
                {
                  id: 'amount',
                  header: 'Monto',
                  align: 'center',
                  render: (item) => `$${item.amount ? item.amount.toFixed(2) : '0.00'}`,
                },
                {
                  id: 'reason',
                  header: 'Razón',
                  render: (item) => item.reason || 'Sin razón especificada',
                },
              ] as TableColumn[]}
              data={reconciliationResult.unfundedVouchers}
              emptyMessage="No hay comprobantes NO conciliados"
              headerVariant="warning"
              hoverable
            />
          )}

          {activeTab === 'unclaimedDeposits' && (
            <Table
              columns={[
                {
                  id: 'transactionId',
                  header: 'Transacción ID',
                  align: 'center',
                  render: (item) => item.transactionId ?? 'N/A',
                },
                {
                  id: 'amount',
                  header: 'Monto',
                  align: 'center',
                  render: (item) => `$${item.amount ? item.amount.toFixed(2) : '0.00'}`,
                },
                {
                  id: 'dateTime',
                  header: 'Fecha y Hora',
                  align: 'center',
                  render: (item) => <DateTimeCell dateString={item.date} timeString={item.time} variant="compact" showIcon={true} />,
                },
                {
                  id: 'reason',
                  header: 'Razón',
                  render: (item) => item.reason || 'Sin razón especificada',
                },
              ] as TableColumn[]}
              data={reconciliationResult.unclaimedDeposits}
              emptyMessage="No hay movimientos bancarios sin asociar/conciliar"
              headerVariant="warning"
              hoverable
            />
          )}

          {activeTab === 'manual' && (
            <div className="space-y-4">
              {reconciliationResult.manualValidationRequired.map((item, idx) => (
                <ReconciliationCard
                  key={idx}
                  voucherId={item.voucherId}
                  amount={item.amount}
                  date={item.date}
                  reason={item.reason}
                  possibleMatches={item.possibleMatches}
                  onConciliate={(transactionId) => {
                    if (item.voucherId) {
                      handleManualValidation(item.voucherId, transactionId);
                    } else {
                      alert('Error: Datos incompletos para realizar la conciliación');
                    }
                  }}
                  isProcessing={reconciling}
                  formatDate={useFormatDate}
                />
              ))}
              {reconciliationResult.manualValidationRequired.length === 0 && (
                <p className="text-center text-gray-500 py-8">No hay casos que requieran validación manual</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Manual Reconciliation Section */}
      <div className="shadow-md border-2 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">🔧 Conciliación Manual</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Transactions Column */}
          {/* <div>
            <h3 className="font-medium mb-2">Transacciones No Conciliadas</h3>
            <div className="border rounded max-h-64 overflow-y-auto">
              {transactions.length === 0 ? (
                <p className="p-4 text-gray-500">
                  No hay transacciones sin conciliar
                </p>
              ) : (
                <div className="divide-y">
                  {transactions.map((transaction) => (
                    <label
                      key={transaction.id}
                      className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer ${
                        selectedTransaction === transaction.id
                          ? 'bg-blue-50'
                          : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="transaction"
                        value={transaction.id}
                        checked={selectedTransaction === transaction.id}
                        onChange={() => setSelectedTransaction(transaction.id)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {transaction.description}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()} -{' '}
                          $
                          {(transaction.debit || transaction.credit).toFixed(2)}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div> */}

          {/* Vouchers Column */}
          {/* <div>
            <h3 className="font-medium mb-2">Vouchers Aprobados</h3>
            <div className="border rounded max-h-64 overflow-y-auto">
              {vouchers.length === 0 ? (
                <p className="p-4 text-gray-500">
                  No hay vouchers aprobados disponibles
                </p>
              ) : (
                <div className="divide-y">
                  {vouchers.map((voucher) => (
                    <label
                      key={voucher.id}
                      className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer ${
                        selectedVoucher === voucher.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="voucher"
                        value={voucher.id}
                        checked={selectedVoucher === voucher.id}
                        onChange={() => setSelectedVoucher(voucher.id)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {voucher.voucherNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          {voucher.description} - ${voucher.totalAmount.toFixed(2)}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div> */}
        </div>

        <div className="mt-4 flex justify-center">
          <Button
            onClick={handleManualReconcile}
            disabled={
              !selectedTransaction || !selectedVoucher || reconciling
            }
            isLoading={reconciling}
            variant="info"
          >
            Conciliar
          </Button>
        </div>
      </div>

      {/* Unclaimed Deposits Section */}
      <div className="bg-secondary shadow-lg rounded-lg border-2 border-primary/10 p-6">
        <UnclaimedDepositsSection
          onDepositAssigned={() => {
            // Opcionalmente refrescar resultados de reconciliación
            console.log('✅ Depósito asignado exitosamente');
          }}
        />
      </div>
    </div>
  );
}
