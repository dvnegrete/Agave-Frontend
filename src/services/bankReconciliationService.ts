import { httpClient } from '@utils/httpClient';
import { API_ENDPOINTS } from '@config/api';
import type {
  StartReconciliationRequest,
  StartReconciliationResponse,
  ReconcileRequest,
  ReconcileResponse,
  BulkReconcileRequest,
  BulkReconcileResponse,
  ManualValidationQueryParams,
  PaginatedResponse,
  ManualValidationPendingItem,
  ApproveManualValidationRequest,
  ApproveManualValidationResponse,
  RejectManualValidationRequest,
  RejectManualValidationResponse,
  ManualValidationStatsResponse,
  UnclaimedDepositsQueryParams,
  UnclaimedDepositsItem,
  AssignHouseToDepositRequest,
  AssignHouseToDepositResponse,
  UnfundedVouchersQueryParams,
  UnfundedVouchersItem,
  MatchVoucherWithDepositRequest,
  MatchVoucherWithDepositResponse,
  MatchSuggestionsResponse,
  ApplyMatchSuggestionRequest,
  ApplyMatchSuggestionResponse,
  ApplyBatchRequest,
  ApplyBatchResponse,
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
      `${API_ENDPOINTS.bankReconciliation}/reconcile`,
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
      `${API_ENDPOINTS.bankReconciliation}/reconcile`,
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

// ============ Manual Validation Endpoints ============

/**
 * Get pending manual validation cases with pagination
 */
export const getManualValidationPending = async (
  params: ManualValidationQueryParams = {},
  signal?: AbortSignal
): Promise<PaginatedResponse<ManualValidationPendingItem>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.houseNumber) queryParams.append('houseNumber', params.houseNumber.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);

    const queryString = queryParams.toString();
    const url = `${API_ENDPOINTS.bankReconciliation}/manual-validation/pending${queryString ? `?${queryString}` : ''}`;

    return httpClient.get<PaginatedResponse<ManualValidationPendingItem>>(url, { signal });
  } catch (err: unknown) {
    console.error('Error in getManualValidationPending:', err);
    throw err;
  }
};

/**
 * Approve a manual validation case
 */
export const approveManualValidation = async (
  transactionId: string,
  data: ApproveManualValidationRequest,
  signal?: AbortSignal
): Promise<ApproveManualValidationResponse> => {
  try {
    return httpClient.post<ApproveManualValidationResponse>(
      `${API_ENDPOINTS.bankReconciliation}/manual-validation/${transactionId}/approve`,
      data,
      { signal }
    );
  } catch (err: unknown) {
    console.error('Error in approveManualValidation:', err);
    throw err;
  }
};

/**
 * Reject a manual validation case
 */
export const rejectManualValidation = async (
  transactionId: string,
  data: RejectManualValidationRequest,
  signal?: AbortSignal
): Promise<RejectManualValidationResponse> => {
  try {
    return httpClient.post<RejectManualValidationResponse>(
      `${API_ENDPOINTS.bankReconciliation}/manual-validation/${transactionId}/reject`,
      data,
      { signal }
    );
  } catch (err: unknown) {
    console.error('Error in rejectManualValidation:', err);
    throw err;
  }
};

/**
 * Get manual validation statistics
 */
export const getManualValidationStats = async (
  signal?: AbortSignal
): Promise<ManualValidationStatsResponse> => {
  try {
    return httpClient.get<ManualValidationStatsResponse>(
      `${API_ENDPOINTS.bankReconciliation}/manual-validation/stats`,
      { signal }
    );
  } catch (err: unknown) {
    console.error('Error in getManualValidationStats:', err);
    throw err;
  }
};

// ============ Unclaimed Deposits Endpoints ============

/**
 * Get unclaimed deposits with pagination
 */
