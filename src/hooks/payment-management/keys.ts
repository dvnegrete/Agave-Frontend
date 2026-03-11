export const paymentManagementKeys = {
  all: ['payment-management'] as const,
  periods: () => [...paymentManagementKeys.all, 'periods'] as const,
  period: (id: number) => [...paymentManagementKeys.periods(), id] as const,
  configs: () => [...paymentManagementKeys.all, 'configs'] as const,
  config: (id: number) => [...paymentManagementKeys.configs(), id] as const,
  payments: () => [...paymentManagementKeys.all, 'payments'] as const,
  paymentHistory: (houseId: number) => [...paymentManagementKeys.payments(), 'history', houseId] as const,
  paymentsByPeriod: (houseId: number, periodId: number) =>
    [...paymentManagementKeys.payments(), 'history', houseId, periodId] as const,
  balances: () => [...paymentManagementKeys.all, 'balances'] as const,
  houseBalance: (houseId: number) => [...paymentManagementKeys.balances(), houseId] as const,
  houseStatus: (houseId: number) => [...paymentManagementKeys.balances(), 'status', houseId] as const,
  periodCharges: () => [...paymentManagementKeys.all, 'period-charges'] as const,
};
