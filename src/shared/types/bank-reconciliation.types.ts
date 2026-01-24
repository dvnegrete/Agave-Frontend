// Bank Reconciliation Types
import type { BankTransaction } from './bank-transactions.types';
import type { Voucher } from './vouchers.types';

export interface StartReconciliationRequest {
  startDate?: string;
  endDate?: string;
  [key: string]: unknown;
}

export interface ReconciliationSummary {
  totalVouchers: number;
  totalTransactions: number;
  matched: number;
  pendingVouchers: number;
  surplusTransactions: number;
  manualValidationRequired: number;
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
  transactionId: number;
  amount: number;
  date: string;
  time: string; // Formato HH:MM:SS desde la API
  reason: string;
}

export interface PossibleMatch {
  transactionId: number;
  amount: number;
  date: string;
  time?: string; // Formato HH:MM:SS desde la API (opcional)
  matchScore: number;
}

export interface ManualValidationCase {
  voucherId: number;
  amount: number;
  date: string;
  time?: string; // Formato HH:MM:SS desde la API (opcional)
  reason: string;
  possibleMatches: PossibleMatch[];
}

export interface StartReconciliationResponse {
  summary: ReconciliationSummary;
  conciliados: MatchedReconciliation[];
  unfundedVouchers: PendingVoucher[];
  unclaimedDeposits: SurplusTransaction[];
  manualValidationRequired: ManualValidationCase[];
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
