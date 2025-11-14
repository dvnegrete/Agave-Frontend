/**
 * Hook para formatear fechas de PostgreSQL a formato legible en español
 * Convierte "2025-09-05T00:00:00.000Z" a "05-septiembre-2025"
 */

const MESES_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/**
 * Formatea una fecha de PostgreSQL al formato: DD-mes-YYYY
 * @param dateString - Fecha en formato ISO string (ej: "2025-09-05T00:00:00.000Z")
 * @returns Fecha formateada (ej: "05-septiembre-2025") o "Fecha inválida" si hay error
 */
export const useFormatDate = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return 'N/A';
  }

  try {
    const date = new Date(dateString);

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }

    const dia = date.getDate().toString().padStart(2, '0');
    const mes = MESES_ES[date.getMonth()];
    const anio = date.getFullYear();

    return `${dia}-${mes}-${anio}`;
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha inválida';
  }
};

/**
 * Formatea una fecha de PostgreSQL al formato corto: DD/MM/YYYY
 * @param dateString - Fecha en formato ISO string
 * @returns Fecha formateada (ej: "05/09/2025") o "N/A" si hay error
 */
export const useFormatDateShort = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return 'N/A';
  }

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }

    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const anio = date.getFullYear();

    return `${dia}/${mes}/${anio}`;
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha inválida';
  }
};
