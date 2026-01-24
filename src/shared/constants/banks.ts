/**
 * Bank Constants
 * Predefined and custom bank names for transaction uploads
 */

export const BANKS = {
  SANTANDER_2025: 'Santander-2025',
  BBVA: 'BBVA',
  SCOTIABANK: 'Scotiabank',
  HSBC: 'HSBC',
  EFECTIVO: 'Efectivo',
} as const;

export const PREDEFINED_BANKS = [
  BANKS.SANTANDER_2025,
] as const;

export type BankType = typeof BANKS[keyof typeof BANKS];
