export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  vouchers: '/vouchers',
  voucherById: (id: string) => `/vouchers/${id}`,
  transactionsBankUpload: '/transactions-bank/upload',
  transactionsBank: '/transactions-bank',
  bankReconciliation: '/bank-reconciliation/reconcile',
  paymentManagement: '/payment-management',
  paymentManagementPeriods: '/payment-management/periods',
  paymentManagementConfig: '/payment-management/config',
  paymentManagementHousePayments: (houseId: number) => `/payment-management/houses/${houseId}/payments`,
  paymentManagementHouseBalance: (houseId: number) => `/payment-management/houses/${houseId}/balance`,
} as const;
