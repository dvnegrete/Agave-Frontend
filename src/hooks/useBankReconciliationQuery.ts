import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  startReconciliation,
  reconcileTransaction,
  bulkReconcile,
  undoReconciliation,
  type StartReconciliationRequest,
  type StartReconciliationResponse,
  type ReconcileRequest,
  type ReconcileResponse,
  type BulkReconcileRequest,
  type BulkReconcileResponse,
} from '../services';

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

  const startMutation = useMutation({
    mutationFn: (data?: StartReconciliationRequest) => startReconciliation(data),
    onSuccess: () => {
      // Invalidar queries relacionadas después de iniciar conciliación
      queryClient.invalidateQueries({ queryKey: ['transactions-bank'] });
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
    },
  });

  const reconcileMutation = useMutation({
    mutationFn: (data: ReconcileRequest) => reconcileTransaction(data),
    onSuccess: () => {
      // Invalidar queries después de conciliar
      queryClient.invalidateQueries({ queryKey: ['transactions-bank'] });
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
    },
  });

  const bulkReconcileMutation = useMutation({
    mutationFn: (data: BulkReconcileRequest) => bulkReconcile(data),
    onSuccess: () => {
      // Invalidar queries después de conciliación en lote
      queryClient.invalidateQueries({ queryKey: ['transactions-bank'] });
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
    },
  });

  const undoMutation = useMutation({
    mutationFn: (transactionId: string) => undoReconciliation(transactionId),
    onSuccess: () => {
      // Invalidar queries después de deshacer conciliación
      queryClient.invalidateQueries({ queryKey: ['transactions-bank'] });
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
    },
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
