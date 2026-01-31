import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import type {
  BankTransaction,
  TransactionsBankQuery,
  TransactionsBankResponse,
  UploadTransactionsResponse,
} from '@shared/types/bank-transactions.types';
import {
  getTransactionsBank,
  uploadTransactionsBank,
} from '@services/transactionBankService';

interface UseTransactionsBankReturn {
  transactions: BankTransaction[];
  loading: boolean;
  error: string | null;
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
  // Generar una clave estable para la query
  const queryKey = [
    'transactions-bank',
    {
      startDate: query?.startDate,
      endDate: query?.endDate,
    },
  ];

  // Usar React Query para manejar la fetching, caché y actualizaciones
  const {
    data,
    isLoading: loading,
    error: queryError,
    refetch: refetchQuery,
  } = useQuery<TransactionsBankResponse>({
    queryKey,
    queryFn: async ({ signal }) => {
      // Solo fetch si query tiene filtros válidos
      if (!query?.startDate || !query?.endDate) {
        return {
          transactions: [],
          total: 0,
        };
      }

      return getTransactionsBank(
        {
          startDate: query.startDate,
          endDate: query.endDate,
        },
        signal
      );
    },
    // Solo ejecutar la query si tenemos filtros válidos
    enabled: !!(query?.startDate && query?.endDate),
    // Mantener datos en caché por 5 minutos
    staleTime: 5 * 60 * 1000,
    // No recargar automáticamente en cambios de tab
    refetchOnWindowFocus: false,
  });

  const error = queryError instanceof Error ? queryError.message : null;
  const transactions = data?.transactions || [];

  const refetch = async (): Promise<void> => {
    await refetchQuery();
  };

  return {
    transactions,
    loading,
    error,
    refetch,
  };
};

export const useUploadTransactions = (): UseUploadTransactionsReturn => {
  const [uploadResult, setUploadResult] = useState<UploadTransactionsResponse | null>(null);

  // Usar React Query mutation para manejar el upload
  const {
    mutateAsync: uploadMutation,
    isPending: uploading,
    error: mutationError,
    reset: resetMutation,
  } = useMutation<UploadTransactionsResponse, Error, { file: File; bankName: string }>({
    mutationFn: async ({ file, bankName }) => {
      const result = await uploadTransactionsBank(file, bankName);
      setUploadResult(result);
      return result;
    },
  });

  const upload = async (file: File, bankName: string = 'Santander-2025'): Promise<UploadTransactionsResponse | undefined> => {
    try {
      const result = await uploadMutation({ file, bankName });
      return result;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Error desconocido al cargar archivo');
    }
  };

  const reset = (): void => {
    setUploadResult(null);
    resetMutation();
  };

  const uploadError = mutationError instanceof Error ? mutationError.message : null;

  return {
    upload,
    uploading,
    uploadError,
    uploadResult,
    reset,
  };
};
