import { describe, it, expect } from 'vitest';
import {
  useFormatDate,
  useFormatDateShort,
  useFormatTime,
  useFormatDateTime,
} from '../../src/hooks/useFormatDate';

describe('useFormatDate', () => {
  describe('useFormatDate', () => {
    it('should format valid date string to DD-mes-YYYY format', () => {
      // Usar nueva Date que se interprete correctamente
      const result = useFormatDate('2024-09-15T12:00:00.000Z');
      expect(result).toMatch(/15-septiembre-2024/);
    });

    it('should handle different months correctly', () => {
      expect(useFormatDate('2024-01-15T12:00:00.000Z')).toMatch(/15-enero-2024/);
      expect(useFormatDate('2024-12-25T12:00:00.000Z')).toMatch(/25-diciembre-2024/);
    });

    it('should pad day with leading zero', () => {
      const result = useFormatDate('2024-05-03T12:00:00.000Z');
      expect(result).toMatch(/03-mayo-2024/);
    });

    it('should return "N/A" for null or undefined', () => {
      expect(useFormatDate(null)).toBe('N/A');
      expect(useFormatDate(undefined)).toBe('N/A');
      expect(useFormatDate('')).toBe('N/A');
    });

    it('should return "Fecha inválida" for invalid date string', () => {
      expect(useFormatDate('invalid-date')).toMatch(/Fecha inv/);
      expect(useFormatDate('2024-13-45T00:00:00.000Z')).toMatch(/Fecha inv/);
    });
  });

  describe('useFormatDateShort', () => {
    it('should format valid date string to DD/MM/YYYY format', () => {
      const result = useFormatDateShort('2024-09-15T12:00:00.000Z');
      expect(result).toMatch(/15\/09\/2024/);
    });

    it('should pad day and month with leading zeros', () => {
      expect(useFormatDateShort('2024-01-03T12:00:00.000Z')).toMatch(/03\/01\/2024/);
      expect(useFormatDateShort('2024-05-08T12:00:00.000Z')).toMatch(/08\/05\/2024/);
    });

    it('should return "N/A" for null or undefined', () => {
      expect(useFormatDateShort(null)).toBe('N/A');
      expect(useFormatDateShort(undefined)).toBe('N/A');
      expect(useFormatDateShort('')).toBe('N/A');
    });

    it('should return "Fecha inválida" for invalid date string', () => {
      expect(useFormatDateShort('invalid-date')).toBe('Fecha inválida');
    });
  });

  describe('useFormatTime', () => {
    it('should format time correctly', () => {
      const result = useFormatTime('2024-01-01T14:30:45.000Z');
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('should pad hours, minutes and seconds with leading zeros', () => {
      const result1 = useFormatTime('2024-01-01T09:05:03.000Z');
      expect(result1).toMatch(/\d{2}:05:03/);
      const result2 = useFormatTime('2024-01-01T00:00:00.000Z');
      expect(result2).toMatch(/\d{2}:00:00/);
    });

    it('should return "N/A" for null or undefined', () => {
      expect(useFormatTime(null)).toBe('N/A');
      expect(useFormatTime(undefined)).toBe('N/A');
      expect(useFormatTime('')).toBe('N/A');
    });

    it('should return "Hora inválida" for invalid date string', () => {
      expect(useFormatTime('invalid-date')).toBe('Hora inválida');
    });
  });

  describe('useFormatDateTime', () => {
    it('should return object with all formatted values', () => {
      const result = useFormatDateTime('2024-09-15T14:30:45.000Z');

      expect(result.date).toMatch(/15-septiembre-2024/);
      expect(result.dateShort).toMatch(/15\/09\/2024/);
      expect(result.time).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('should handle null/undefined input', () => {
      const result = useFormatDateTime(null);

      expect(result).toEqual({
        date: 'N/A',
        dateShort: 'N/A',
        time: 'N/A',
      });
    });

    it('should handle invalid date input', () => {
      const result = useFormatDateTime('invalid-date');

      // Just check that all fields are error messages
      expect(result.date).toMatch(/inv/);
      expect(result.dateShort).toMatch(/inv/);
      expect(result.time).toMatch(/inv/);
    });
  });
});
