import { useState } from 'react';
import { useBankReconciliationMutations, useAlert } from '@hooks/index';
import {
  StartReconciliationModal,
  ReconciliationResults,
  ManualValidationSection,
  UnclaimedDepositsListSection,
  MatchSuggestionsSection,
  UnfundedVouchersSection,
} from '@components/reconciliation';
import { Button } from '@shared/ui';
import type { StartReconciliationResponse } from '@shared/types/bank-reconciliation.types';

export function BankReconciliation() {
  const alert = useAlert();
  const { start, reconciling, error } = useBankReconciliationMutations();
  const [showStartModal, setShowStartModal] = useState(false);
  const [reconciliationResult, setReconciliationResult] = useState<StartReconciliationResponse | null>(null);

  const handleStartReconciliation = async (data: { startDate?: string; endDate?: string }): Promise<StartReconciliationResponse | undefined> => {
    const result = await start(data);
    if (result) {
      setReconciliationResult(result as StartReconciliationResponse);
    }
    return result as StartReconciliationResponse | undefined;
  };

  return (
    <div className="container flex-1 mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Conciliación Bancaria</h1>
        <Button onClick={() => setShowStartModal(true)} variant="success">
          🚀 Iniciar Conciliación
        </Button>
      </div>

      {error && (
        <div className="border border-error text-error px-4 py-3 rounded">
          Error: {error}
        </div>
      )}

      <StartReconciliationModal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        onStart={handleStartReconciliation}
        isProcessing={reconciling}
      />

      {reconciliationResult && (
        <ReconciliationResults result={reconciliationResult} reconciling={reconciling} />
      )}

      <ManualValidationSection />
      <UnclaimedDepositsListSection />
      <MatchSuggestionsSection />
      <UnfundedVouchersSection />
    </div>
  );
}
