import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  type BankTransaction,
  type TransactionsBankQuery,
  type UploadTransactionsResponse,
} from '@shared/types/bank-transactions.types'
import {
  getTransactionsBank,
  uploadTransactionsBank,
  deleteTransactionBank,
} from '@services/transactionBankService';

// Query Keys
export const transactionBankKeys = {
  all: ['transactions-bank'] as const,
  lists: () => [...transactionBankKeys.all, 'list'] as const,
  list: (filters: TransactionsBankQuery) =>
    [...transactionBankKeys.lists(), filters] as const,
  details: () => [...transactionBankKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionBankKeys.details(), id] as const,
};

interface UseTransactionsBankQueryReturn {
  transactions: BankTransaction[];
  total: number;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  setFilters: (filters: Partial<TransactionsBankQuery>) => void;
  refetch: () => Promise<void>;
}

interface UseTransactionBankMutationsReturn {
  upload: (payload: { file: File; bankName: string }) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
  isLoading: boolean;
  uploadError: string | null;
  deleteError: string | null;
  uploadResult: UploadTransactionsResponse | null;
  resetUpload: () => void;
}

/**
 * Hook para obtener lista de transacciones bancarias con filtros opcionales
 */
export const useTransactionsBankQuery = (
  initialQuery?: TransactionsBankQuery
): UseTransactionsBankQueryReturn => {
  const [query, setQuery] = useState<TransactionsBankQuery>(
    initialQuery || {}
  );

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: transactionBankKeys.list(query),
    queryFn: async ({ signal }) => {
      const response = await getTransactionsBank(query, signal);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const setFilters = (filters: Partial<TransactionsBankQuery>) => {
    setQuery((prev) => ({ ...prev, ...filters }));
  };

  // Manejar tanto array directo como objeto con transactions
  const transactions = Array.isArray(data)
    ? data
    : data?.transactions || [];
  const total = Array.isArray(data) ? data.length : data?.total || 0;

  return {
    transactions,
    total,
    isLoading,
    isFetching,
    error: error?.message || null,
    setFilters,
    refetch: async () => {
      await refetch();
    },
  };
};

/**
 * Hook para mutaciones de transacciones bancarias
 */
export const useTransactionBankMutations = (): UseTransactionBankMutationsReturn => {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: ({ file, bankName }: { file: File; bankName: string }) =>
      uploadTransactionsBank(file, bankName),
    onSuccess: () => {
      // Invalidar todas las queries de listas de transacciones
      queryClient.invalidateQueries({ queryKey: transactionBankKeys.lists() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTransactionBank(id),
    onSuccess: () => {
      // Invalidar todas las queries de transacciones
      queryClient.invalidateQueries({ queryKey: transactionBankKeys.all });
    },
  });

  return {
    upload: uploadMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isLoading: uploadMutation.isPending || deleteMutation.isPending,
    uploadError: uploadMutation.error?.message || null,
    deleteError: deleteMutation.error?.message || null,
    uploadResult: uploadMutation.data || null,
    resetUpload: () => uploadMutation.reset(),
  };
};
