/**
 * Validation Constants
 * Validation ranges and error messages
 */

export const HOUSE_NUMBER_RANGE = {
  MIN: 1,
  MAX: 66,
} as const;

export const VALIDATION_MESSAGES = {
  HOUSE_NUMBER_INVALID: `El número de casa debe estar entre ${HOUSE_NUMBER_RANGE.MIN} y ${HOUSE_NUMBER_RANGE.MAX}`,
  HOUSE_NUMBER_REQUIRED: 'El número de casa es obligatorio',
  REQUIRED_FIELD: 'Este campo es obligatorio',
} as const;
