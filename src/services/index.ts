// Export all services
export * from './authService';
export * from './voucherService';
export * from './transactionBankService';
export * from './bankReconciliationService';
export * from './paymentManagementService';
export * from './unclaimedDepositsService';
export * from './historicalRecordsService';
export * from './voucherUploadService';
export * from './userManagementService';

// Export types from shared/types (domain types)
export * from '@shared';

// Export auth types (User from auth.types is the authenticated user)
export type {
  User as AuthUser,
  AuthResponse,
  LoginRequest,
  OAuthCallbackRequest,
  RefreshTokenRequest,
  AuthContextType,
} from '@/shared/types/auth.types';

// Export user management types (User from user-management.types is for admin management)
export type {
  User as ManagedUser,
  Role,
  Status,
  UpdateUserRoleRequest,
  UpdateUserStatusRequest,
  AssignHouseRequest,
  RemoveHouseResponse,
  AssignHouseResponse,
  UsersResponse,
} from '@/shared/types/user-management.types';
