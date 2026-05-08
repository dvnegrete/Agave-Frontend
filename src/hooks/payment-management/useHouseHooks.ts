import { useQuery } from '@tanstack/react-query';
import {
  getPaymentHistory,
  getPaymentsByPeriod,
  getHouseBalance,
  getHouseStatus,
  getHousesSummary,
  getPeriodTransactions,
} from '@services/paymentManagementService';
import type {
  PaymentHistoryResponseDTO,
  HouseBalanceDTO,
  EnrichedHouseBalance,
  HousesSummaryResponse,
  PeriodTransaction,
} from '@shared';
import { paymentManagementKeys } from './keys';

interface UsePaymentHistoryQueryReturn {
  history: PaymentHistoryResponseDTO | null;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UsePaymentsByPeriodQueryReturn {
  payments: PaymentHistoryResponseDTO | null;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseHouseBalanceQueryReturn {
  balance: HouseBalanceDTO | null;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseHouseStatusQueryReturn {
  houseStatus: EnrichedHouseBalance | null;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseHousesSummaryQueryReturn {
  summary: HousesSummaryResponse | null;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UsePeriodTransactionsQueryReturn {
  transactions: PeriodTransaction[] | null;
  totalAllocated: number;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
}

export const usePaymentHistoryQuery = (houseId: number | null): UsePaymentHistoryQueryReturn => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: houseId ? paymentManagementKeys.paymentHistory(houseId) : ['payment-management-disabled'],
    queryFn: async ({ signal }) => {
      if (!houseId) return null;
      return await getPaymentHistory(houseId, signal);
    },
    enabled: !!houseId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    history: data || null,
    isLoading,
    isFetching,
    error: error?.message || null,
    refetch: async () => { await refetch(); },
  };
};

export const usePaymentsByPeriodQuery = (
  houseId: number | null,
  periodId: number | null
): UsePaymentsByPeriodQueryReturn => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: houseId && periodId
      ? paymentManagementKeys.paymentsByPeriod(houseId, periodId)
      : ['payment-management-disabled'],
    queryFn: async ({ signal }) => {
      if (!houseId || !periodId) return null;
      return await getPaymentsByPeriod(houseId, periodId, signal);
    },
    enabled: !!houseId && !!periodId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    payments: data || null,
    isLoading,
    isFetching,
    error: error?.message || null,
    refetch: async () => { await refetch(); },
  };
};

export const useHouseBalanceQuery = (houseId: number | null): UseHouseBalanceQueryReturn => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: houseId ? paymentManagementKeys.houseBalance(houseId) : ['house-balance-disabled'],
    queryFn: async ({ signal }) => {
      if (!houseId) return null;
      return await getHouseBalance(houseId, signal);
    },
    enabled: !!houseId,
    staleTime: 3 * 60 * 1000,
  });

  return {
    balance: data || null,
    isLoading,
    isFetching,
    error: error?.message || null,
    refetch: async () => { await refetch(); },
  };
};

export const useHouseStatusQuery = (houseId: number | null): UseHouseStatusQueryReturn => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: houseId ? paymentManagementKeys.houseStatus(houseId) : ['house-status-disabled'],
    queryFn: async ({ signal }) => {
      if (!houseId) return null;
      return await getHouseStatus(houseId, signal);
    },
    enabled: !!houseId,
    staleTime: 3 * 60 * 1000,
  });

  return {
    houseStatus: data || null,
    isLoading,
    isFetching,
    error: error?.message || null,
    refetch: async () => { await refetch(); },
  };
};

export const usePeriodTransactionsQuery = (
  houseId: number | null,
  periodId: number | null,
  enabled = true,
): UsePeriodTransactionsQueryReturn => {
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: houseId && periodId
      ? paymentManagementKeys.periodTransactions(houseId, periodId)
      : ['period-transactions-disabled'],
    queryFn: async ({ signal }) => {
      if (!houseId || !periodId) return null;
      return await getPeriodTransactions(houseId, periodId, signal);
    },
    enabled: !!houseId && !!periodId && enabled,
    staleTime: 3 * 60 * 1000,
  });

  return {
    transactions: data?.transactions ?? null,
    totalAllocated: data?.total_allocated ?? 0,
    isLoading,
    isFetching,
    error: error?.message || null,
  };
};

export const useHousesSummaryQuery = (): UseHousesSummaryQueryReturn => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: paymentManagementKeys.housesSummary(),
    queryFn: async ({ signal }) => getHousesSummary(signal),
    staleTime: 3 * 60 * 1000,
  });

  return {
    summary: data ?? null,
    isLoading,
    isFetching,
    error: error?.message || null,
    refetch: async () => { await refetch(); },
  };
};
