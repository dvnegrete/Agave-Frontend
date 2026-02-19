/**
 * Forgot Password Constants
 * Messages and UI texts for the forgot password page
 */

export const FORGOT_PASSWORD_UI_TEXTS = {
  PAGE_TITLE: 'Recuperar Contraseña',
  EMAIL_LABEL: 'Correo Electrónico',
  EMAIL_PLACEHOLDER: 'ejemplo@correo.com',
  SUBMIT_BUTTON_IDLE: 'Enviar enlace de recuperación',
  SUBMIT_BUTTON_LOADING: 'Enviando...',
  BACK_TO_LOGIN: 'Volver al inicio de sesión',
  SUCCESS_TITLE: 'Revisa tu correo',
  SUCCESS_DESCRIPTION:
    'Si el correo está registrado, recibirás un enlace de recuperación en tu bandeja de entrada.',
  ERROR_TITLE: 'Error',
} as const;

export const FORGOT_PASSWORD_ERROR_MESSAGES = {
  GENERAL: 'No se pudo enviar el correo de recuperación. Por favor intenta de nuevo.',
  INVALID_EMAIL: 'El correo electrónico no es válido.',
  TOO_MANY_REQUESTS: 'Demasiados intentos. Por favor espera un momento e intenta de nuevo.',
} as const;

export const FORGOT_PASSWORD_SUCCESS_MESSAGES = {
  EMAIL_SENT:
    'Si el correo está registrado, recibirás un enlace de recuperación.',
} as const;
