export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Auth endpoints
  authSignIn: '/auth/signin',
  authSignUp: '/auth/signup',
  authOAuthSignIn: '/auth/oauth/signin',
  authOAuthCallback: '/auth/oauth/callback',
  authRefresh: '/auth/refresh',
  authMe: '/auth/me',
  authSignOut: '/auth/signout',
  authVerifyEmail: '/auth/verify-email',
  authResendVerificationEmail: '/auth/resend-verification-email',

  // Vouchers
  vouchers: '/vouchers',
  voucherById: (id: string) => `/vouchers/${id}`,
  voucherFrontendUpload: '/vouchers/frontend/upload',
  voucherFrontendConfirm: '/vouchers/frontend/confirm',

  // Transactions
  transactionsBankUpload: '/transactions-bank/upload',
  transactionsBank: '/transactions-bank',
  transactionsBankExpenses: '/transactions-bank/expenses',

  // Bank Reconciliation
  bankReconciliation: '/bank-reconciliation/reconcile',
  bankReconciliationManualValidationStats: '/bank-reconciliation/manual-validation/stats',
  bankReconciliationUnclaimedDeposits: '/bank-reconciliation/unclaimed-deposits',

  // Payment Management
  paymentManagement: '/payment-management',
  paymentManagementPeriods: '/payment-management/periods',
  paymentManagementConfig: '/payment-management/config',
  paymentManagementHousePayments: (houseId: number) => `/payment-management/houses/${houseId}/payments`,
  paymentManagementHouseBalance: (houseId: number) => `/payment-management/houses/${houseId}/balance`,

  // User Management
  userManagementUsers: '/user-management/users',
  userManagementUserRole: (userId: string) => `/user-management/users/${userId}/role`,
  userManagementUserStatus: (userId: string) => `/user-management/users/${userId}/status`,
  userManagementUserObservations: (userId: string) => `/user-management/users/${userId}/observations`,
  userManagementUserHouses: (userId: string) => `/user-management/users/${userId}/houses`,
  userManagementUserHouseRemove: (userId: string, houseNumber: number) =>
    `/user-management/users/${userId}/houses/${houseNumber}`,
  userManagementUserDelete: (userId: string) => `/user-management/users/${userId}`,
} as const;
