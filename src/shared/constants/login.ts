/**
 * Login Constants
 * Messages and validation constants for login page
 */

export const LOGIN_ERROR_MESSAGES = {
  GENERAL: 'No se pudo completar el inicio de sesión. Por favor intenta de nuevo.',
  OAUTH_INIT_FAILED: 'No se pudo iniciar el login con OAuth. Por favor intenta de nuevo.',
  AUTH_ERROR: 'Error de autenticación',
} as const;

export const LOGIN_UI_TEXTS = {
  PAGE_TITLE: '🔐 Iniciar Sesión',
  EMAIL_LABEL: 'Correo Electrónico',
  EMAIL_PLACEHOLDER: 'ejemplo@correo.com',
  PASSWORD_LABEL: 'Contraseña',
  PASSWORD_PLACEHOLDER: 'Ingresa tu contraseña',
  SUBMIT_BUTTON_IDLE: '🔓 Entrar',
  SUBMIT_BUTTON_LOADING: 'Entrando...',
  OAUTH_DIVIDER: 'O continúa con email',
  HOME_LINK: 'Volver al inicio',
  SIGNUP_LINK: '✍️ Crear una cuenta',
  ERROR_TITLE: 'Error de autenticación',
  FORGOT_PASSWORD_LINK: '¿Olvidaste tu contraseña?',
  // OAuth house number step
  OAUTH_HOUSE_NUMBER_TITLE: 'Completa tu registro',
  OAUTH_HOUSE_NUMBER_SUBTITLE: 'Indica el número de tu casa en el condominio (opcional).',
  OAUTH_HOUSE_NUMBER_SUBMIT_IDLE: 'Continuar',
  OAUTH_HOUSE_NUMBER_SUBMIT_LOADING: 'Registrando...',
  OAUTH_HOUSE_NUMBER_SKIP: 'Omitir por ahora',
} as const;
