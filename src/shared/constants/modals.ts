/**
 * Modal Messages and Constants
 * Centralized messages and titles for all modals
 */

export const MODAL_MESSAGES = {
  ASSIGN_HOUSE: {
    TITLE: '🏠 Asignar Casa',
    DESCRIPTION: 'Asigna una casa a',
  },
  ASSIGN_DEPOSIT: {
    TITLE: '🏠 Asignar Depósito a Casa',
    DESCRIPTION: 'Asigna este depósito a una casa del condominio',
  },
  EDIT_ROLE: {
    TITLE: '👑 Cambiar Rol',
    DESCRIPTION: 'Cambia el rol para',
  },
  EDIT_STATUS: {
    TITLE: '🔄 Cambiar Estado',
    DESCRIPTION: 'Cambia el estado para',
  },
  EDIT_OBSERVATIONS: {
    TITLE: '📝 Editar Observaciones',
    DESCRIPTION: 'Actualiza las observaciones para',
  },
  ERRORS: {
    INVALID_HOUSE: 'Por favor ingresa un número de casa válido',
    HOUSE_ALREADY_ASSIGNED: 'Este usuario ya tiene asignada esta casa',
    MAX_OWNERS_REACHED: 'Esta casa ya tiene 2 propietarios asignados. Debes desasignar a uno antes de asignar a este usuario.',
    REQUIRED_ROLE: 'Por favor selecciona un rol',
    REQUIRED_STATUS: 'Por favor selecciona un estado',
    SAVE_FAILED: 'Error al guardar los cambios',
  },
} as const;
