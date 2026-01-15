/**
 * Barrel export for all domain-specific types
 *
 * Types are organized by feature domain for better maintainability:
 * - vouchers: Voucher creation, updates, and responses
 * - bank-transactions: Bank transaction imports and uploads
 * - bank-reconciliation: Reconciliation matching and validation
 * - payment-management: Periods, payments, and house balances
 * - historical-records: Historical data upload and processing
 * - voucher-upload: Voucher upload flow and validation
 * - unclaimed-deposits: Unclaimed deposit management
 * - common: Generic API response types
 */

// Voucher types
export type {
  Voucher,
  CreateVoucherRequest,
  UpdateVoucherRequest,
  VouchersResponse,
  VoucherQuery,
} from './vouchers.types';

// Bank transaction types
export type {
  BankTransaction,
  UploadedTransaction,
  UploadTransactionsResponse,
  TransactionsBankQuery,
  TransactionsBankResponse,
} from './bank-transactions.types';

// Bank reconciliation types
export type {
  StartReconciliationRequest,
  ReconciliationSummary,
  MatchCriteria,
  MatchedReconciliation,
  PendingVoucher,
  SurplusTransaction,
  PossibleMatch,
  ManualValidationCase,
  StartReconciliationResponse,
  ReconcileRequest,
  ReconcileResponse,
  ReconciliationMatch,
  BulkReconcileRequest,
  BulkReconcileResponse,
} from './bank-reconciliation.types';

export {
  ConfidenceLevel, // Export both const and type (ConfidenceLevel is both a value and a type)
  type ConfidenceLevel,
} from './bank-reconciliation.types';

// Payment management types
export type {
  PeriodResponseDto,
  CreatePeriodDto,
  PeriodConfigResponseDto,
  CreatePeriodConfigDto,
  PaymentRecord,
  PaymentAssignment,
  PaymentHistoryPeriod,
  HousePaymentTransaction,
  UnreconciledVoucher,
  UnreconciledVouchersResponse,
  HousePayments,
  PaymentHistoryResponseDTO,
  HousePaymentsLegacy,
  HouseBalance,
  HouseBalanceDTO,
  PaymentManagementQuery,
} from './payment-management.types';

// Historical records types
export type {
  UploadHistoricalRecordsOptions,
  RowErrorDto,
  HistoricalRecordResponseDto,
  HistoricalRecord,
  HistoricalRecordsUploadHistory,
} from './historical-records.types';

// Voucher upload types
export type {
  VoucherStructuredData,
  ValidationResult,
  VoucherUploadResponse,
  VoucherConfirmRequest,
  VoucherConfirmResponse,
} from './voucher-upload.types';

// Unclaimed deposits types
export type {
  UnclaimedDeposit,
  UnclaimedDepositsPage,
  UnclaimedDepositsFilters,
  DepositAssignHouseRequest,
  DepositAssignHouseResponse,
} from './unclaimed-deposits.types';

// Common/Generic API types
export type {
  ApiResponse,
  ApiError,
} from './common.types';
