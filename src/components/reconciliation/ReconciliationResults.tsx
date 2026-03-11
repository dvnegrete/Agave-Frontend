import { useState } from 'react';
import { Tabs, StatsCard, Table, StatusBadge, ReconciliationCard, type TableColumn } from '@shared/ui';
import { useFormatDate as formatDate } from '@hooks/useFormatDate';
import { DateTimeCell } from '@shared/ui';
import type {
  StartReconciliationResponse,
  MatchedReconciliation,
  PendingVoucher,
  SurplusTransaction,
} from '@shared/types/bank-reconciliation.types';
import { formatCurrency } from '@/utils/formatters';
import { ModalAssignDepositHouse } from './ModalAssignDepositHouse';
import { useUnclaimedDepositsMutations } from '@hooks/index';
import { useAlert } from '@hooks/index';
import type { UnclaimedDeposit } from '@shared/types/unclaimed-deposits.types';

interface ReconciliationResultsProps {
  result: StartReconciliationResponse;
  reconciling: boolean;
}

function toModalDeposit(item: SurplusTransaction): UnclaimedDeposit {
  return {
    transactionBankId: item.transactionBankId,
    amount: item.amount,
    date: item.date,
    time: item.time ?? '',
    concept: item.concept ?? null,
    validationStatus: 'conflict',
    reason: item.reason,
    suggestedHouseNumber: item.houseNumber ?? null,
    conceptHouseNumber: null,
    processedAt: '',
  };
}

