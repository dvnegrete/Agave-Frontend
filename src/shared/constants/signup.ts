/**
 * Signup Constants
 * Messages and validation constants for signup page
 */

export const SIGNUP_VALIDATION_MESSAGES = {
  NAME_AND_LAST_NAME_REQUIRED: 'Por favor ingresa tu nombre y apellido',
  PASSWORDS_DO_NOT_MATCH: 'Las contraseñas no coinciden',
  PASSWORD_MIN_LENGTH: 'La contraseña debe tener al menos 6 caracteres',
  MIN_PASSWORD_LENGTH: 6,
} as const;

export const SIGNUP_ERROR_MESSAGES = {
  EMAIL_ALREADY_EXISTS: 'Este correo electrónico ya está registrado. Por favor intenta con otro o inicia sesión.',
  INVALID_DATA: 'Los datos proporcionados no son válidos. Por favor verifica e intenta de nuevo.',
  REGISTRATION_FAILED: 'Error en el registro',
  REGISTRATION_PROCESS_ERROR: 'Error al procesar el registro. Por favor intenta de nuevo.',
} as const;

export const SIGNUP_SUCCESS_MESSAGES = {
  ACCOUNT_CREATED: '¡Cuenta creada exitosamente! 🎉',
  EMAIL_CONFIRMATION_REQUIRED: 'Por favor verifica tu correo electrónico para confirmar tu cuenta.',
  EMAIL_CONFIRMATION_FULL: (email: string) =>
    `${SIGNUP_SUCCESS_MESSAGES.ACCOUNT_CREATED}\n\n${SIGNUP_SUCCESS_MESSAGES.EMAIL_CONFIRMATION_REQUIRED}\n\nCorreo: ${email}\n\nUna vez confirmado, podrás iniciar sesión.`,
} as const;

export const SIGNUP_UI_TEXTS = {
  PAGE_TITLE: '✍️ Crear Cuenta',
  FIRST_NAME_LABEL: 'Nombre',
  FIRST_NAME_PLACEHOLDER: 'Tu nombre',
  LAST_NAME_LABEL: 'Apellido',
  LAST_NAME_PLACEHOLDER: 'Tu apellido',
  EMAIL_LABEL: 'Correo Electrónico',
  EMAIL_PLACEHOLDER: 'ejemplo@correo.com',
  PASSWORD_LABEL: 'Contraseña',
  PASSWORD_PLACEHOLDER: 'Mínimo 6 caracteres',
  CONFIRM_PASSWORD_LABEL: 'Confirmar Contraseña',
  CONFIRM_PASSWORD_PLACEHOLDER: 'Repite tu contraseña',
  SUBMIT_BUTTON: '📝 Crear Cuenta',
  ALREADY_HAVE_ACCOUNT: '¿Ya tienes cuenta?',
  LOGIN_LINK: 'Inicia sesión aquí',
  ERROR_TITLE: 'Error en el registro',
  HOUSE_NUMBER_LABEL: '🏠 Número de Casa',
  HOUSE_NUMBER_PLACEHOLDER: 'Ej: 5, 12, 45',
} as const;
