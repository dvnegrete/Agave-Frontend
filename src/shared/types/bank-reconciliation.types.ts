// Bank Reconciliation Types
import type { BankTransaction } from './bank-transactions.types';
import type { Voucher } from './vouchers.types';

export interface StartReconciliationRequest {
  startDate?: string;
  endDate?: string;
  [key: string]: unknown;
}

export interface ReconciliationSummary {
  totalProcessed: number;
  conciliados: number;
  unfundedVouchers: number;
  unclaimedDeposits: number;
  requiresManualValidation: number;
  crossMatched?: number;
}

export const ConfidenceLevel = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  MANUAL: 'manual',
} as const;

export type ConfidenceLevel = typeof ConfidenceLevel[keyof typeof ConfidenceLevel];

export type MatchCriteria = Record<string, string | number | boolean>;

export interface MatchedReconciliation {
  transactionBankId: string;
  amount: number;
  houseNumber: number;
  matchCriteria: MatchCriteria[];
  confidenceLevel: ConfidenceLevel;
  voucherId?: number;
  dateDifferenceHours?: number;
}

export interface PendingVoucher {
  voucherId: number;
  amount: number;
  date: string;
  time?: string; // Formato HH:MM:SS desde la API (opcional)
  reason: string;
}

export interface SurplusTransaction {
  transactionBankId: string;
  amount: number;
  date: string;
  time?: string; // Formato HH:MM:SS desde la API (opcional)
  reason: string;
  requiresManualReview?: boolean;
  houseNumber?: number;
}

export interface PossibleMatch {
  voucherId: number;
  similarity: number;
  dateDifferenceHours?: number;
}

export interface ManualValidationCase {
  transactionBankId: string;
  reason: string;
  possibleMatches: PossibleMatch[];
}

export interface StartReconciliationResponse {
  summary: ReconciliationSummary;
  conciliados: MatchedReconciliation[];
  unfundedVouchers: PendingVoucher[];
  unclaimedDeposits: SurplusTransaction[];
  manualValidationRequired: ManualValidationCase[];
  crossMatched?: number;
}

export interface ReconcileRequest {
  transactionId: string;
  voucherId: string;
  [key: string]: unknown;
}

export interface ReconcileResponse {
  success: boolean;
  message: string;
  transaction: BankTransaction;
  voucher: Voucher;
}

export interface ReconciliationMatch {
  transactionId: string;
  voucherId: string;
  similarity: number;
  suggested: boolean;
}

export interface BulkReconcileRequest {
  matches: ReconciliationMatch[];
  [key: string]: unknown;
}

export interface BulkReconcileResponse {
  success: boolean;
  message: string;
  reconciled: number;
  failed: number;
  errors: string[];
}

// Paginación base
export interface PaginationParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedResponse<T> {
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  items: T[];
}

// Manual Validation endpoints
export interface ManualValidationQueryParams extends PaginationParams {
  houseNumber?: number;
  sortBy?: 'date' | 'similarity' | 'candidates';
}

export interface ManualValidationPendingItem {
  transactionBankId: string;
  transactionAmount: number;
  transactionDate: string;
  transactionConcept: string;
  possibleMatches: Array<{
    voucherId: number;
    voucherAmount: number;
    voucherDate: string;
    houseNumber: number;
    similarity: number;
    dateDifferenceHours: number;
  }>;
  reason: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ApproveManualValidationRequest {
  voucherId: number;
  approverNotes?: string;
  [key: string]: unknown;
}

export interface ApproveManualValidationResponse {
  message: string;
  reconciliation: {
    transactionBankId: string;
    voucherId: number;
    houseNumber: number;
    status: 'confirmed';
  };
  approvedAt: string;
}

export interface RejectManualValidationRequest {
  rejectionReason: string;
  notes?: string;
  [key: string]: unknown;
}

export interface RejectManualValidationResponse {
  message: string;
  transactionBankId: string;
  newStatus: 'not-found';
  rejectedAt: string;
}

export interface ManualValidationStatsResponse {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  pendingLast24Hours: number;
  approvalRate: number;
  avgApprovalTimeMinutes: number;
  distributionByHouseRange: Record<string, number>;
}

// Unclaimed Deposits endpoints
export interface UnclaimedDepositsQueryParams extends PaginationParams {
  validationStatus?: 'conflict' | 'not-found' | 'all';
  houseNumber?: number;
  sortBy?: 'date' | 'amount';
}

export interface UnclaimedDepositsItem {
  transactionBankId: string;
  amount: number;
  date: string;
  time: string;
  concept: string;
  validationStatus: 'conflict' | 'not-found';
  reason: string;
  suggestedHouseNumber: number;
  conceptHouseNumber?: number;
  processedAt: string;
}

export interface AssignHouseToDepositRequest {
  houseNumber: number;
  adminNotes?: string;
  [key: string]: unknown;
}

export interface PaymentAllocation {
  conceptType: string;
  allocatedAmount: number;
  paymentStatus: 'complete' | 'partial' | 'pending';
}

export interface AssignHouseToDepositResponse {
  message: string;
  reconciliation: {
    transactionBankId: string;
    houseNumber: number;
    status: 'confirmed';
    paymentAllocation: {
      total_distributed: number;
      allocations: PaymentAllocation[];
    };
  };
  assignedAt: string;
}

// Unfunded Vouchers endpoints
export interface UnfundedVouchersQueryParams extends PaginationParams {
  sortBy?: 'date' | 'amount';
}

export interface UnfundedVouchersItem {
  voucherId: number;
  amount: number;
  date: string;
  houseNumber?: number;
  url?: string;
}

export interface MatchVoucherWithDepositRequest {
  transactionBankId: string;
  houseNumber: number;
  adminNotes?: string;
  [key: string]: unknown;
}

export interface MatchVoucherWithDepositResponse {
  message: string;
  reconciliation: {
    voucherId: number;
    transactionBankId: string;
    houseNumber: number;
    status: 'confirmed';
  };
  matchedAt: string;
}

// ============ Match Suggestions (Cross-Matching) ============

export interface MatchSuggestionItem {
  transactionBankId: string;
  voucherId: number;
  amount: number;
  depositDate: string;
  depositTime: string | null;
  voucherDate: string;
  houseNumber: number | null;
  confidence: 'high' | 'medium';
  reason: string;
}

export interface MatchSuggestionsResponse {
  totalSuggestions: number;
  highConfidence: number;
  mediumConfidence: number;
  suggestions: MatchSuggestionItem[];
}

export interface ApplyMatchSuggestionRequest {
  transactionBankId: string;
  voucherId: number;
  houseNumber: number;
  adminNotes?: string;
  [key: string]: unknown;
}

export interface ApplyMatchSuggestionResponse {
  message: string;
  reconciliation: {
    transactionBankId: string;
    voucherId: number;
    houseNumber: number;
    status: string;
  };
  appliedAt: string;
}

export interface ApplyBatchRequest {
  suggestions: ApplyMatchSuggestionRequest[];
  [key: string]: unknown;
}

export interface ApplyBatchResponse {
  totalApplied: number;
  totalFailed: number;
  results: {
    transactionBankId: string;
    voucherId: number;
    success: boolean;
    error?: string;
  }[];
}
