import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ManualValidationQueryParams,
  ManualValidationPendingItem,
  ApproveManualValidationRequest,
  ApproveManualValidationResponse,
  RejectManualValidationRequest,
  RejectManualValidationResponse,
  ManualValidationStatsResponse,
  UnclaimedDepositsQueryParams,
  UnclaimedDepositsItem,
  AssignHouseToDepositRequest,
  AssignHouseToDepositResponse,
  UnfundedVouchersQueryParams,
  UnfundedVouchersItem,
  MatchVoucherWithDepositRequest,
  MatchVoucherWithDepositResponse,
  PaginatedResponse,
  MatchSuggestionsResponse,
  ApplyMatchSuggestionRequest,
  ApplyMatchSuggestionResponse,
  ApplyBatchRequest,
  ApplyBatchResponse,
} from '@shared/types/bank-reconciliation.types';
import {
  getManualValidationPending,
  approveManualValidation,
  rejectManualValidation,
  getManualValidationStats,
  getUnclaimedDeposits,
  assignHouseToDeposit,
  getUnfundedVouchers,
  matchVoucherWithDeposit,
  getMatchSuggestions,
  applyMatchSuggestion,
  applyBatchMatchSuggestions,
} from '@services/bankReconciliationService';

// Type aliases to ensure TypeScript recognizes all types as used
type ManualValidationPendingResponse = PaginatedResponse<ManualValidationPendingItem>;
type UnclaimedDepositsResponse = PaginatedResponse<UnclaimedDepositsItem>;
type UnfundedVouchersResponse = PaginatedResponse<UnfundedVouchersItem>;

// ============ Manual Validation Queries ============

export const useManualValidationPending = (params?: ManualValidationQueryParams) => {
  return useQuery<ManualValidationPendingResponse>({
    queryKey: ['manual-validation-pending', params],
    queryFn: () => getManualValidationPending(params),
    enabled: true,
  });
};

export const useManualValidationStats = () => {
  return useQuery<ManualValidationStatsResponse>({
    queryKey: ['manual-validation-stats'],
    queryFn: () => getManualValidationStats(),
    enabled: true,
  });
};

// ============ Manual Validation Mutations ============

interface UseManualValidationMutationsReturn {
  approve: (transactionId: string, data: ApproveManualValidationRequest) => Promise<ApproveManualValidationResponse | undefined>;
  reject: (transactionId: string, data: RejectManualValidationRequest) => Promise<RejectManualValidationResponse | undefined>;
  approving: boolean;
  rejecting: boolean;
  error: string | null;
}

export const useManualValidationMutations = (): UseManualValidationMutationsReturn => {
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: ({ transactionId, data }: { transactionId: string; data: ApproveManualValidationRequest }) =>
      approveManualValidation(transactionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual-validation-pending'] });
      queryClient.invalidateQueries({ queryKey: ['manual-validation-stats'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ transactionId, data }: { transactionId: string; data: RejectManualValidationRequest }) =>
      rejectManualValidation(transactionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual-validation-pending'] });
      queryClient.invalidateQueries({ queryKey: ['manual-validation-stats'] });
    },
  });

  return {
    approve: (transactionId: string, data: ApproveManualValidationRequest) =>
      approveMutation.mutateAsync({ transactionId, data }),
    reject: (transactionId: string, data: RejectManualValidationRequest) =>
      rejectMutation.mutateAsync({ transactionId, data }),
    approving: approveMutation.isPending,
    rejecting: rejectMutation.isPending,
    error: approveMutation.error?.message || rejectMutation.error?.message || null,
  };
};

// ============ Unclaimed Deposits Queries ============

export const useUnclaimedDeposits = (params?: UnclaimedDepositsQueryParams) => {
  return useQuery<UnclaimedDepositsResponse>({
    queryKey: ['unclaimed-deposits', params],
    queryFn: () => getUnclaimedDeposits(params),
    enabled: true,
  });
};

// ============ Unclaimed Deposits Mutations ============

