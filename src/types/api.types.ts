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

// Payment Management Types

// Period Types
export interface PeriodResponseDto {
  id: number;
  year: number;
  month: number;
  period_name: string;
  start_date: string;        // ISO date
  end_date: string;          // ISO date
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface CreatePeriodDto {
  year: number;
  month: number;
  period_config_id?: number;  // Optional for create, required for certain operations
}

// Period Config Types
export interface PeriodConfigResponseDto {
  id: number;
  maintenance_amount: number;
  water_amount: number;
  extraordinary_fee: number;
  due_day: number;           // Día de vencimiento
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface CreatePeriodConfigDto {
  maintenance_amount: number;
  water_amount: number;
  extraordinary_fee?: number;
  due_day: number;
  [key: string]: any;
}

// Payment Types
export interface PaymentAssignment {
  id?: number;
  concept: string;           // e.g., "Mantenimiento", "Agua", "Cuota Extraordinaria"
  amount: number;
  due_date: string;          // ISO date
  payment_status: 'pending' | 'paid' | 'partially_paid' | 'overdue';
  paid_amount?: number;
  payment_date?: string;
  [key: string]: any;
}

export interface PaymentHistoryPeriod {
  period_id: number;
  period_name: string;
  year: number;
  month: number;
  assignments: PaymentAssignment[];
  total_amount: number;
  total_paid: number;
}

export interface PaymentHistoryResponseDTO {
  house_id: number;
  history: PaymentHistoryPeriod[];
  total_history_amount: number;
  total_history_paid: number;
}

// House Balance Types
export interface HouseBalanceDTO {
  house_id: number;
  current_balance: number;   // Saldo actual (positivo = crédito, negativo = deuda)
  status: 'balanced' | 'credited' | 'in-debt';  // Estado financiero
  accumulated_cents: number; // Centavos acumulados
  last_payment_date?: string;
  [key: string]: any;
}

// Query Types
export interface PaymentManagementQuery {
  year?: number;
  month?: number;
  house_id?: number;
  period_id?: number;
  [key: string]: any;
}

// Voucher Upload Types
export interface VoucherStructuredData {
  monto: string;
  fecha_pago: string;
  hora_transaccion?: string;
  casa?: number;
  referencia?: string;
  hora_asignada_automaticamente?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  errors: Record<string, string>;
  warnings?: string[];
}

export interface VoucherUploadResponse {
  success: boolean;
  structuredData: VoucherStructuredData;
  validation: ValidationResult;
  gcsFilename?: string;
  originalFilename: string;
  suggestions?: {
    casaDetectedFromCentavos?: boolean;
    autoAssignedTime?: boolean;
  };
}

export interface VoucherConfirmRequest {
  gcsFilename: string;
  monto: string;
  fecha_pago: string;
  hora_transaccion?: string;
  casa: number;
  referencia?: string;
  userId?: string | null;
}

export interface VoucherConfirmResponse {
  success: boolean;
  confirmationCode: string;
  voucher: {
    id: number;
    amount: number;
    date: string;
    casa: number;
    referencia: string;
    confirmation_status: boolean;
  };
}
