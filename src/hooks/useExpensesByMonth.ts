import { useQuery } from '@tanstack/react-query';
import type { ExpensesByMonthResponse } from '@shared/types/bank-transactions.types';
import { getExpensesByMonth } from '@services/transactionBankService';

interface UseExpensesByMonthReturn {
  data: ExpensesByMonthResponse | undefined;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useExpensesByMonth = (date: Date | string): UseExpensesByMonthReturn => {
  const dateString = typeof date === 'string' ? date : date.toISOString().split('T')[0];

  const {
    data,
    isLoading: loading,
    error: queryError,
    refetch: refetchQuery,
  } = useQuery<ExpensesByMonthResponse>({
    queryKey: ['expenses-by-month', dateString],
    queryFn: async ({ signal }) => {
      return getExpensesByMonth(dateString, signal);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const error = queryError instanceof Error ? queryError.message : null;

  const refetch = async (): Promise<void> => {
    await refetchQuery();
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
};