interface UseUnclaimedDepositsMutationsReturn {
  assignHouse: (transactionId: string, data: AssignHouseToDepositRequest) => Promise<AssignHouseToDepositResponse | undefined>;
  assigning: boolean;
  error: string | null;
}

export const useUnclaimedDepositsMutations = (): UseUnclaimedDepositsMutationsReturn => {
  const queryClient = useQueryClient();

  const assignMutation = useMutation({
    mutationFn: ({ transactionId, data }: { transactionId: string; data: AssignHouseToDepositRequest }) =>
      assignHouseToDeposit(transactionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unclaimed-deposits'] });
    },
  });

  return {
    assignHouse: (transactionId: string, data: AssignHouseToDepositRequest) =>
      assignMutation.mutateAsync({ transactionId, data }),
    assigning: assignMutation.isPending,
    error: assignMutation.error?.message || null,
  };
};

// ============ Unfunded Vouchers Queries ============

export const useUnfundedVouchers = (params?: UnfundedVouchersQueryParams) => {
  return useQuery<UnfundedVouchersResponse>({
    queryKey: ['unfunded-vouchers', params],
    queryFn: () => getUnfundedVouchers(params),
    enabled: true,
  });
};

// ============ Unfunded Vouchers Mutations ============

interface UseUnfundedVouchersMutationsReturn {
  matchDeposit: (voucherId: number, data: MatchVoucherWithDepositRequest) => Promise<MatchVoucherWithDepositResponse | undefined>;
  matching: boolean;
  error: string | null;
}

export const useUnfundedVouchersMutations = (): UseUnfundedVouchersMutationsReturn => {
  const queryClient = useQueryClient();

  const matchMutation = useMutation({
    mutationFn: ({ voucherId, data }: { voucherId: number; data: MatchVoucherWithDepositRequest }) =>
      matchVoucherWithDeposit(voucherId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unfunded-vouchers'] });
    },
  });

  return {
    matchDeposit: (voucherId: number, data: MatchVoucherWithDepositRequest) =>
      matchMutation.mutateAsync({ voucherId, data }),
    matching: matchMutation.isPending,
    error: matchMutation.error?.message || null,
  };
};

// ============ Match Suggestions (Cross-Matching) Queries ============

export const useMatchSuggestions = () => {
  return useQuery<MatchSuggestionsResponse>({
    queryKey: ['match-suggestions'],
    queryFn: () => getMatchSuggestions(),
    enabled: true,
  });
};

// ============ Match Suggestions Mutations ============

interface UseMatchSuggestionsMutationsReturn {
  applySuggestion: (data: ApplyMatchSuggestionRequest) => Promise<ApplyMatchSuggestionResponse | undefined>;
  applyBatch: (data: ApplyBatchRequest) => Promise<ApplyBatchResponse | undefined>;
  applying: boolean;
  applyingBatch: boolean;
  error: string | null;
}

export const useMatchSuggestionsMutations = (): UseMatchSuggestionsMutationsReturn => {
  const queryClient = useQueryClient();

  const applyMutation = useMutation({
    mutationFn: (data: ApplyMatchSuggestionRequest) =>
      applyMatchSuggestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['unclaimed-deposits'] });
      queryClient.invalidateQueries({ queryKey: ['unfunded-vouchers'] });
    },
  });

  const batchMutation = useMutation({
    mutationFn: (data: ApplyBatchRequest) =>
      applyBatchMatchSuggestions(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['unclaimed-deposits'] });
      queryClient.invalidateQueries({ queryKey: ['unfunded-vouchers'] });
    },
  });

  return {
    applySuggestion: (data: ApplyMatchSuggestionRequest) =>
      applyMutation.mutateAsync(data),
    applyBatch: (data: ApplyBatchRequest) =>
      batchMutation.mutateAsync(data),
    applying: applyMutation.isPending,
    applyingBatch: batchMutation.isPending,
    error: applyMutation.error?.message || batchMutation.error?.message || null,
  };
};
