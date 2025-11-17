// Voucher Types
export interface Voucher {
  id: number;
  date: string;
  authorization_number: string;
  confirmation_code: string;
  amount: number;
  confirmation_status: boolean;
  url: string;
  viewUrl?: string;
  number_house: number;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface CreateVoucherRequest {
  authorization_number: string;
  date: string;
  confirmation_code: string;
  amount: number;
  confirmation_status: boolean;
  url: string;
  [key: string]: any;
}

export interface UpdateVoucherRequest {
  authorization_number?: string;
  date?: string;
  confirmation_code?: string;
  amount?: number;
  confirmation_status?: boolean;
  url?: string;
  [key: string]: any;
}

export interface VouchersResponse {
  vouchers: Voucher[];
  total: number;
  page: number;
  limit: number;
}

export interface VoucherQuery {
  page?: number;
  limit?: number;
  confirmation_status?: boolean;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

// Transaction Bank Types
export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
  reconciled: boolean;
  voucherId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadedTransaction {
  date: string;
  time: string;
  concept: string;
  amount: number;
  currency: string;
  is_deposit: boolean;
  bank_name: string;
  validation_flag: boolean;
  status: string;
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadTransactionsResponse {
  message: string;
  success: boolean;
  totalTransactions: number;
  validTransactions: number;
  invalidTransactions: number;
  previouslyProcessedTransactions: number;
  transactions: UploadedTransaction[];
  errors: any[];
  dateRange: {
    start: string;
    end: string;
  };
  lastDayTransaction: UploadedTransaction[];
}

export interface TransactionsBankQuery {
  page?: number;
  limit?: number;
  reconciled?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface TransactionsBankResponse {
  transactions: BankTransaction[];
  total: number;
  page: number;
  limit: number;
}

// Bank Reconciliation Types
export interface StartReconciliationRequest {
  startDate?: string;
  endDate?: string;
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

export interface MatchCriteria {
  [key: string]: any;
}

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
  reason: string;
  [key: string]: any;
}

export interface SurplusTransaction {
  transactionId: number;
  amount: number;
  date: string;
  reason: string;
  [key: string]: any;
}

export interface PossibleMatch {
  transactionId: number;
  amount: number;
  date: string;
  matchScore: number;
  [key: string]: any;
}

export interface ManualValidationCase {
  voucherId: number;
  amount: number;
  date: string;
  reason: string;
  possibleMatches: PossibleMatch[];
  [key: string]: any;
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
}

export interface BulkReconcileResponse {
  success: boolean;
  message: string;
  reconciled: number;
  failed: number;
  errors: string[];
}

// Generic API Response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
  statusCode?: number;
}
