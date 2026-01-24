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

// ConfidenceLevel: exported as both a const value and a type
// export { ConfidenceLevel } from './bank-reconciliation.types';
export type { ConfidenceLevel } from './bank-reconciliation.types';

// User management types
export type {
  Role,
  Status,
  User,
  UpdateUserRoleRequest,
  UpdateUserStatusRequest,
  AssignHouseRequest,
  RemoveHouseResponse,
  AssignHouseResponse,
  UsersResponse,
  ModalType,
} from './user-management.types';

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
  ActiveTab as PaymentActiveTab,
  BalanceStatusVariant,
  PaymentMovement,
} from './payment-management.types';

// Historical records types
export type {
  UploadHistoricalRecordsOptions,
  RowErrorDto,
  HistoricalRecordResponseDto,
  HistoricalRecord,
  HistoricalRecordsUploadHistory,
  ActiveTab as HistoricalRecordsActiveTab,
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
  BaseLayoutProps,
  MenuItem,
  ApiStatus,
  Step,
} from './common.types';