export const getUnclaimedDeposits = async (
  params: UnclaimedDepositsQueryParams = {},
  signal?: AbortSignal
): Promise<PaginatedResponse<UnclaimedDepositsItem>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.validationStatus) queryParams.append('validationStatus', params.validationStatus);
    if (params.houseNumber) queryParams.append('houseNumber', params.houseNumber.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);

    const queryString = queryParams.toString();
    const url = `${API_ENDPOINTS.bankReconciliation}/unclaimed-deposits${queryString ? `?${queryString}` : ''}`;

    return httpClient.get<PaginatedResponse<UnclaimedDepositsItem>>(url, { signal });
  } catch (err: unknown) {
    console.error('Error in getUnclaimedDeposits:', err);
    throw err;
  }
};

/**
 * Assign house to an unclaimed deposit
 */
export const assignHouseToDeposit = async (
  transactionId: string,
  data: AssignHouseToDepositRequest,
  signal?: AbortSignal
): Promise<AssignHouseToDepositResponse> => {
  try {
    return httpClient.post<AssignHouseToDepositResponse>(
      `${API_ENDPOINTS.bankReconciliation}/unclaimed-deposits/${transactionId}/assign-house`,
      data,
      { signal }
    );
  } catch (err: unknown) {
    console.error('Error in assignHouseToDeposit:', err);
    throw err;
  }
};

// ============ Unfunded Vouchers Endpoints ============

/**
 * Get unfunded vouchers with pagination
 */
export const getUnfundedVouchers = async (
  params: UnfundedVouchersQueryParams = {},
  signal?: AbortSignal
): Promise<PaginatedResponse<UnfundedVouchersItem>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);

    const queryString = queryParams.toString();
    const url = `${API_ENDPOINTS.bankReconciliation}/unfunded-vouchers${queryString ? `?${queryString}` : ''}`;

    return httpClient.get<PaginatedResponse<UnfundedVouchersItem>>(url, { signal });
  } catch (err: unknown) {
    console.error('Error in getUnfundedVouchers:', err);
    throw err;
  }
};

/**
 * Match an unfunded voucher with a bank deposit
 */
export const matchVoucherWithDeposit = async (
  voucherId: number,
  data: MatchVoucherWithDepositRequest,
  signal?: AbortSignal
): Promise<MatchVoucherWithDepositResponse> => {
  try {
    return httpClient.post<MatchVoucherWithDepositResponse>(
      `${API_ENDPOINTS.bankReconciliation}/unfunded-vouchers/${voucherId}/match-deposit`,
      data,
      { signal }
    );
  } catch (err: unknown) {
    console.error('Error in matchVoucherWithDeposit:', err);
    throw err;
  }
};

// ============ Match Suggestions (Cross-Matching) Endpoints ============

/**
 * Get cross-matching suggestions between unclaimed deposits and unfunded vouchers
 */
export const getMatchSuggestions = async (
  signal?: AbortSignal
): Promise<MatchSuggestionsResponse> => {
  try {
    return httpClient.get<MatchSuggestionsResponse>(
      `${API_ENDPOINTS.bankReconciliation}/match-suggestions`,
      { signal }
    );
  } catch (err: unknown) {
    console.error('Error in getMatchSuggestions:', err);
    throw err;
  }
};

/**
 * Apply a single cross-matching suggestion
 */
export const applyMatchSuggestion = async (
  data: ApplyMatchSuggestionRequest,
  signal?: AbortSignal
): Promise<ApplyMatchSuggestionResponse> => {
  try {
    return httpClient.post<ApplyMatchSuggestionResponse>(
      `${API_ENDPOINTS.bankReconciliation}/match-suggestions/apply`,
      data,
      { signal }
    );
  } catch (err: unknown) {
    console.error('Error in applyMatchSuggestion:', err);
    throw err;
  }
};

/**
 * Apply multiple cross-matching suggestions in batch
 */
export const applyBatchMatchSuggestions = async (
  data: ApplyBatchRequest,
  signal?: AbortSignal
): Promise<ApplyBatchResponse> => {
  try {
    return httpClient.post<ApplyBatchResponse>(
      `${API_ENDPOINTS.bankReconciliation}/match-suggestions/apply-batch`,
      data,
      { signal }
    );
  } catch (err: unknown) {
    console.error('Error in applyBatchMatchSuggestions:', err);
    throw err;
  }
};
