export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  vouchers: '/vouchers',
  voucherById: (id: string) => `/vouchers/${id}`,
  transactionsBankUpload: '/transactions-bank/upload',
  transactionsBank: '/transactions-bank',
  bankReconciliation: '/bank-reconciliation/reconcile',
} as const;
