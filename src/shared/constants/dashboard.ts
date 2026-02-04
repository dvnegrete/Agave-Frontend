import { ROUTES } from './routes';
import { ICONS } from './icons';
import { LABELS } from './labels';
import type { Role } from '@shared/types/user-management.types';

export type DashboardFeatureRole = Role;

export interface DashboardFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  roles: Role[];
}

// Feature descriptions (not duplicated elsewhere)
const FEATURE_DESCRIPTIONS = {
  EXPENSE_REPORT: 'Visualiza y analiza gastos por mes',
  MY_HOUSE_PAYMENTS: 'Revisa los pagos y movimientos de tu casa',
  VOUCHER_LIST: 'Gestiona comprobantes de mantenimiento',
  TRANSACTION_UPLOAD: 'Sube y revisa las transacciones bancarias',
  BANK_RECONCILIATION: 'Concilia transacciones con vouchers automáticamente',
  PAYMENT_MANAGEMENT: 'Administra los pagos de las casa y los usuarios',
  USER_MANAGEMENT: 'Gestiona usuarios del sistema',
} as const;

export const DASHBOARD_FEATURES: DashboardFeature[] = [
  {
    id: 'expense-report',
    title: LABELS.EXPENSE_REPORT,
    description: FEATURE_DESCRIPTIONS.EXPENSE_REPORT,
    icon: ICONS.EXPENSE_REPORT,
    route: ROUTES.EXPENSE_REPORT,
    roles: ['admin', 'owner'],
  },
  {
    id: 'my-house-payments',
    title: LABELS.MY_HOUSE_PAYMENTS,
    description: FEATURE_DESCRIPTIONS.MY_HOUSE_PAYMENTS,
    icon: ICONS.MY_HOUSE_PAYMENTS,
    route: ROUTES.MY_HOUSE_PAYMENTS,
    roles: ['admin', 'owner'],
  },
  {
    id: 'vouchers',
    title: LABELS.VOUCHER_LIST,
    description: FEATURE_DESCRIPTIONS.VOUCHER_LIST,
    icon: ICONS.VOUCHER_LIST,
    route: ROUTES.VOUCHER_LIST,
    roles: ['admin'],
  },
  {
    id: 'transactions',
    title: LABELS.TRANSACTION_UPLOAD,
    description: FEATURE_DESCRIPTIONS.TRANSACTION_UPLOAD,
    icon: ICONS.TRANSACTION_UPLOAD,
    route: ROUTES.TRANSACTION_UPLOAD,
    roles: ['admin'],
  },
  {
    id: 'reconciliation',
    title: LABELS.BANK_RECONCILIATION,
    description: FEATURE_DESCRIPTIONS.BANK_RECONCILIATION,
    icon: ICONS.BANK_RECONCILIATION,
    route: ROUTES.BANK_RECONCILIATION,
    roles: ['admin'],
  },
  {
    id: 'payments',
    title: LABELS.PAYMENT_MANAGEMENT,
    description: FEATURE_DESCRIPTIONS.PAYMENT_MANAGEMENT,
    icon: ICONS.PAYMENT_MANAGEMENT,
    route: ROUTES.PAYMENT_MANAGEMENT,
    roles: ['admin'],
  },
  {
    id: 'users',
    title: LABELS.USER_MANAGEMENT,
    description: FEATURE_DESCRIPTIONS.USER_MANAGEMENT,
    icon: ICONS.USER_MANAGEMENT,
    route: ROUTES.USER_MANAGEMENT,
    roles: ['admin'],
  },
];