export function ReconciliationResults({ result, reconciling }: ReconciliationResultsProps) {
  const alert = useAlert();
  const { assignHouse } = useUnclaimedDepositsMutations();
  const [selectedDeposit, setSelectedDeposit] = useState<SurplusTransaction | null>(null);
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set());

  const [activeTab, setActiveTab] = useState<
    'summary' | 'conciliados' | 'unfundedVouchers' | 'unclaimedDeposits' | 'manual'
  >('summary');

  const pendingDeposits = result.unclaimedDeposits.filter(
    (d) => !assignedIds.has(d.transactionBankId),
  );

  const handleAssignHouse = async (data: { houseNumber: number; adminNotes?: string }) => {
    if (!selectedDeposit) return;
    await assignHouse(selectedDeposit.transactionBankId, data);
    setAssignedIds((prev) => new Set(prev).add(selectedDeposit.transactionBankId));
    alert.success('Éxito', `Depósito ${selectedDeposit.transactionBankId} asignado a casa ${data.houseNumber}`);
    setSelectedDeposit(null);
  };

  return (
    <div className="background-general shadow-lg rounded-lg border-4 p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Resultados de Conciliación</h2>

      <Tabs
        tabs={[
          { id: 'summary', label: 'Resumen', icon: '📊', color: 'blue' },
          { id: 'conciliados', label: 'Conciliados', icon: '✅', badge: result.conciliados.length, color: 'green' },
          { id: 'unfundedVouchers', label: 'Comprobantes NO Conciliados', icon: '⏳', badge: result.unfundedVouchers.length, color: 'yellow' },
          { id: 'unclaimedDeposits', label: 'Depósitos NO Asociados', icon: '➕', badge: pendingDeposits.length, color: 'orange' },
          { id: 'manual', label: 'Validación Manual', icon: '🔍', badge: result.manualValidationRequired.length, color: 'red' },
        ]}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
      />

      {activeTab === 'summary' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatsCard label="Total Procesados" value={result.summary.totalProcessed} variant="primary" icon="📊" />
            <StatsCard label="Conciliados" value={result.summary.conciliados} variant="success" icon="✅" />
            <StatsCard label="Comprobantes Sin Fondos" value={result.summary.unfundedVouchers} variant="warning" icon="⏳" />
            <StatsCard label="Depósitos No Asociados" value={result.summary.unclaimedDeposits} variant="warning" icon="➕" />
            <StatsCard label="Validación Manual" value={result.summary.requiresManualValidation} variant="error" icon="🔍" />
            {result.summary.crossMatched !== undefined && result.summary.crossMatched > 0 && (
              <StatsCard label="Cross-Matched (Auto)" value={result.summary.crossMatched} variant="success" icon="🔗" />
            )}
          </div>
        </div>
      )}

      {activeTab === 'conciliados' && (
        <Table
          columns={[
            { id: 'transactionBankId', header: 'Transacción', align: 'center', render: (item) => item.transactionBankId ?? 'N/A' },
            { id: 'houseNumber', header: 'Casa', align: 'center', render: (item) => item.houseNumber ?? 'N/A' },
            {
              id: 'amount', header: 'Monto', align: 'center',
              render: (item) => `$${item.amount ? formatCurrency(item.amount) : '0.00'}`,
            },
            {
              id: 'confidenceLevel', header: 'Nivel de Confianza', align: 'center',
              render: (item) => (
                <StatusBadge
                  status={item.confidenceLevel === 'high' ? 'success' : item.confidenceLevel === 'medium' ? 'warning' : 'info'}
                  label={item.confidenceLevel === 'high' ? 'Alta' : item.confidenceLevel === 'medium' ? 'Media' : 'Baja'}
                  icon={item.confidenceLevel === 'high' ? '✅' : item.confidenceLevel === 'medium' ? '⚖️' : '⚠️'}
                />
              ),
            },
          ] as TableColumn<MatchedReconciliation>[]}
          data={result.conciliados}
          emptyMessage="No hay registros conciliados"
          headerVariant="success"
          hoverable
        />
      )}

      {activeTab === 'unfundedVouchers' && (
        <Table
          columns={[
            { id: 'voucherId', header: 'Voucher ID', align: 'center', render: (item) => item.voucherId ?? 'N/A' },
            { id: 'date', header: 'Fecha', align: 'center', render: (item) => formatDate(item.date) },
            { id: 'amount', header: 'Monto', align: 'center', render: (item) => `$${item.amount ? formatCurrency(item.amount) : '0.00'}` },
            { id: 'reason', header: 'Razón', render: (item) => item.reason || 'Sin razón especificada' },
          ] as TableColumn<PendingVoucher>[]}
          data={result.unfundedVouchers}
          emptyMessage="No hay comprobantes NO conciliados"
          headerVariant="warning"
          hoverable
        />
      )}

      {activeTab === 'unclaimedDeposits' && (
        <Table
          columns={[
            { id: 'transactionBankId', header: 'Transacción ID', align: 'center', render: (item) => item.transactionBankId ?? 'N/A' },
            { id: 'amount', header: 'Monto', align: 'center', render: (item) => `$${item.amount ? formatCurrency(item.amount) : '0.00'}` },
            {
              id: 'dateTime', header: 'Fecha y Hora', align: 'center',
              render: (item) => <DateTimeCell dateString={item.date} timeString={item.time} variant="compact" showIcon={true} />,
            },
            {
              id: 'concept', header: 'Concepto', align: 'left',
              render: (item) => item.concept
                ? <span className="text-sm">{item.concept}</span>
                : <span className="text-foreground-tertiary text-sm">—</span>,
            },
            { id: 'reason', header: 'Razón', render: (item) => item.reason || 'Sin razón especificada' },
            {
              id: 'actions', header: 'Acción', align: 'center',
              render: (item) => (
                <button
                  onClick={() => setSelectedDeposit(item)}
                  className="text-xs px-2 py-1 rounded bg-info text-white hover:opacity-80 transition-opacity"
                >
                  Asignar Casa
                </button>
              ),
            },
          ] as TableColumn<SurplusTransaction>[]}
          data={pendingDeposits}
          emptyMessage="✅ Todos los depósitos han sido asignados"
          headerVariant="warning"
          hoverable
        />
      )}

      {activeTab === 'manual' && (
        <div className="space-y-4">
          {result.manualValidationRequired.map((item, idx) => (
            <ReconciliationCard
              key={idx}
              transactionBankId={item.transactionBankId}
              reason={item.reason}
              possibleMatches={item.possibleMatches}
              onConciliate={() => {}}
              isProcessing={reconciling}
            />
          ))}
          {result.manualValidationRequired.length === 0 && (
            <p className="text-center text-foreground-tertiary py-8">No hay casos que requieran validación manual</p>
          )}
        </div>
      )}

      <ModalAssignDepositHouse
        isOpen={!!selectedDeposit}
        deposit={selectedDeposit ? toModalDeposit(selectedDeposit) : null}
        onSave={handleAssignHouse}
        onClose={() => setSelectedDeposit(null)}
      />
    </div>
  );
}
