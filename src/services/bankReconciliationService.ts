import { httpClient } from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api';
import type {
  StartReconciliationRequest,
  StartReconciliationResponse,
  ReconcileRequest,
  ReconcileResponse,
  BulkReconcileRequest,
  BulkReconcileResponse,
} from '../shared';

/**
 * Start reconciliation process with optional date filters
 */
export const startReconciliation = async (
  data?: StartReconciliationRequest,
  signal?: AbortSignal
): Promise<StartReconciliationResponse> => {
  try {
    console.log('🚀 [Service] Iniciando conciliación con datos:', data || {});
    console.log('🌐 [Service] Endpoint:', API_ENDPOINTS.bankReconciliation);

    const response = await httpClient.post<StartReconciliationResponse>(
      API_ENDPOINTS.bankReconciliation,
      data || {},
      { signal }
    );

    console.log('📦 [Service] Respuesta recibida de la API:', response);

    return response;
  } catch (err: unknown) {
    console.error('❌ [Service] Error in startReconciliation:', err);
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
    console.error('❌ [Service] Error in reconcileTransaction:', err);
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
    console.error('❌ [Service] Error in bulkReconcile:', err);
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
    console.error('❌ [Service] Error in undoReconciliation:', err);
    throw err;
  }
};
