/**
 * Change Password Constants
 * Messages and UI texts for the change password page
 */

export const CHANGE_PASSWORD_UI_TEXTS = {
  PAGE_TITLE: 'Cambiar Contraseña',
  CURRENT_PASSWORD_LABEL: 'Contraseña actual',
  CURRENT_PASSWORD_PLACEHOLDER: 'Ingresa tu contraseña actual',
  NEW_PASSWORD_LABEL: 'Nueva contraseña',
  NEW_PASSWORD_PLACEHOLDER: 'Ingresa tu nueva contraseña',
  CONFIRM_PASSWORD_LABEL: 'Confirmar nueva contraseña',
  CONFIRM_PASSWORD_PLACEHOLDER: 'Confirma tu nueva contraseña',
  SUBMIT_BUTTON_IDLE: 'Cambiar contraseña',
  SUBMIT_BUTTON_LOADING: 'Cambiando...',
  BACK_TO_DASHBOARD: 'Volver al dashboard',
  SUCCESS_TITLE: 'Contraseña actualizada',
  SUCCESS_DESCRIPTION: 'Tu contraseña fue cambiada exitosamente. Serás redirigido en un momento.',
  ERROR_TITLE: 'Error',
} as const;

export const CHANGE_PASSWORD_VALIDATION_MESSAGES = {
  PASSWORDS_DO_NOT_MATCH: 'Las contraseñas no coinciden.',
  PASSWORD_TOO_SHORT: 'La nueva contraseña debe tener al menos 6 caracteres.',
  CURRENT_PASSWORD_REQUIRED: 'La contraseña actual es requerida.',
} as const;

export const CHANGE_PASSWORD_ERROR_MESSAGES = {
  GENERAL: 'No fue posible cambiar la contraseña. Por favor intenta de nuevo.',
  WRONG_PASSWORD: 'La contraseña actual es incorrecta.',
  REQUIRES_RECENT_LOGIN: 'Por seguridad, cierra sesión y vuelve a iniciar sesión antes de cambiar tu contraseña.',
  TOO_MANY_REQUESTS: 'Demasiados intentos. Por favor espera un momento e intenta de nuevo.',
} as const;
