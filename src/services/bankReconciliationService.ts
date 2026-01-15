import { httpClient } from '@utils/httpClient';
import { API_ENDPOINTS } from '@config/api';
import type {
  StartReconciliationRequest,
  StartReconciliationResponse,
  ReconcileRequest,
  ReconcileResponse,
  BulkReconcileRequest,
  BulkReconcileResponse,
} from '@shared/types/bank-reconciliation.types';

/**
 * Start reconciliation process with optional date filters
 */
export const startReconciliation = async (
  data?: StartReconciliationRequest,
  signal?: AbortSignal
): Promise<StartReconciliationResponse> => {
  try {
    const response = await httpClient.post<StartReconciliationResponse>(
      API_ENDPOINTS.bankReconciliation,
      data || {},
      { signal }
    );

    return response;
  } catch (err: unknown) {
    console.error('Error in startReconciliation:', err);
    throw err;
  }
};

/**
 * Reconcile a single bank transaction with a voucher
 */
export const reconcileTransaction = async (
  data: ReconcileRequest,
  signal?: AbortSignal
): Promise<ReconcileResponse> => {
  try {
    return httpClient.post<ReconcileResponse>(
      API_ENDPOINTS.bankReconciliation,
      data,
      { signal }
    );
  } catch (err: unknown) {
    console.error('Error in reconcileTransaction:', err);
    throw err;
  }
};

/**
 * Bulk reconcile multiple transactions with their vouchers
 */
export const bulkReconcile = async (
  data: BulkReconcileRequest,
  signal?: AbortSignal
): Promise<BulkReconcileResponse> => {
  try {
    return httpClient.post<BulkReconcileResponse>(
      `${API_ENDPOINTS.bankReconciliation}/bulk`,
      data,
      { signal }
    );
  } catch (err: unknown) {
    console.error('Error in bulkReconcile:', err);
    throw err;
  }
};

/**
 * Undo a reconciliation
 */
export const undoReconciliation = async (
  transactionId: string,
  signal?: AbortSignal
): Promise<ReconcileResponse> => {
  try {
    return httpClient.post<ReconcileResponse>(
      `${API_ENDPOINTS.bankReconciliation}/undo`,
      { transactionId },
      { signal }
    );
  } catch (err: unknown) {
    console.error('Error in undoReconciliation:', err);
    throw err;
  }
};
