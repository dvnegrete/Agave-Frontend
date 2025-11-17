import { httpClient } from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api';
import type {
  BankTransaction,
  TransactionsBankQuery,
  TransactionsBankResponse,
  UploadTransactionsResponse,
  ApiResponse,
} from '../types/api.types';

/**
 * Get all bank transactions with optional filters
 */
export const getTransactionsBank = async (
  query?: TransactionsBankQuery,
  signal?: AbortSignal
): Promise<TransactionsBankResponse> => {
  const params = new URLSearchParams();

  if (query?.page) params.append('page', query.page.toString());
  if (query?.limit) params.append('limit', query.limit.toString());
  if (query?.reconciled !== undefined)
    params.append('reconciled', query.reconciled.toString());
  if (query?.startDate) params.append('startDate', query.startDate);
  if (query?.endDate) params.append('endDate', query.endDate);

  const queryString = params.toString();
  const endpoint = queryString
    ? `${API_ENDPOINTS.transactionsBank}?${queryString}`
    : API_ENDPOINTS.transactionsBank;

  return httpClient.get<TransactionsBankResponse>(endpoint, { signal });
};

/**
 * Upload bank transactions file (CSV, Excel, etc.)
 */
export const uploadTransactionsBank = async (
  file: File,
  bank: string,
  signal?: AbortSignal
): Promise<UploadTransactionsResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const endpoint = `${API_ENDPOINTS.transactionsBankUpload}?bank=${encodeURIComponent(bank)}`;

  return httpClient.post<UploadTransactionsResponse>(
    endpoint,
    formData,
    { signal }
  );
};

/**
 * Get a single bank transaction by ID
 */
export const getTransactionBankById = async (
  id: string,
  signal?: AbortSignal
): Promise<BankTransaction> => {
  return httpClient.get<BankTransaction>(
    `${API_ENDPOINTS.transactionsBank}/${id}`,
    { signal }
  );
};

/**
 * Delete a bank transaction
 */
export const deleteTransactionBank = async (
  id: string,
  signal?: AbortSignal
): Promise<ApiResponse<void>> => {
  return httpClient.delete<ApiResponse<void>>(
    `${API_ENDPOINTS.transactionsBank}/${id}`,
    { signal }
  );
};
