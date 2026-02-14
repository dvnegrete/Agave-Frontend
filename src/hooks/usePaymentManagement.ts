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
  getPeriodChargesSummary,
  batchUpdatePeriodCharges,
  reprocessAllocations,
  setInitialBalance,
  condonePenalty,
  adjustCharge,
  reverseCharge,
} from '@services/paymentManagementService';
import type {
  CreatePeriodDto,
  CreatePeriodConfigDto,
  PeriodResponseDto,
  PaymentHistoryResponseDTO,
  HouseBalanceDTO,
  EnrichedHouseBalance,
  BackfillAllocationsResponse,
  PeriodChargeSummary,
  BatchUpdatePeriodChargesRequest,
  BatchUpdateResult,
  ReprocessResult,
  InitialBalanceRequest,
  InitialBalanceResponse,
  CondonePenaltyResponse,
  AdjustChargeRequest,
  AdjustChargeResponse,
  ReverseChargeResponse,
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
  periodCharges: () => [...paymentManagementKeys.all, 'period-charges'] as const,
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

// --- Period Charges Editor hooks ---

interface UsePeriodChargesQueryReturn {
  charges: PeriodChargeSummary[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener resumen de cargos por período
 */
export const usePeriodChargesQuery = (): UsePeriodChargesQueryReturn => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: paymentManagementKeys.periodCharges(),
    queryFn: async ({ signal }) => getPeriodChargesSummary(signal),
    staleTime: 5 * 60 * 1000,
  });

  return {
    charges: data || [],
    isLoading,
    error: error?.message || null,
    refetch: async () => {
      await refetch();
    },
  };
};

interface UseBatchUpdateChargesMutationReturn {
  batchUpdate: (data: BatchUpdatePeriodChargesRequest) => Promise<BatchUpdateResult>;
  isPending: boolean;
  data: BatchUpdateResult | null;
  error: string | null;
}

/**
 * Hook para actualizar cargos en batch
 */
export const useBatchUpdateChargesMutation = (): UseBatchUpdateChargesMutationReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: BatchUpdatePeriodChargesRequest) => batchUpdatePeriodCharges(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentManagementKeys.periodCharges(),
      });
      queryClient.invalidateQueries({
        queryKey: paymentManagementKeys.periods(),
      });
      queryClient.invalidateQueries({
        queryKey: paymentManagementKeys.balances(),
      });
    },
  });

  return {
    batchUpdate: mutation.mutateAsync,
    isPending: mutation.isPending,
    data: mutation.data || null,
    error: mutation.error?.message || null,
  };
};

interface UseReprocessAllocationsMutationReturn {
  reprocess: () => Promise<ReprocessResult>;
  isPending: boolean;
  data: ReprocessResult | null;
  error: string | null;
}

/**
 * Hook para reprocesar todas las asignaciones
 */
export const useReprocessAllocationsMutation = (): UseReprocessAllocationsMutationReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => reprocessAllocations(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentManagementKeys.all,
      });
    },
  });

  return {
    reprocess: mutation.mutateAsync,
    isPending: mutation.isPending,
    data: mutation.data || null,
    error: mutation.error?.message || null,
  };
};

// ──────────────────────────────────────────────
// ADMIN: Hooks para operaciones de ajuste y crédito inicial
// ──────────────────────────────────────────────

interface UseInitialBalanceMutationReturn {
  setBalance: (houseId: number, data: InitialBalanceRequest) => Promise<InitialBalanceResponse>;
  isPending: boolean;
  data: InitialBalanceResponse | null;
  error: string | null;
}

/**
 * Hook para asignar crédito/saldo inicial a una casa
 */
export const useInitialBalanceMutation = (): UseInitialBalanceMutationReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ houseId, data }: { houseId: number; data: InitialBalanceRequest }) =>
      setInitialBalance(houseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: paymentManagementKeys.houseBalance(variables.houseId),
      });
      queryClient.invalidateQueries({
        queryKey: paymentManagementKeys.houseStatus(variables.houseId),
      });
      queryClient.invalidateQueries({
        queryKey: paymentManagementKeys.paymentHistory(variables.houseId),
      });
    },
  });

  return {
    setBalance: (houseId, data) => mutation.mutateAsync({ houseId, data }),
    isPending: mutation.isPending,
    data: mutation.data || null,
    error: mutation.error?.message || null,
  };
};

interface UseCondonePenaltyMutationReturn {
  condone: (houseId: number, periodId: number) => Promise<CondonePenaltyResponse>;
  isPending: boolean;
  data: CondonePenaltyResponse | null;
  error: string | null;
}

/**
 * Hook para condonar penalidad
 */
export const useCondonePenaltyMutation = (): UseCondonePenaltyMutationReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ houseId, periodId }: { houseId: number; periodId: number }) =>
      condonePenalty(houseId, periodId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: paymentManagementKeys.houseStatus(variables.houseId),
      });
      queryClient.invalidateQueries({
        queryKey: paymentManagementKeys.periodCharges(),
      });
    },
  });

  return {
    condone: (houseId, periodId) => mutation.mutateAsync({ houseId, periodId }),
    isPending: mutation.isPending,
    data: mutation.data || null,
    error: mutation.error?.message || null,
  };
};

interface UseAdjustChargeMutationReturn {
  adjust: (chargeId: number, data: AdjustChargeRequest) => Promise<AdjustChargeResponse>;
  isPending: boolean;
  data: AdjustChargeResponse | null;
  error: string | null;
}

/**
 * Hook para ajustar monto de un cargo
 */
export const useAdjustChargeMutation = (): UseAdjustChargeMutationReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ chargeId, data }: { chargeId: number; data: AdjustChargeRequest }) =>
      adjustCharge(chargeId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: paymentManagementKeys.houseStatus(response.houseId),
      });
      queryClient.invalidateQueries({
        queryKey: paymentManagementKeys.periodCharges(),
      });
    },
  });

  return {
    adjust: (chargeId, data) => mutation.mutateAsync({ chargeId, data }),
    isPending: mutation.isPending,
    data: mutation.data || null,
    error: mutation.error?.message || null,
  };
};

interface UseReverseChargeMutationReturn {
  reverse: (chargeId: number) => Promise<ReverseChargeResponse>;
  isPending: boolean;
  data: ReverseChargeResponse | null;
  error: string | null;
}

/**
 * Hook para reversar un cargo
 */
export const useReverseChargeMutation = (): UseReverseChargeMutationReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (chargeId: number) => reverseCharge(chargeId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: paymentManagementKeys.houseStatus(response.houseId),
      });
      queryClient.invalidateQueries({
        queryKey: paymentManagementKeys.periodCharges(),
      });
    },
  });

  return {
    reverse: mutation.mutateAsync,
    isPending: mutation.isPending,
    data: mutation.data || null,
    error: mutation.error?.message || null,
  };
};
