import { useState } from 'react';
import {
  useBankReconciliationMutations,
  useManualValidationPending,
  useManualValidationMutations,
  useManualValidationStats,
  useUnclaimedDeposits,
  useUnclaimedDepositsMutations,
  useUnfundedVouchers,
  useUnfundedVouchersMutations,
  useMatchSuggestions,
  useMatchSuggestionsMutations,
  useFormatDate,
  useAlert,
} from '@hooks/index';
import { StartReconciliationModal } from '@components/reconciliation';
import {
  Button,
  StatusBadge,
  StatsCard,
  Tabs,
  DateTimeCell,
  Table,
  ReconciliationCard,
  type TableColumn
} from '@shared/ui';
import type {
  StartReconciliationResponse,
  MatchedReconciliation,
  PendingVoucher,
  SurplusTransaction,
  ManualValidationPendingItem,
  UnclaimedDepositsItem,
  UnfundedVouchersItem,
  MatchSuggestionItem,
} from '@shared/types/bank-reconciliation.types';
import { formatCurrency } from '@/utils/formatters';

export function BankReconciliation() {
  const alert = useAlert();

  // ============ Main Reconciliation State ============
  const { start, reconciling, error } = useBankReconciliationMutations();
  const [showStartModal, setShowStartModal] = useState(false);
  const [reconciliationResult, setReconciliationResult] = useState<StartReconciliationResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'conciliados' | 'unfundedVouchers' | 'unclaimedDeposits' | 'manual' | 'manualValidationList' | 'unclaimedDepositsList' | 'unfundedVouchersList'>('summary');

  // ============ Pagination State ============
  const [manualValidationPage, setManualValidationPage] = useState(1);
  const [unclaimedDepositsPage, setUnclaimedDepositsPage] = useState(1);
  const [unfundedVouchersPage, setUnfundedVouchersPage] = useState(1);
  const [pageLimit] = useState(20);

  // ============ Filter State ============
  const [depositValidationStatus, setDepositValidationStatus] = useState<'all' | 'conflict' | 'not-found'>('all');

  // ============ Collapse State ============
  const [expandedManualValidation, setExpandedManualValidation] = useState(false);
  const [expandedUnclaimedDeposits, setExpandedUnclaimedDeposits] = useState(false);
  const [expandedUnfundedVouchers, setExpandedUnfundedVouchers] = useState(false);
  const [expandedMatchSuggestions, setExpandedMatchSuggestions] = useState(false);

  // ============ Modal State ============
  const [selectedDepositForAssign, setSelectedDepositForAssign] = useState<UnclaimedDepositsItem | null>(null);
  const [selectedVoucherForMatch, setSelectedVoucherForMatch] = useState<UnfundedVouchersItem | null>(null);
  const [showAssignHouseModal, setShowAssignHouseModal] = useState(false);
  const [showMatchDepositModal, setShowMatchDepositModal] = useState(false);
  const [assignHouseNumber, setAssignHouseNumber] = useState<string>('');
  const [matchTransactionBankId, setMatchTransactionBankId] = useState<string>('');
  const [matchHouseNumber, setMatchHouseNumber] = useState<string>('');
  const [approvalNotes, setApprovalNotes] = useState<string>('');
  const [selectedManualValidationItem, setSelectedManualValidationItem] = useState<ManualValidationPendingItem | null>(null);

  // ============ Queries ============
  const {
    data: manualValidationData,
    isLoading: manualValidationLoading,
    refetch: refetchManualValidation,
  } = useManualValidationPending({
    page: manualValidationPage,
    limit: pageLimit,
  });

  const {
    data: manualValidationStats,
  } = useManualValidationStats();

  const {
    data: unclaimedDepositsData,
    isLoading: unclaimedDepositsLoading,
    refetch: refetchUnclaimedDeposits,
  } = useUnclaimedDeposits({
    page: unclaimedDepositsPage,
    limit: pageLimit,
    validationStatus: depositValidationStatus,
  });

  const {
    data: unfundedVouchersData,
    isLoading: unfundedVouchersLoading,
    refetch: refetchUnfundedVouchers,
  } = useUnfundedVouchers({
    page: unfundedVouchersPage,
    limit: pageLimit,
  });

  const {
    data: matchSuggestionsData,
    isLoading: matchSuggestionsLoading,
    refetch: refetchMatchSuggestions,
  } = useMatchSuggestions();

  // ============ Mutations ============
  const {
    approve: approveManualValidation,
    approving: approvingManualValidation,
  } = useManualValidationMutations();

  const {
    assignHouse: assignHouseToDeposit,
    assigning: assigningHouse,
  } = useUnclaimedDepositsMutations();

  const {
    matchDeposit: matchVoucherWithDeposit,
    matching: matchingDeposit,
  } = useUnfundedVouchersMutations();

  const {
    applySuggestion: applyMatchSuggestion,
    applyBatch: applyBatchSuggestions,
    applying: applyingSuggestion,
    applyingBatch: applyingBatchSuggestions,
  } = useMatchSuggestionsMutations();

  // ============ Handlers ============
  const handleStartReconciliation = async (data: { startDate?: string; endDate?: string }): Promise<StartReconciliationResponse | undefined> => {
    const result = await start(data);
    if (result) {
      setReconciliationResult(result as StartReconciliationResponse);
      setActiveTab('summary');
    }
    return result as StartReconciliationResponse | undefined;
  };

  const handleApproveManualValidation = async (transactionId: string) => {
    if (!selectedManualValidationItem) {
      alert.error('Error', 'Por favor selecciona un voucher');
      return;
    }

    try {
      await approveManualValidation(transactionId, {
        voucherId: selectedManualValidationItem.possibleMatches[0]?.voucherId || 0,
        approverNotes: approvalNotes,
      });
      alert.success('Éxito', 'Caso aprobado exitosamente');
      setSelectedManualValidationItem(null);
      setApprovalNotes('');
      refetchManualValidation();
    } catch (err) {
      console.error('Error approving:', err);
      alert.error('Error', 'No se pudo aprobar el caso');
    }
  };

  const handleAssignHouse = async () => {
    if (!selectedDepositForAssign || !assignHouseNumber) {
      alert.warning('Validación requerida', 'Por favor especifica una casa');
      return;
    }

    try {
      await assignHouseToDeposit(selectedDepositForAssign.transactionBankId, {
        houseNumber: parseInt(assignHouseNumber, 10),
      });
      alert.success('Éxito', 'Casa asignada exitosamente');
      setShowAssignHouseModal(false);
      setSelectedDepositForAssign(null);
      setAssignHouseNumber('');
      refetchUnclaimedDeposits();
    } catch (err) {
      console.error('Error assigning house:', err);
      alert.error('Error', 'No se pudo asignar la casa');
    }
  };

  const handleMatchDeposit = async () => {
    if (!selectedVoucherForMatch || !matchTransactionBankId || !matchHouseNumber) {
      alert.warning('Validación requerida', 'Por favor completa todos los campos');
      return;
    }

    try {
      await matchVoucherWithDeposit(selectedVoucherForMatch.voucherId, {
        transactionBankId: matchTransactionBankId,
        houseNumber: parseInt(matchHouseNumber, 10),
      });
      alert.success('Éxito', 'Voucher conciliado exitosamente');
      setShowMatchDepositModal(false);
      setSelectedVoucherForMatch(null);
      setMatchTransactionBankId('');
      setMatchHouseNumber('');
      refetchUnfundedVouchers();
    } catch (err) {
      console.error('Error matching deposit:', err);
      alert.error('Error', 'No se pudo conciliar el voucher');
    }
  };

  const handleCloseModal = (): void => {
    setShowStartModal(false);
  };

  const handleApplySuggestion = async (suggestion: MatchSuggestionItem) => {
    if (!suggestion.houseNumber) {
      alert.warning('Casa requerida', 'Esta sugerencia no tiene casa identificada');
      return;
    }

    try {
      await applyMatchSuggestion({
        transactionBankId: suggestion.transactionBankId,
        voucherId: suggestion.voucherId,
        houseNumber: suggestion.houseNumber,
      });
      alert.success('Aplicado', `Depósito ${suggestion.transactionBankId} conciliado con Voucher ${suggestion.voucherId}`);
      refetchMatchSuggestions();
      refetchUnclaimedDeposits();
      refetchUnfundedVouchers();
    } catch (err) {
      console.error('Error applying suggestion:', err);
      alert.error('Error', 'No se pudo aplicar la sugerencia');
    }
  };

  const handleApplyAllHighConfidence = async () => {
    if (!matchSuggestionsData) return;

    const highConfSuggestions = matchSuggestionsData.suggestions
      .filter((s) => s.confidence === 'high' && s.houseNumber)
      .map((s) => ({
        transactionBankId: s.transactionBankId,
        voucherId: s.voucherId,
        houseNumber: s.houseNumber!,
      }));

    if (highConfSuggestions.length === 0) {
      alert.warning('Sin sugerencias', 'No hay sugerencias de alta confianza para aplicar');
      return;
    }

    try {
      const result = await applyBatchSuggestions({ suggestions: highConfSuggestions });
      if (result) {
        alert.success(
          'Batch completado',
          `${result.totalApplied} aplicados, ${result.totalFailed} fallidos`,
        );
      }
      refetchMatchSuggestions();
      refetchUnclaimedDeposits();
      refetchUnfundedVouchers();
    } catch (err) {
      console.error('Error applying batch:', err);
      alert.error('Error', 'No se pudo aplicar el batch');
    }
  };

  return (
    <div className="container flex-1 mx-auto p-4 space-y-6">
      {/* Header */}
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
        <div className="border border-error text-error px-4 py-3 rounded">
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

      {/* Main Reconciliation Results Tabs */}
      {reconciliationResult && (
        <div className="background-general shadow-lg rounded-lg border-4 p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Resultados de Conciliación</h2>

          <Tabs
            tabs={[
              { id: 'summary', label: 'Resumen', icon: '📊', color: 'blue' },
              { id: 'conciliados', label: 'Conciliados', icon: '✅', badge: reconciliationResult.conciliados.length, color: 'green' },
              { id: 'unfundedVouchers', label: 'Comprobantes NO Conciliados', icon: '⏳', badge: reconciliationResult.unfundedVouchers.length, color: 'yellow' },
              { id: 'unclaimedDeposits', label: 'Depósitos NO Asociados', icon: '➕', badge: reconciliationResult.unclaimedDeposits.length, color: 'orange' },
              { id: 'manual', label: 'Validación Manual', icon: '🔍', badge: reconciliationResult.manualValidationRequired.length, color: 'red' },
            ]}
            activeTab={activeTab as any}
            onTabChange={(tabId) => setActiveTab(tabId as any)}
          />

          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatsCard
                  label="Total Procesados"
                  value={reconciliationResult.summary.totalProcessed}
                  variant="primary"
                  icon="📊"
                />
                <StatsCard
                  label="Conciliados"
                  value={reconciliationResult.summary.conciliados}
                  variant="success"
                  icon="✅"
                />
                <StatsCard
                  label="Comprobantes Sin Fondos"
                  value={reconciliationResult.summary.unfundedVouchers}
                  variant="warning"
                  icon="⏳"
                />
                <StatsCard
                  label="Depósitos No Asociados"
                  value={reconciliationResult.summary.unclaimedDeposits}
                  variant="warning"
                  icon="➕"
                />
                <StatsCard
                  label="Validación Manual"
                  value={reconciliationResult.summary.requiresManualValidation}
                  variant="error"
                  icon="🔍"
                />
                {reconciliationResult.summary.crossMatched !== undefined && reconciliationResult.summary.crossMatched > 0 && (
                  <StatsCard
                    label="Cross-Matched (Auto)"
                    value={reconciliationResult.summary.crossMatched}
                    variant="success"
                    icon="🔗"
                  />
                )}
              </div>
            </div>
          )}

          {/* Conciliados Tab */}
          {activeTab === 'conciliados' && (
            <Table
              columns={[
                {
                  id: 'transactionBankId',
                  header: 'Transacción',
                  align: 'center',
                  render: (item) => item.transactionBankId ?? 'N/A',
                },
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
                            : 'info'
                      }
                      label={
                        item.confidenceLevel === 'high'
                          ? 'Alta'
                          : item.confidenceLevel === 'medium'
                            ? 'Media'
                            : 'Baja'
                      }
                      icon={
                        item.confidenceLevel === 'high'
                          ? '✅'
                          : item.confidenceLevel === 'medium'
                            ? '⚖️'
                            : '⚠️'
                      }
                    />
                  ),
                },
              ] as TableColumn<MatchedReconciliation>[]}
              data={reconciliationResult.conciliados}
              emptyMessage="No hay registros conciliados"
              headerVariant="success"
              hoverable
            />
          )}

          {/* Unfunded Vouchers Tab */}
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
              ] as TableColumn<PendingVoucher>[]}
              data={reconciliationResult.unfundedVouchers}
              emptyMessage="No hay comprobantes NO conciliados"
              headerVariant="warning"
              hoverable
            />
          )}

          {/* Unclaimed Deposits Tab */}
          {activeTab === 'unclaimedDeposits' && (
            <Table
              columns={[
                {
                  id: 'transactionBankId',
                  header: 'Transacción ID',
                  align: 'center',
                  render: (item) => item.transactionBankId ?? 'N/A',
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
              ] as TableColumn<SurplusTransaction>[]}
              data={reconciliationResult.unclaimedDeposits}
              emptyMessage="No hay movimientos bancarios sin asociar/conciliar"
              headerVariant="warning"
              hoverable
            />
          )}

          {/* Manual Validation Tab */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              {reconciliationResult.manualValidationRequired.map((item, idx) => (
                <ReconciliationCard
                  key={idx}
                  transactionBankId={item.transactionBankId}
                  reason={item.reason}
                  possibleMatches={item.possibleMatches}
                  onConciliate={() => {
                    // Implementation would go here
                  }}
                  isProcessing={reconciling}
                />
              ))}
              {reconciliationResult.manualValidationRequired.length === 0 && (
                <p className="text-center text-foreground-tertiary py-8">No hay casos que requieran validación manual</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============ NEW SECTIONS WITH FULL PAGINATION AND ACTIONS ============ */}

      {/* Manual Validation Pending Section */}
      <div className="shadow-lg rounded-lg border-2 border-error overflow-hidden">
        {/* Collapsible Header */}
        <button
          onClick={() => setExpandedManualValidation(!expandedManualValidation)}
          className="w-full hover:bg-error/15 transition-colors px-6 py-4 flex justify-between items-center border-b border-error"
        >
          <div className="flex justify-between items-center w-full">
            <h2 className="text-xl font-bold">🔍 Validación Manual - Casos Pendientes</h2>
            {manualValidationStats && (
              <div className="text-sm text-foreground-secondary">
                {manualValidationStats.totalPending} pendientes • {manualValidationStats.totalApproved} aprobados
              </div>
            )}
          </div>
          <span className="text-lg ml-4">
            {expandedManualValidation ? '▼' : '▶'}
          </span>
        </button>

        {/* Collapsible Content */}
        {expandedManualValidation && (
        <div className="p-6">

        {manualValidationLoading ? (
          <p className="text-center text-foreground-tertiary py-4">Cargando...</p>
        ) : manualValidationData && manualValidationData.items.length > 0 ? (
          <>
            <Table
              columns={[
                {
                  id: 'transactionBankId',
                  header: 'Transacción ID',
                  align: 'left',
                  render: (item) => <span className="font-medium">{item.transactionBankId}</span>,
                },
                {
                  id: 'transactionConcept',
                  header: 'Concepto',
                  align: 'left',
                  render: (item) => item.transactionConcept,
                },
                {
                  id: 'transactionAmount',
                  header: 'Monto',
                  align: 'right',
                  render: (item) => `$${item.transactionAmount.toFixed(2)}`,
                },
                {
                  id: 'possibleMatches',
                  header: 'Posibles Vouchers',
                  align: 'left',
                  render: (item) => (
                    <div className="space-y-1 text-sm">
                      {item.possibleMatches.map((match, idx) => (
                        <div key={idx}>
                          Voucher #{match.voucherId} ({(match.similarity * 100).toFixed(0)}%)
                        </div>
                      ))}
                    </div>
                  ),
                },
                {
                  id: 'actions',
                  header: 'Acciones',
                  align: 'center',
                  render: (item) => (
                    <Button
                      onClick={() => setSelectedManualValidationItem(item)}
                      variant="info"
                      className="text-xs py-1 px-2"
                    >
                      Revisar
                    </Button>
                  ),
                },
              ]}
              data={manualValidationData.items}
              emptyMessage="No hay casos pendientes"
              headerVariant="error"
              hoverable
            />

            {/* Pagination */}
            {manualValidationData.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  onClick={() => setManualValidationPage(Math.max(1, manualValidationPage - 1))}
                  disabled={manualValidationPage === 1}
                  variant="info"
                  className="text-xs py-1 px-3"
                >
                  Anterior
                </Button>
                <span className="px-3 py-2 text-sm">
                  Página {manualValidationData.page} de {manualValidationData.totalPages}
                </span>
                <Button
                  onClick={() => setManualValidationPage(Math.min(manualValidationData.totalPages, manualValidationPage + 1))}
                  disabled={manualValidationPage === manualValidationData.totalPages}
                  variant="info"
                  className="text-xs py-1 px-3"
                >
                  Siguiente
                </Button>
              </div>
            )}

            {/* Detail Modal */}
            {selectedManualValidationItem && (
              <div className="fixed inset-0 bg-tertiary flex items-center justify-center z-50 p-4">
                <div className="bg-base rounded-lg shadow-lg max-w-md w-full p-6">
                  <h3 className="text-lg font-bold mb-4">Validar Caso</h3>

                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="text-sm font-medium">Transacción ID:</label>
                      <p className="text-foreground">{selectedManualValidationItem.transactionBankId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Monto:</label>
                      <p className="text-foreground">${selectedManualValidationItem.transactionAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Vouchers Posibles:</label>
                      <select
                        className="w-full mt-1 p-2 border border-base rounded"
                        onChange={() => {
                          // Handle voucher selection
                        }}
                      >
                        <option value="">Selecciona un voucher</option>
                        {selectedManualValidationItem.possibleMatches.map((match: any, idx: number) => (
                          <option key={idx} value={match.voucherId}>
                            Voucher #{match.voucherId} - ${match.voucherAmount.toFixed(2)} ({(match.similarity * 100).toFixed(0)}%)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Notas del Aprobador:</label>
                      <textarea
                        className="w-full mt-1 p-2 border border-base rounded text-sm"
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        placeholder="Notas opcionales..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApproveManualValidation(selectedManualValidationItem.transactionBankId)}
                      variant="success"
                      isLoading={approvingManualValidation}
                      className="flex-1"
                    >
                      Aprobar
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedManualValidationItem(null);
                      }}
                      variant="error"
                      className="flex-1"
                    >
                      Rechazar
                    </Button>
                  </div>

                  <button
                    onClick={() => setSelectedManualValidationItem(null)}
                    className="w-full mt-2 px-4 py-2 text-foreground border border-base rounded hover:bg-secondary"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-foreground-tertiary py-8">No hay casos pendientes de validación manual</p>
        )}
        </div>
        )}
      </div>

      {/* Unclaimed Deposits Section */}
      <div className="shadow-lg rounded-lg border-2 border-warning overflow-hidden">
        {/* Collapsible Header */}
        <button
          onClick={() => setExpandedUnclaimedDeposits(!expandedUnclaimedDeposits)}
          className="w-full transition-colors px-6 py-4 flex justify-between items-center border-b border-warning"
        >
          <div className="flex justify-between items-center w-full">
            <h2 className="text-xl font-bold">➕ Depósitos No Asociados</h2>
            {unclaimedDepositsData && (
              <div className="text-sm text-foreground-secondary">
                {unclaimedDepositsData.totalCount} total
              </div>
            )}
          </div>
          <span className="text-lg ml-4">
            {expandedUnclaimedDeposits ? '▼' : '▶'}
          </span>
        </button>

        {/* Collapsible Content */}
        {expandedUnclaimedDeposits && (
        <div className="p-6">

        <div className="mb-4 flex gap-2">
          <select
            value={depositValidationStatus}
            onChange={(e) => {
              setDepositValidationStatus(e.target.value as any);
              setUnclaimedDepositsPage(1);
            }}
            className="bg-base px-3 py-2 border border-base rounded text-sm"
          >
            <option value="all">Todos</option>
            <option value="conflict">Conflicto</option>
            <option value="not-found">No Encontrado</option>
          </select>
        </div>

        {unclaimedDepositsLoading ? (
          <p className="text-center text-foreground-tertiary py-4">Cargando...</p>
        ) : unclaimedDepositsData && unclaimedDepositsData.items.length > 0 ? (
          <>
            <Table
              columns={[                
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
                  render: (item) => `$${formatCurrency(item.amount)}`,
                },
                {
                  id: 'concept',
                  header: 'Concepto',
                  align: 'left',
                  render: (item) => item.concept,
                },
                {
                  id: 'validationStatus',
                  header: 'Estado',
                  align: 'center',
                  render: (item) => (
                    <StatusBadge
                      status={item.validationStatus === 'conflict' ? 'warning' : 'info'}
                      label={item.validationStatus === 'conflict' ? 'Conflicto' : 'No Encontrado'}
                      icon={item.validationStatus === 'conflict' ? '⚠️' : '❓'}
                    />
                  ),
                },
                {
                  id: 'actions',
                  header: 'Acciones',
                  align: 'center',
                  render: (item) => (
                    <Button
                      onClick={() => {
                        setSelectedDepositForAssign(item);
                        setShowAssignHouseModal(true);
                      }}
                      variant="info"
                      className="text-xs py-1 px-2"
                    >
                      Asignar Casa
                    </Button>
                  ),
                },
              ]}
              data={unclaimedDepositsData.items}
              emptyMessage="No hay depósitos no asociados"
              headerVariant="warning"
              hoverable
            />

            {/* Pagination */}
            {unclaimedDepositsData.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  onClick={() => setUnclaimedDepositsPage(Math.max(1, unclaimedDepositsPage - 1))}
                  disabled={unclaimedDepositsPage === 1}
                  variant="info"
                  className="text-xs py-1 px-3"
                >
                  Anterior
                </Button>
                <span className="px-3 py-2 text-sm">
                  Página {unclaimedDepositsData.page} de {unclaimedDepositsData.totalPages}
                </span>
                <Button
                  onClick={() => setUnclaimedDepositsPage(Math.min(unclaimedDepositsData.totalPages, unclaimedDepositsPage + 1))}
                  disabled={unclaimedDepositsPage === unclaimedDepositsData.totalPages}
                  variant="info"
                  className="text-xs py-1 px-3"
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-foreground-tertiary py-8">No hay depósitos no asociados</p>
        )}
        </div>
        )}
      </div>

      {/* Assign House Modal */}
      {showAssignHouseModal && selectedDepositForAssign && (
        <div className="fixed inset-0 bg-tertiary flex items-center justify-center z-50 p-4">
          <div className="bg-base border border-info rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Asignar Casa a Depósito</h3>

            <div className="space-y-4 mb-4">
              <div>
                <label className="text-sm font-medium">Transacción ID:</label>
                <p className="text-foreground">{selectedDepositForAssign.transactionBankId}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Monto:</label>
                <p className="text-foreground">${selectedDepositForAssign.amount.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Número de Casa (1-66):</label>
                <input
                  type="number"
                  min="1"
                  max="66"
                  className="w-full mt-1 px-3 py-2 border border-base rounded"
                  value={assignHouseNumber}
                  onChange={(e) => setAssignHouseNumber(e.target.value)}
                  placeholder="Ej: 15"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAssignHouse}
                variant="success"
                isLoading={assigningHouse}
                className="flex-1"
              >
                Asignar
              </Button>
              <Button
                onClick={() => {
                  setShowAssignHouseModal(false);
                  setSelectedDepositForAssign(null);
                  setAssignHouseNumber('');
                }}
                variant="info"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Match Suggestions (Cross-Matching) Section */}
      <div className="shadow-lg rounded-lg border-2 border-success overflow-hidden">
        {/* Collapsible Header */}
        <button
          onClick={() => setExpandedMatchSuggestions(!expandedMatchSuggestions)}
          className="w-full hover:bg-success/15 transition-colors px-6 py-4 flex justify-between items-center border-b border-success"
        >
          <div className="flex justify-between items-center w-full">
            <h2 className="text-xl font-bold">🔗 Sugerencias de Conciliación (Cross-Matching)</h2>
            {matchSuggestionsData && (
              <div className="text-sm text-foreground-secondary">
                {matchSuggestionsData.totalSuggestions} sugerencias ({matchSuggestionsData.highConfidence} alta, {matchSuggestionsData.mediumConfidence} media)
              </div>
            )}
          </div>
          <span className="text-lg ml-4">
            {expandedMatchSuggestions ? '▼' : '▶'}
          </span>
        </button>

        {/* Collapsible Content */}
        {expandedMatchSuggestions && (
        <div className="p-6">

        {matchSuggestionsLoading ? (
          <p className="text-center text-foreground-tertiary py-4">Cargando sugerencias...</p>
        ) : matchSuggestionsData && matchSuggestionsData.suggestions.length > 0 ? (
          <>
            {/* Batch Apply Button */}
            {matchSuggestionsData.highConfidence > 0 && (
              <div className="mb-4">
                <Button
                  onClick={handleApplyAllHighConfidence}
                  variant="success"
                  isLoading={applyingBatchSuggestions}
                >
                  Aplicar Todas ({matchSuggestionsData.highConfidence} Alta Confianza)
                </Button>
              </div>
            )}

            <Table
              columns={[
                {
                  id: 'transactionBankId',
                  header: 'Depósito ID',
                  align: 'center',
                  render: (item: MatchSuggestionItem) => <span className="font-medium">{item.transactionBankId}</span>,
                },
                {
                  id: 'voucherId',
                  header: 'Voucher ID',
                  align: 'center',
                  render: (item: MatchSuggestionItem) => `#${item.voucherId}`,
                },
                {
                  id: 'amount',
                  header: 'Monto',
                  align: 'right',
                  render: (item: MatchSuggestionItem) => `$${formatCurrency(item.amount)}`,
                },
                {
                  id: 'depositDate',
                  header: 'Fecha Depósito',
                  align: 'center',
                  render: (item: MatchSuggestionItem) => useFormatDate(item.depositDate),
                },
                {
                  id: 'voucherDate',
                  header: 'Fecha Voucher',
                  align: 'center',
                  render: (item: MatchSuggestionItem) => useFormatDate(item.voucherDate),
                },
                {
                  id: 'houseNumber',
                  header: 'Casa',
                  align: 'center',
                  render: (item: MatchSuggestionItem) => item.houseNumber ? `Casa ${item.houseNumber}` : 'N/A',
                },
                {
                  id: 'confidence',
                  header: 'Confianza',
                  align: 'center',
                  render: (item: MatchSuggestionItem) => (
                    <StatusBadge
                      status={item.confidence === 'high' ? 'success' : 'warning'}
                      label={item.confidence === 'high' ? 'Alta' : 'Media'}
                      icon={item.confidence === 'high' ? '✅' : '⚠️'}
                    />
                  ),
                },
                {
                  id: 'actions',
                  header: 'Acciones',
                  align: 'center',
                  render: (item: MatchSuggestionItem) => (
                    <Button
                      onClick={() => handleApplySuggestion(item)}
                      variant="success"
                      className="text-xs py-1 px-2"
                      isLoading={applyingSuggestion}
                      disabled={!item.houseNumber}
                    >
                      Aplicar
                    </Button>
                  ),
                },
              ]}
              data={matchSuggestionsData.suggestions}
              emptyMessage="No hay sugerencias de cross-matching"
              headerVariant="success"
              hoverable
            />
          </>
        ) : (
          <p className="text-center text-foreground-tertiary py-8">No hay sugerencias de cross-matching disponibles</p>
        )}
        </div>
        )}
      </div>

      {/* Unfunded Vouchers Section */}
      <div className="shadow-lg rounded-lg border-2 border-warning overflow-hidden">
        {/* Collapsible Header */}
        <button
          onClick={() => setExpandedUnfundedVouchers(!expandedUnfundedVouchers)}
          className="w-full transition-colors px-6 py-4 flex justify-between items-center border-b border-warning"
        >
          <div className="flex justify-between items-center w-full">
            <h2 className="text-xl font-bold">⏳ Comprobantes Sin Fondos</h2>
            {unfundedVouchersData && (
              <div className="text-sm text-foreground-secondary">
                {unfundedVouchersData.totalCount} total
              </div>
            )}
          </div>
          <span className="text-lg ml-4">
            {expandedUnfundedVouchers ? '▼' : '▶'}
          </span>
        </button>

        {/* Collapsible Content */}
        {expandedUnfundedVouchers && (
        <div className="p-6">

        {unfundedVouchersLoading ? (
          <p className="text-center text-foreground-tertiary py-4">Cargando...</p>
        ) : unfundedVouchersData && unfundedVouchersData.items.length > 0 ? (
          <>
            <Table
              columns={[                
                {
                  id: 'houseNumber',
                  header: 'Casa',
                  align: 'center',
                  render: (item) => item.houseNumber ? `Casa ${item.houseNumber}` : 'N/A',
                },
                {
                  id: 'amount',
                  header: 'Monto',
                  align: 'center',
                  render: (item) => `$${formatCurrency(item.amount)}`,
                },
                {
                  id: 'date',
                  header: 'Fecha',
                  align: 'center',
                  render: (item) => useFormatDate(item.date),
                },
                {
                  id: 'actions',
                  header: 'Acciones',
                  align: 'center',
                  render: (item) => (
                    <Button
                      onClick={() => {
                        setSelectedVoucherForMatch(item);
                        setShowMatchDepositModal(true);
                      }}
                      variant="info"
                      className="text-xs py-1 px-2"                      
                    >
                      Conciliar
                    </Button>
                  ),
                },
              ]}
              data={unfundedVouchersData.items}
              emptyMessage="No hay comprobantes sin fondos"
              headerVariant="warning"
              hoverable
            />

            {/* Pagination */}
            {unfundedVouchersData.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  onClick={() => setUnfundedVouchersPage(Math.max(1, unfundedVouchersPage - 1))}
                  disabled={unfundedVouchersPage === 1}
                  variant="info"
                  className="text-xs py-1 px-3"
                >
                  Anterior
                </Button>
                <span className="px-3 py-2 text-sm">
                  Página {unfundedVouchersData.page} de {unfundedVouchersData.totalPages}
                </span>
                <Button
                  onClick={() => setUnfundedVouchersPage(Math.min(unfundedVouchersData.totalPages, unfundedVouchersPage + 1))}
                  disabled={unfundedVouchersPage === unfundedVouchersData.totalPages}
                  variant="info"
                  className="text-xs py-1 px-3"
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-foreground-tertiary py-8">No hay comprobantes sin fondos</p>
        )}
        </div>
        )}
      </div>

      {/* Match Deposit Modal */}
      {showMatchDepositModal && selectedVoucherForMatch && (
        <div className="fixed inset-0 bg-tertiary flex items-center justify-center z-50 p-4">
          <div className="bg-base border border-info rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Conciliar Comprobante con Depósito</h3>

            <div className="space-y-4 mb-4">
              <div>
                <label className="text-sm font-medium">Voucher ID:</label>
                <p className="text-foreground">#{selectedVoucherForMatch.voucherId}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Monto:</label>
                <p className="text-foreground">${selectedVoucherForMatch.amount.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Transacción Bancaria ID:</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border border-base rounded"
                  value={matchTransactionBankId}
                  onChange={(e) => setMatchTransactionBankId(e.target.value)}
                  placeholder="Ej: TX-001 o 12345"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Número de Casa (1-66):</label>
                <input
                  type="number"
                  min="1"
                  max="66"
                  className="w-full mt-1 px-3 py-2 border border-base rounded"
                  value={matchHouseNumber}
                  onChange={(e) => setMatchHouseNumber(e.target.value)}
                  placeholder="Ej: 15"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleMatchDeposit}
                variant="success"
                isLoading={matchingDeposit}
                className="flex-1"
              >
                Conciliar
              </Button>
              <Button
                onClick={() => {
                  setShowMatchDepositModal(false);
                  setSelectedVoucherForMatch(null);
                  setMatchTransactionBankId('');
                  setMatchHouseNumber('');
                }}
                variant="info"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
