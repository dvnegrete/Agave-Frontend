import { useState } from 'react';
import { useBankReconciliationMutations } from '../hooks/useBankReconciliationQuery';
import { useTransactionsBankQuery } from '../hooks/useTransactionsBankQuery';
import { useVouchersQuery } from '../hooks/useVouchersQuery';
import { useFormatDate } from '../hooks/useFormatDate';
import { StartReconciliationModal } from './StartReconciliationModal';
import type { StartReconciliationResponse } from '../types/api.types';

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

  const handleManualReconcile = async () => {
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

  const handleStartReconciliation = async (data: { startDate?: string; endDate?: string }) => {
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

  const handleManualValidation = async (voucherId: number, transactionId: number) => {
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

  const handleCloseModal = () => {
    setShowStartModal(false);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Conciliación Bancaria</h1>
        <button
          onClick={() => setShowStartModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded shadow-lg transition-colors"
        >
          🚀 Iniciar Conciliación
        </button>
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
          <div className="flex gap-2 mb-6 border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 font-medium cursor-pointer transition-colors ${
                activeTab === 'summary'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-200 hover:text-gray-500'
              }`}
            >
              📊 Resumen
            </button>
            <button
              onClick={() => setActiveTab('conciliados')}
              className={`px-4 py-2 font-medium cursor-pointer transition-colors ${
                activeTab === 'conciliados'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-200 hover:text-gray-500'
              }`}
            >
              ✅ Conciliados ({reconciliationResult.conciliados.length})
            </button>
            <button
              onClick={() => setActiveTab('unfundedVouchers')}
              className={`px-4 py-2 font-medium cursor-pointer transition-colors ${
                activeTab === 'unfundedVouchers'
                  ? 'border-b-2 border-yellow-600 text-yellow-600'
                  : 'text-gray-200 hover:text-gray-500'
              }`}
            >
              ⏳ Comprobantes NO Conciliados ({reconciliationResult.unfundedVouchers.length})
            </button>
            <button
              onClick={() => setActiveTab('unclaimedDeposits')}
              className={`px-4 py-2 font-medium cursor-pointer transition-colors ${
                activeTab === 'unclaimedDeposits'
                  ? 'border-b-2 border-orange-600 text-orange-600'
                  : 'text-gray-200 hover:text-gray-500'
              }`}
            >
              ➕ Depósitos Bancarios NO Asociados/conciliados ({reconciliationResult.unclaimedDeposits.length})
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-4 py-2 font-medium cursor-pointer transition-colors ${
                activeTab === 'manual'
                  ? 'border-b-2 border-red-600 text-red-600'
                  : 'text-gray-200 hover:text-gray-500'
              }`}
            >
              🔍 Validación Manual ({reconciliationResult.manualValidationRequired.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Total Vouchers</p>
                  <p className="text-2xl font-bold">{reconciliationResult.summary.totalVouchers}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Total Transacciones</p>
                  <p className="text-2xl font-bold">{reconciliationResult.summary.totalTransactions}</p>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-sm text-green-700">✅ Conciliados</p>
                  <p className="text-2xl font-bold text-green-700">{reconciliationResult.summary.matched}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded">
                  <p className="text-sm text-yellow-700">⏳ Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-700">{reconciliationResult.summary.pendingVouchers}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded">
                  <p className="text-sm text-orange-700">➕ Sobrantes</p>
                  <p className="text-2xl font-bold text-orange-700">{reconciliationResult.summary.surplusTransactions}</p>
                </div>
                <div className="bg-red-50 p-4 rounded">
                  <p className="text-sm text-red-700">🔍 Validación Manual</p>
                  <p className="text-2xl font-bold text-red-700">{reconciliationResult.summary.manualValidationRequired}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'conciliados' && (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-green-50">
                  <tr>
                    <th className="px-4 py-2 text-center text-sm font-medium text-green-900">Casa</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-green-900">Monto</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-green-900">Conciliado. Nivel de Confianza </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reconciliationResult.conciliados.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-center">{item.houseNumber ?? 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        ${item.amount ? item.amount.toFixed(2) : '0.00'}
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            item.confidenceLevel === 'high'
                              ? 'bg-green-100 text-green-800'
                              : item.confidenceLevel === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : item.confidenceLevel === 'low'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.confidenceLevel === 'high'
                            ? 'Alta'
                            : item.confidenceLevel === 'medium'
                              ? 'Media'
                              : item.confidenceLevel === 'low'
                                ? 'Baja'
                                : 'Manual'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reconciliationResult.conciliados.length === 0 && (
                <p className="text-center text-gray-500 py-8">No hay registros conciliados</p>
              )}
            </div>
          )}

          {activeTab === 'unfundedVouchers' && (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-yellow-600">
                  <tr>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-900">Voucher ID</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-900">Fecha</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-900">Monto</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-900">Razón</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reconciliationResult.unfundedVouchers.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-">
                      <td className="px-4 py-3 text-sm">{item.voucherId ?? 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">{useFormatDate(item.date)}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        ${item.amount ? item.amount.toFixed(2) : '0.00'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.reason || 'Sin razón especificada'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reconciliationResult.unfundedVouchers.length === 0 && (
                <p className="text-center text-gray-500 py-8">No hay comprobantes NO conciliados</p>
              )}
            </div>
          )}

          {activeTab === 'unclaimedDeposits' && (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-orange-400">
                  <tr>
                    <th className="px-4 py-2 text-center text-sm font-medium text-orange-50">Transacción ID</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-orange-50">Monto</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-orange-50">Fecha</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-orange-50">Razón</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reconciliationResult.unclaimedDeposits.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{item.transactionId ?? 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        ${item.amount ? item.amount.toFixed(2) : '0.00'}
                      </td>
                      <td className="px-4 py-3 text-sm">{useFormatDate(item.date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.reason || 'Sin razón especificada'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reconciliationResult.unclaimedDeposits.length === 0 && (
                <p className="text-center text-gray-500 py-8">No hay movimientos bancarios sin asociar/conciliar</p>
              )}
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="space-y-4">
              {reconciliationResult.manualValidationRequired.map((item, idx) => (
                <div key={idx} className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="mb-3">
                    <h3 className="font-semibold text-red-900">
                      Voucher #{item.voucherId ?? 'N/A'} - $
                      {item.amount ? item.amount.toFixed(2) : '0.00'}
                    </h3>
                    <p className="text-sm text-gray-600">Fecha: {useFormatDate(item.date)}</p>
                    <p className="text-sm text-red-700 mt-1">{item.reason || 'Sin razón especificada'}</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Posibles coincidencias:</p>
                    <div className="space-y-2">
                      {item.possibleMatches?.map((match, matchIdx) => (
                        <div key={matchIdx} className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50">
                          <div className="flex-1">
                            <div>
                              <span className="text-sm font-medium">Transacción #{match.transactionId ?? 'N/A'}</span>
                              <span className="ml-3 text-xs text-gray-500">
                                Monto: ${match.amount ? match.amount.toFixed(2) : '0.00'}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Fecha: {useFormatDate(match.date)} | Score: {match.matchScore ? (match.matchScore * 100).toFixed(0) : '0'}%
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const voucherId = item.voucherId;
                              const transactionId = match.transactionId;
                              if (voucherId && transactionId) {
                                handleManualValidation(voucherId, transactionId);
                              } else {
                                alert('Error: Datos incompletos para realizar la conciliación');
                              }
                            }}
                            disabled={reconciling || !item.voucherId || !match.transactionId}
                            className="ml-3 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {reconciling ? 'Procesando...' : 'Conciliar'}
                          </button>
                        </div>
                      )) ?? []}
                    </div>
                  </div>
                </div>
              ))}
              {reconciliationResult.manualValidationRequired.length === 0 && (
                <p className="text-center text-gray-500 py-8">No hay casos que requieran validación manual</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Manual Reconciliation Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Conciliación Manual</h2>

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
          <button
            onClick={handleManualReconcile}
            disabled={
              !selectedTransaction || !selectedVoucher || reconciling
            }
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
          >
            {reconciling ? 'Conciliando...' : 'Conciliar'}
          </button>
        </div>
      </div>
    </div>
  );
}
