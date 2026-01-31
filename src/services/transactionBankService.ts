import { httpClient } from '@utils/httpClient';
import { API_ENDPOINTS } from '@config/api';
import type {
  BankTransaction,
  TransactionsBankQuery,
  TransactionsBankResponse,
  UploadTransactionsResponse,
  ExpensesByMonthResponse,
} from '@shared/types/bank-transactions.types';
import type {
  ApiResponse,
} from '@shared/types/common.types';

/**
 * Get all bank transactions with optional filters
 */
export const getTransactionsBank = async (
  query?: TransactionsBankQuery,
  signal?: AbortSignal
): Promise<TransactionsBankResponse> => {
  try {
    const params = new URLSearchParams();

    if (query?.reconciled !== undefined)
      params.append('reconciled', query.reconciled.toString());
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);

    const queryString = params.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.transactionsBank}?${queryString}`
      : API_ENDPOINTS.transactionsBank;

    return httpClient.get<TransactionsBankResponse>(endpoint, { signal });
  } catch (err: unknown) {
    console.error('❌ [Service] Error in getTransactionsBank:', err);
    throw err;
  }
};

/**
 * Upload bank transactions file (CSV, Excel, etc.)
 * @param file - El archivo a cargar
 * @param bankName - Nombre del banco (se envía como query parameter)
 */
export const uploadTransactionsBank = async (
  file: File,
  bankName: string,
  signal?: AbortSignal
): Promise<UploadTransactionsResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const endpoint = `${API_ENDPOINTS.transactionsBankUpload}?bankName=${encodeURIComponent(bankName)}`;

    return httpClient.post<UploadTransactionsResponse>(
      endpoint,
      formData,
      { signal }
    );
  } catch (err: unknown) {
    console.error('❌ [Service] Error in uploadTransactionsBank:', err);
    throw err;
  }
};

/**
 * Get a single bank transaction by ID
 */
export const getTransactionBankById = async (
  id: string,
  signal?: AbortSignal
): Promise<BankTransaction> => {
  try {
    return httpClient.get<BankTransaction>(
      `${API_ENDPOINTS.transactionsBank}/${id}`,
      { signal }
    );
  } catch (err: unknown) {
    console.error('❌ [Service] Error in getTransactionBankById:', err);
    throw err;
  }
};

/**
 * Delete a bank transaction
 */
export const deleteTransactionBank = async (
  id: string,
  signal?: AbortSignal
): Promise<ApiResponse<void>> => {
  try {
    return httpClient.delete<ApiResponse<void>>(
      `${API_ENDPOINTS.transactionsBank}/${id}`,
      { signal }
    );
  } catch (err: unknown) {
    console.error('❌ [Service] Error in deleteTransactionBank:', err);
    throw err;
  }
};

/**
 * Get expenses by month
 * @param date - Date string or Date object (month and year are used from this date)
 */
export const getExpensesByMonth = async (
  date: string | Date,
  signal?: AbortSignal
): Promise<ExpensesByMonthResponse> => {
  try {
    const dateString = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const endpoint = `${API_ENDPOINTS.transactionsBankExpenses}?date=${dateString}`;
    return httpClient.get<ExpensesByMonthResponse>(endpoint, { signal });
  } catch (err: unknown) {
    console.error('❌ [Service] Error in getExpensesByMonth:', err);
    throw err;
  }
};
