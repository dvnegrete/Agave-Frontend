export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Auth endpoints
  authSignIn: '/auth/signin',
  authOAuthSignIn: '/auth/oauth/signin',
  authOAuthCallback: '/auth/oauth/callback',
  authRefresh: '/auth/refresh',
  authMe: '/auth/me',
  authSignOut: '/auth/signout',

  // Vouchers
  vouchers: '/vouchers',
  voucherById: (id: string) => `/vouchers/${id}`,
  voucherFrontendUpload: '/vouchers/frontend/upload',
  voucherFrontendConfirm: '/vouchers/frontend/confirm',

  // Transactions
  transactionsBankUpload: '/transactions-bank/upload',
  transactionsBank: '/transactions-bank',

  // Bank Reconciliation
  bankReconciliation: '/bank-reconciliation/reconcile',

  // Payment Management
  paymentManagement: '/payment-management',
  paymentManagementPeriods: '/payment-management/periods',
  paymentManagementConfig: '/payment-management/config',
  paymentManagementHousePayments: (houseId: number) => `/payment-management/houses/${houseId}/payments`,
  paymentManagementHouseBalance: (houseId: number) => `/payment-management/houses/${houseId}/balance`,
} as const;
