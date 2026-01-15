import { useState, useEffect } from 'react';
import {
  getTransactionsBank,
  uploadTransactionsBank,
  type BankTransaction,
  type TransactionsBankQuery,
  type UploadTransactionsResponse,
} from '../services';

interface UseTransactionsBankReturn {
  transactions: BankTransaction[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  refetch: () => Promise<void>;
}

interface UseUploadTransactionsReturn {
  upload: (file: File, bankName?: string) => Promise<UploadTransactionsResponse | undefined>;
  uploading: boolean;
  uploadError: string | null;
  uploadResult: UploadTransactionsResponse | null;
  reset: () => void;
}

export const useTransactionsBank = (query?: TransactionsBankQuery): UseTransactionsBankReturn => {
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(query?.page || 1);
  const [limit, setLimit] = useState(query?.limit || 10);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getTransactionsBank(
          { ...query, page, limit },
          abortController.signal
        );
        setTransactions(response.transactions);
        setTotal(response.total);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();

    return () => abortController.abort();
  }, [query?.reconciled, query?.startDate, query?.endDate, page, limit]);

  const refetch = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTransactionsBank({ ...query, page, limit });
      setTransactions(response.transactions);
      setTotal(response.total);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    transactions,
    loading,
    error,
    total,
    page,
    limit,
    setPage,
    setLimit,
    refetch,
  };
};

export const useUploadTransactions = (): UseUploadTransactionsReturn => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] =
    useState<UploadTransactionsResponse | null>(null);

  const upload = async (file: File, bankName: string = 'Santander-2025'): Promise<UploadTransactionsResponse | undefined> => {
    setUploading(true);
    setUploadError(null);
    setUploadResult(null);

    try {
      const result = await uploadTransactionsBank(file, bankName);
      setUploadResult(result);
      return result;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setUploadError(err.message);
        throw err;
      }
    } finally {
      setUploading(false);
    }
  };

  const reset = (): void => {
    setUploadError(null);
    setUploadResult(null);
  };

  return {
    upload,
    uploading,
    uploadError,
    uploadResult,
    reset,
  };
};
