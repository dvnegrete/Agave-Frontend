import { useQuery } from '@tanstack/react-query';
import {
  getPaymentHistory,
  getPaymentsByPeriod,
  getHouseBalance,
  getHouseStatus,
} from '@services/paymentManagementService';
import type {
  PaymentHistoryResponseDTO,
  HouseBalanceDTO,
  EnrichedHouseBalance,
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
