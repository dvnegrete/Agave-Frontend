import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPeriods,
  createPeriod,
  ensurePeriod,
  createPeriodConfig,
} from '@services/paymentManagementService';
import type {
  CreatePeriodDto,
  CreatePeriodConfigDto,
  PeriodResponseDto,
} from '@shared';
import { paymentManagementKeys } from './keys';

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

export const usePeriodsQuery = (): UsePeriodsQueryReturn => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: paymentManagementKeys.periods(),
    queryFn: async ({ signal }) => {
      const response = await getPeriods(signal);
      return Array.isArray(response) ? response : [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    periods: Array.isArray(data) ? data : [],
    isLoading,
    isFetching,
    error: error?.message || null,
    refetch: async () => { await refetch(); },
  };
};

export const usePeriodMutations = (): UsePeriodMutationsReturn => {
  const queryClient = useQueryClient();

  const createPeriodMutation = useMutation({
    mutationFn: (data: CreatePeriodDto) => createPeriod(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: paymentManagementKeys.periods() }); },
  });

  const ensurePeriodMutation = useMutation({
    mutationFn: (data: CreatePeriodDto) => ensurePeriod(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: paymentManagementKeys.periods() }); },
  });

  return {
    createPeriod: createPeriodMutation.mutateAsync,
    ensurePeriod: ensurePeriodMutation.mutateAsync,
    isLoading: createPeriodMutation.isPending || ensurePeriodMutation.isPending,
    error: createPeriodMutation.error?.message || ensurePeriodMutation.error?.message || null,
  };
};

export const usePeriodConfigMutations = (): UsePeriodConfigMutationsReturn => {
  const queryClient = useQueryClient();

  const createConfigMutation = useMutation({
    mutationFn: (data: CreatePeriodConfigDto) => createPeriodConfig(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: paymentManagementKeys.configs() }); },
  });

  return {
    createConfig: createConfigMutation.mutateAsync,
    isLoading: createConfigMutation.isPending,
    error: createConfigMutation.error?.message || null,
  };
};
