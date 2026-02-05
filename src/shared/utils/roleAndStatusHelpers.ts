import type { Role, Status } from '@shared/types/user-management.types';
import { ROLE_LABELS, ROLE_DESCRIPTIONS, STATUS_LABELS } from '@shared/constants/user';
import { USER_ROLES_ARRAY, USER_STATUSES_ARRAY } from '@shared/types/user-management.types';

/**
 * Type guard: Check if a value is a valid Role
 */
export function isValidRole(value: unknown): value is Role {
  return typeof value === 'string' && USER_ROLES_ARRAY.includes(value as Role);
}

/**
 * Type guard: Check if a value is a valid Status
 */
export function isValidStatus(value: unknown): value is Status {
  return typeof value === 'string' && USER_STATUSES_ARRAY.includes(value as Status);
}

/**
 * Get label and icon for a role
 */
export function getRoleLabel(role: Role | string): string {
  if (isValidRole(role)) {
    return ROLE_LABELS[role];
  }
  return '';
}

/**
 * Get description for a role
 */
export function getRoleDescription(role: Role | string): string {
  if (isValidRole(role)) {
    return ROLE_DESCRIPTIONS[role];
  }
  return '';
}

/**
 * Get status configuration (label, icon, description)
 */
export function getStatusConfig(status: Status | string) {
  if (isValidStatus(status)) {
    return STATUS_LABELS[status];
  }
  return STATUS_LABELS.active;
}

/**
 * Get status label
 */
export function getStatusLabel(status: Status | string): string {
  if (isValidStatus(status)) {
    return STATUS_LABELS[status].label;
  }
  return '';
}

/**
 * Get status icon
 */
export function getStatusIcon(status: Status | string): string {
  if (isValidStatus(status)) {
    return STATUS_LABELS[status].icon;
  }
  return '';
}

/**
 * Get status description
 */
export function getStatusDescription(status: Status | string): string {
  if (isValidStatus(status)) {
    return STATUS_LABELS[status].description;
  }
  return '';
}

/**
 * Get badge color based on status
 */
export function getStatusBadgeColor(status: Status | string): 'success' | 'warning' | 'error' {
  if (!isValidStatus(status)) {
    return 'error';
  }

  switch (status) {
    case 'active':
      return 'success';
    case 'suspend':
      return 'warning';
    case 'inactive':
      return 'error';
    default:
      return 'error';
  }
}

/**
 * Check if user has admin access
 */
export function isAdmin(role: Role | string): boolean {
  return isValidRole(role) && role === 'admin';
}

/**
 * Check if user has admin or owner access
 */
export function isAdminOrOwner(role: Role | string): boolean {
  return isValidRole(role) && (role === 'admin' || role === 'owner');
}

/**
 * Check if user is tenant
 */
export function isTenant(role: Role | string): boolean {
  return isValidRole(role) && role === 'tenant';
}

/**
 * Check if status is active
 */
export function isActive(status: Status | string): boolean {
  return isValidStatus(status) && status === 'active';
}

/**
 * Check if status is suspended
 */
export function isSuspended(status: Status | string): boolean {
  return isValidStatus(status) && status === 'suspend';
}

/**
 * Check if status is inactive
 */
export function isInactive(status: Status | string): boolean {
  return isValidStatus(status) && status === 'inactive';
}
