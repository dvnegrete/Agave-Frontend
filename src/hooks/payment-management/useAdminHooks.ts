import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  setInitialBalance,
  condonePenalty,
  adjustCharge,
  reverseCharge,
  setInitialDebt,
} from '@services/paymentManagementService';
import type {
  InitialBalanceRequest,
  InitialBalanceResponse,
  CondonePenaltyResponse,
  AdjustChargeRequest,
  AdjustChargeResponse,
  ReverseChargeResponse,
  InitialDebtRequest,
  InitialDebtResponse,
} from '@shared';
import { paymentManagementKeys } from './keys';

interface UseInitialBalanceMutationReturn {
  setBalance: (houseId: number, data: InitialBalanceRequest) => Promise<InitialBalanceResponse>;
  isPending: boolean;
  data: InitialBalanceResponse | null;
  error: string | null;
}

interface UseCondonePenaltyMutationReturn {
  condone: (houseId: number, periodId: number) => Promise<CondonePenaltyResponse>;
  isPending: boolean;
  data: CondonePenaltyResponse | null;
  error: string | null;
}

interface UseAdjustChargeMutationReturn {
  adjust: (chargeId: number, data: AdjustChargeRequest) => Promise<AdjustChargeResponse>;
  isPending: boolean;
  data: AdjustChargeResponse | null;
  error: string | null;
}

interface UseReverseChargeMutationReturn {
  reverse: (chargeId: number) => Promise<ReverseChargeResponse>;
  isPending: boolean;
  data: ReverseChargeResponse | null;
  error: string | null;
}

interface UseInitialDebtMutationReturn {
  setDebt: (houseId: number, data: InitialDebtRequest) => Promise<InitialDebtResponse>;
  isPending: boolean;
  data: InitialDebtResponse | null;
  error: string | null;
}

export const useInitialBalanceMutation = (): UseInitialBalanceMutationReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ houseId, data }: { houseId: number; data: InitialBalanceRequest }) =>
      setInitialBalance(houseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: paymentManagementKeys.houseBalance(variables.houseId) });
      queryClient.invalidateQueries({ queryKey: paymentManagementKeys.houseStatus(variables.houseId) });
      queryClient.invalidateQueries({ queryKey: paymentManagementKeys.paymentHistory(variables.houseId) });
    },
  });

  return {
    setBalance: (houseId, data) => mutation.mutateAsync({ houseId, data }),
    isPending: mutation.isPending,
    data: mutation.data || null,
    error: mutation.error?.message || null,
  };
};

export const useCondonePenaltyMutation = (): UseCondonePenaltyMutationReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ houseId, periodId }: { houseId: number; periodId: number }) =>
      condonePenalty(houseId, periodId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: paymentManagementKeys.houseStatus(variables.houseId) });
      queryClient.invalidateQueries({ queryKey: paymentManagementKeys.periodCharges() });
    },
  });

  return {
    condone: (houseId, periodId) => mutation.mutateAsync({ houseId, periodId }),
    isPending: mutation.isPending,
    data: mutation.data || null,
    error: mutation.error?.message || null,
  };
};

export const useAdjustChargeMutation = (): UseAdjustChargeMutationReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ chargeId, data }: { chargeId: number; data: AdjustChargeRequest }) =>
      adjustCharge(chargeId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: paymentManagementKeys.houseStatus(response.houseId) });
      queryClient.invalidateQueries({ queryKey: paymentManagementKeys.periodCharges() });
    },
  });

  return {
    adjust: (chargeId, data) => mutation.mutateAsync({ chargeId, data }),
    isPending: mutation.isPending,
    data: mutation.data || null,
    error: mutation.error?.message || null,
  };
};

export const useReverseChargeMutation = (): UseReverseChargeMutationReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (chargeId: number) => reverseCharge(chargeId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: paymentManagementKeys.houseStatus(response.houseId) });
      queryClient.invalidateQueries({ queryKey: paymentManagementKeys.periodCharges() });
    },
  });

  return {
    reverse: mutation.mutateAsync,
    isPending: mutation.isPending,
    data: mutation.data || null,
    error: mutation.error?.message || null,
  };
};

export const useInitialDebtMutation = (): UseInitialDebtMutationReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ houseId, data }: { houseId: number; data: InitialDebtRequest }) =>
      setInitialDebt(houseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: paymentManagementKeys.houseStatus(variables.houseId) });
      queryClient.invalidateQueries({ queryKey: paymentManagementKeys.periodCharges() });
    },
  });

  return {
    setDebt: (houseId, data) => mutation.mutateAsync({ houseId, data }),
    isPending: mutation.isPending,
    data: mutation.data || null,
    error: mutation.error?.message || null,
  };
};
