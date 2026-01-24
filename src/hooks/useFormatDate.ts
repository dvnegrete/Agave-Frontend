/**
 * Hook para formatear fechas de PostgreSQL a formato legible en espa�ol
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

    const dia = date.getUTCDate().toString().padStart(2, '0');
    const mes = MESES_ES[date.getUTCMonth()];
    const anio = date.getUTCFullYear();

    return `${dia}-${mes}-${anio}`;
  } catch (err: unknown) {
    console.error('Error formateando fecha:', err);
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

    const dia = date.getUTCDate().toString().padStart(2, '0');
    const mes = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const anio = date.getUTCFullYear();

    return `${dia}/${mes}/${anio}`;
  } catch (err: unknown) {
    console.error('Error formateando fecha:', err);
    return 'Fecha inválida';
  }
};

/**
 * Formatea la hora de un ISO string en formato HH:MM:SS
 * @param dateString - Fecha en formato ISO string (ej: "2025-09-05T14:30:45.000Z")
 * @returns Hora formateada (ej: "14:30:45") o "N/A" si hay error
 */
export const useFormatTime = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return 'N/A';
  }

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return 'Hora inválida';
    }

    const horas = date.getUTCHours().toString().padStart(2, '0');
    const minutos = date.getUTCMinutes().toString().padStart(2, '0');
    const segundos = date.getUTCSeconds().toString().padStart(2, '0');

    return `${horas}:${minutos}:${segundos}`;
  } catch (err: unknown) {
    console.error('Error formateando hora:', err);
    return 'Hora inválida';
  }
};

interface FormattedDateTime {
  date: string;
  dateShort: string;
  time: string;
}

/**
 * Devuelve fecha y hora formateadas como objeto
 * @param dateString - Fecha en formato ISO string
 * @returns Objeto con propiedades date, time y dateShort
 */
export const useFormatDateTime = (dateString: string | null | undefined): FormattedDateTime => {
  return {
    date: useFormatDate(dateString),
    dateShort: useFormatDateShort(dateString),
    time: useFormatTime(dateString),
  };
};
