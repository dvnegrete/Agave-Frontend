import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPeriods,
  createPeriod,
  ensurePeriod,
  createPeriodConfig,
  getPaymentHistory,
  getPaymentsByPeriod,
  getHouseBalance,
  getHouseStatus,
  backfillAllocations,
} from '@services/paymentManagementService';
import type {
  CreatePeriodDto,
  CreatePeriodConfigDto,
  PeriodResponseDto,
  PaymentHistoryResponseDTO,
  HouseBalanceDTO,
  EnrichedHouseBalance,
  BackfillAllocationsResponse,
} from '@shared';

// Query Keys
export const paymentManagementKeys = {
  all: ['payment-management'] as const,
  periods: () => [...paymentManagementKeys.all, 'periods'] as const,
  period: (id: number) => [...paymentManagementKeys.periods(), id] as const,
  configs: () => [...paymentManagementKeys.all, 'configs'] as const,
  config: (id: number) => [...paymentManagementKeys.configs(), id] as const,
  payments: () => [...paymentManagementKeys.all, 'payments'] as const,
  paymentHistory: (houseId: number) =>
    [...paymentManagementKeys.payments(), 'history', houseId] as const,
  paymentsByPeriod: (houseId: number, periodId: number) =>
    [...paymentManagementKeys.payments(), 'history', houseId, periodId] as const,
  balances: () => [...paymentManagementKeys.all, 'balances'] as const,
  houseBalance: (houseId: number) =>
    [...paymentManagementKeys.balances(), houseId] as const,
  houseStatus: (houseId: number) =>
    [...paymentManagementKeys.balances(), 'status', houseId] as const,
};

interface UsePeriodsQueryReturn {
  periods: PeriodResponseDto[];
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UsePeriodMutationsReturn {
  createPeriod: (data: CreatePeriodDto) => Promise<unknown>;
  ensurePeriod: (data: CreatePeriodDto) => Promise<unknown>;
  isLoading: boolean;
  error: string | null;
}

interface UsePeriodConfigMutationsReturn {
  createConfig: (data: CreatePeriodConfigDto) => Promise<unknown>;
  isLoading: boolean;
  error: string | null;
}

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

/**
 * Hook para obtener todos los períodos de facturación
 */
export const usePeriodsQuery = (): UsePeriodsQueryReturn => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: paymentManagementKeys.periods(),
    queryFn: async ({ signal }) => {
      const response = await getPeriods(signal);
      return Array.isArray(response) ? response : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const periods = Array.isArray(data) ? data : [];

  return {
    periods,
    isLoading,
    isFetching,
    error: error?.message || null,
    refetch: async () => {
      await refetch();
    },
  };
};

/**
 * Hook para mutations de período (crear, ensure)
 */
export const usePeriodMutations = (): UsePeriodMutationsReturn => {
  const queryClient = useQueryClient();

  const createPeriodMutation = useMutation({
    mutationFn: (data: CreatePeriodDto) => createPeriod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentManagementKeys.periods(),
      });
    },
  });

  const ensurePeriodMutation = useMutation({
    mutationFn: (data: CreatePeriodDto) => ensurePeriod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentManagementKeys.periods(),
      });
    },
  });

  return {
    createPeriod: createPeriodMutation.mutateAsync,
    ensurePeriod: ensurePeriodMutation.mutateAsync,
    isLoading: createPeriodMutation.isPending || ensurePeriodMutation.isPending,
    error:
      createPeriodMutation.error?.message ||
      ensurePeriodMutation.error?.message ||
      null,
  };
};

/**
 * Hook para mutations de configuración de período
 */
export const usePeriodConfigMutations = (): UsePeriodConfigMutationsReturn => {
  const queryClient = useQueryClient();

  const createConfigMutation = useMutation({
    mutationFn: (data: CreatePeriodConfigDto) => createPeriodConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentManagementKeys.configs(),
      });
    },
  });

  return {
    createConfig: createConfigMutation.mutateAsync,
    isLoading: createConfigMutation.isPending,
    error: createConfigMutation.error?.message || null,
  };
};

/**
 * Hook para obtener historial de pagos de una casa
 */
export const usePaymentHistoryQuery = (houseId: number | null): UsePaymentHistoryQueryReturn => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: houseId
      ? paymentManagementKeys.paymentHistory(houseId)
      : ['payment-management-disabled'],
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
    refetch: async () => {
      await refetch();
    },
  };
};

/**
 * Hook para obtener pagos de una casa en período específico
 */
export const usePaymentsByPeriodQuery = (
  houseId: number | null,
  periodId: number | null
): UsePaymentsByPeriodQueryReturn => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey:
      houseId && periodId
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
    refetch: async () => {
      await refetch();
    },
  };
};

/**
 * Hook para obtener saldo de una casa
 */
export const useHouseBalanceQuery = (houseId: number | null): UseHouseBalanceQueryReturn => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: houseId
      ? paymentManagementKeys.houseBalance(houseId)
      : ['house-balance-disabled'],
    queryFn: async ({ signal }) => {
      if (!houseId) return null;
      return await getHouseBalance(houseId, signal);
    },
    enabled: !!houseId,
    staleTime: 3 * 60 * 1000, // 3 minutes - balance can change more frequently
  });

  return {
    balance: data || null,
    isLoading,
    isFetching,
    error: error?.message || null,
    refetch: async () => {
      await refetch();
    },
  };
};

/**
 * Hook para obtener estado enriquecido de una casa (desglose por períodos, conceptos, penalidades)
 */
export const useHouseStatusQuery = (houseId: number | null): UseHouseStatusQueryReturn => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: houseId
      ? paymentManagementKeys.houseStatus(houseId)
      : ['house-status-disabled'],
    queryFn: async ({ signal }) => {
      if (!houseId) return null;
      return await getHouseStatus(houseId, signal);
    },
    enabled: !!houseId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });

  return {
    houseStatus: data || null,
    isLoading,
    isFetching,
    error: error?.message || null,
    refetch: async () => {
      await refetch();
    },
  };
};

interface UseBackfillAllocationsMutationReturn {
  backfill: (houseNumber?: number) => Promise<BackfillAllocationsResponse>;
  isPending: boolean;
  error: string | null;
  data: BackfillAllocationsResponse | null;
}

/**
 * Hook para realizar backfill de asignaciones de pagos
 */
export const useBackfillAllocationsMutation = (): UseBackfillAllocationsMutationReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (houseNumber?: number) => backfillAllocations(houseNumber),
    onSuccess: () => {
      // Invalidar balances y status de todas las casas
      queryClient.invalidateQueries({
        queryKey: paymentManagementKeys.balances(),
      });
    },
  });

  return {
    backfill: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error?.message || null,
    data: mutation.data || null,
  };
};
