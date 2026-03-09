import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type StartReconciliationRequest,
  type ReconcileRequest,
  type BulkReconcileRequest,
} from '@shared/types/bank-reconciliation.types'
import {
  startReconciliation,
  reconcileTransaction,
  bulkReconcile,
  undoReconciliation,
} from '@services/bankReconciliationService';

interface UseBankReconciliationMutationsReturn {
  start: (data?: StartReconciliationRequest) => Promise<unknown>;
  reconcile: (data: ReconcileRequest) => Promise<unknown>;
  reconcileBulk: (data: BulkReconcileRequest) => Promise<unknown>;
  undo: (transactionId: string) => Promise<unknown>;
  reconciling: boolean;
  error: string | null;
}

/**
 * Hook para mutaciones de conciliación bancaria
 */
export const useBankReconciliationMutations = (): UseBankReconciliationMutationsReturn => {
  const queryClient = useQueryClient();

  const invalidateReconciliationQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions-bank'] });
    queryClient.invalidateQueries({ queryKey: ['vouchers'] });
    queryClient.invalidateQueries({ queryKey: ['unclaimed-deposits'] });
    queryClient.invalidateQueries({ queryKey: ['unfunded-vouchers'] });
    queryClient.invalidateQueries({ queryKey: ['manual-validation-pending'] });
    queryClient.invalidateQueries({ queryKey: ['manual-validation-stats'] });
    queryClient.invalidateQueries({ queryKey: ['match-suggestions'] });
  };

  const startMutation = useMutation({
    mutationFn: (data?: StartReconciliationRequest) => startReconciliation(data),
    onSuccess: invalidateReconciliationQueries,
  });

  const reconcileMutation = useMutation({
    mutationFn: (data: ReconcileRequest) => reconcileTransaction(data),
    onSuccess: invalidateReconciliationQueries,
  });

  const bulkReconcileMutation = useMutation({
    mutationFn: (data: BulkReconcileRequest) => bulkReconcile(data),
    onSuccess: invalidateReconciliationQueries,
  });

  const undoMutation = useMutation({
    mutationFn: (transactionId: string) => undoReconciliation(transactionId),
    onSuccess: invalidateReconciliationQueries,
  });

  return {
    start: startMutation.mutateAsync,
    reconcile: reconcileMutation.mutateAsync,
    reconcileBulk: bulkReconcileMutation.mutateAsync,
    undo: undoMutation.mutateAsync,
    reconciling:
      startMutation.isPending ||
      reconcileMutation.isPending ||
      bulkReconcileMutation.isPending ||
      undoMutation.isPending,
    error:
      startMutation.error?.message ||
      reconcileMutation.error?.message ||
      bulkReconcileMutation.error?.message ||
      undoMutation.error?.message ||
      null,
  };
};
