/**
 * Bank Reconciliation Constants
 * Confidence levels and reconciliation-related configurations
 */

export const CONFIDENCE_LEVELS = {
  high: { label: 'Alta', icon: '✅', variant: 'success' },
  medium: { label: 'Media', icon: '⚖️', variant: 'warning' },
  low: { label: 'Baja', icon: '⚠️', variant: 'warning' },
  manual: { label: 'Manual', icon: '🔧', variant: 'info' },
} as const;
