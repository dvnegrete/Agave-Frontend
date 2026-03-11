/**
 * Barrel: re-exports de todos los hooks de payment-management.
 * Mantiene compatibilidad 100% con imports existentes.
 */

export { paymentManagementKeys } from './payment-management/keys';

export {
  usePeriodsQuery,
  usePeriodMutations,
  usePeriodConfigMutations,
} from './payment-management/usePeriodHooks';

export {
  usePaymentHistoryQuery,
  usePaymentsByPeriodQuery,
  useHouseBalanceQuery,
  useHouseStatusQuery,
} from './payment-management/useHouseHooks';

export {
  usePeriodChargesQuery,
  useBatchUpdateChargesMutation,
  useReprocessAllocationsMutation,
  useBackfillAllocationsMutation,
} from './payment-management/usePeriodChargesHooks';

export {
  useInitialBalanceMutation,
  useCondonePenaltyMutation,
  useAdjustChargeMutation,
  useReverseChargeMutation,
  useInitialDebtMutation,
} from './payment-management/useAdminHooks';
