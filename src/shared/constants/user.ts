/**
 * User Management Constants
 * Roles, statuses, and their associated labels for user management
 */

import type { Role, Status } from '@shared/types/user-management.types';

export const USER_ROLES: Role[] = ['admin', 'owner', 'tenant'];

export const ROLE_LABELS: Record<Role, string> = {
  admin: '👑 Administrador',
  owner: '🏠 Propietario',
  tenant: '👤 Inquilino',
} as const;

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin: 'Acceso total al sistema',
  owner: 'Puede gestionar sus propiedades',
  tenant: 'Acceso limitado a inquilinos',
} as const;

export const USER_STATUSES: Status[] = ['active', 'suspend', 'inactive'];

export const STATUS_LABELS: Record<Status, { label: string; icon: string; description: string }> = {
  active: {
    label: '✅ Activo',
    icon: '✅',
    description: 'Usuario activo en el sistema',
  },
  suspend: {
    label: '⏸️ Suspendido',
    icon: '⏸️',
    description: 'Acceso temporalmente desactivado',
  },
  inactive: {
    label: '❌ Inactivo',
    icon: '❌',
    description: 'Usuario desactivado permanentemente',
  },
} as const;
