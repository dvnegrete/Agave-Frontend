import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPeriodChargesSummary,
  batchUpdatePeriodCharges,
  reprocessAllocations,
  backfillAllocations,
} from '@services/paymentManagementService';
import type {
  PeriodChargeSummary,
  BatchUpdatePeriodChargesRequest,
  BatchUpdateResult,
  ReprocessResult,
  BackfillAllocationsResponse,
} from '@shared';
import { paymentManagementKeys } from './keys';

interface UsePeriodChargesQueryReturn {
  charges: PeriodChargeSummary[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseBatchUpdateChargesMutationReturn {
  batchUpdate: (data: BatchUpdatePeriodChargesRequest) => Promise<BatchUpdateResult>;
  isPending: boolean;
  data: BatchUpdateResult | null;
  error: string | null;
}

interface UseReprocessAllocationsMutationReturn {
  reprocess: () => Promise<ReprocessResult>;
  isPending: boolean;
  data: ReprocessResult | null;
  error: string | null;
}

interface UseBackfillAllocationsMutationReturn {
  backfill: (houseNumber?: number) => Promise<BackfillAllocationsResponse>;
  isPending: boolean;
  error: string | null;
  data: BackfillAllocationsResponse | null;
}

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
    refetch: async () => { await refetch(); },
  };
};

export const useBatchUpdateChargesMutation = (): UseBatchUpdateChargesMutationReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: BatchUpdatePeriodChargesRequest) => batchUpdatePeriodCharges(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentManagementKeys.periodCharges() });
      queryClient.invalidateQueries({ queryKey: paymentManagementKeys.periods() });
      queryClient.invalidateQueries({ queryKey: paymentManagementKeys.balances() });
    },
  });

  return {
    batchUpdate: mutation.mutateAsync,
    isPending: mutation.isPending,
    data: mutation.data || null,
    error: mutation.error?.message || null,
  };
};

export const useReprocessAllocationsMutation = (): UseReprocessAllocationsMutationReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => reprocessAllocations(),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: paymentManagementKeys.all }); },
  });

  return {
    reprocess: mutation.mutateAsync,
    isPending: mutation.isPending,
    data: mutation.data || null,
    error: mutation.error?.message || null,
  };
};

export const useBackfillAllocationsMutation = (): UseBackfillAllocationsMutationReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (houseNumber?: number) => backfillAllocations(houseNumber),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: paymentManagementKeys.balances() }); },
  });

  return {
    backfill: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error?.message || null,
    data: mutation.data || null,
  };
};
