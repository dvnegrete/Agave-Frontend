import type { Role, Status } from '@shared/types/user-management.types';
import { ROLE_LABELS, ROLE_DESCRIPTIONS, STATUS_LABELS } from '@shared/constants/user';

/**
 * Get label and icon for a role
 */
export function getRoleLabel(role: Role): string {
  return ROLE_LABELS[role];
}

/**
 * Get description for a role
 */
export function getRoleDescription(role: Role): string {
  return ROLE_DESCRIPTIONS[role];
}

/**
 * Get status configuration (label, icon, description)
 */
export function getStatusConfig(status: Status) {
  return STATUS_LABELS[status];
}

/**
 * Get status label
 */
export function getStatusLabel(status: Status): string {
  return STATUS_LABELS[status].label;
}

/**
 * Get status icon
 */
export function getStatusIcon(status: Status): string {
  return STATUS_LABELS[status].icon;
}

/**
 * Get status description
 */
export function getStatusDescription(status: Status): string {
  return STATUS_LABELS[status].description;
}

/**
 * Get badge color based on status
 */
export function getStatusBadgeColor(status: Status): 'success' | 'warning' | 'error' {
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
export function isAdmin(role: Role): boolean {
  return role === 'admin';
}

/**
 * Check if user has admin or owner access
 */
export function isAdminOrOwner(role: Role): boolean {
  return role === 'admin' || role === 'owner';
}

/**
 * Check if user is tenant
 */
export function isTenant(role: Role): boolean {
  return role === 'tenant';
}

/**
 * Check if status is active
 */
export function isActive(status: Status): boolean {
  return status === 'active';
}

/**
 * Check if status is suspended
 */
export function isSuspended(status: Status): boolean {
  return status === 'suspend';
}

/**
 * Check if status is inactive
 */
export function isInactive(status: Status): boolean {
  return status === 'inactive';
}
