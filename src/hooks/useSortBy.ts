import { useState, useMemo } from 'react';

export type SortField = 'number_house' | 'amount' | 'date' | 'confirmation_status';
export type SortOrder = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  order: SortOrder;
}

interface UseSortByOptions {
  initialField?: SortField;
  initialOrder?: SortOrder;
}

interface UseSortByReturn<T extends Record<string, unknown>> {
  sortedItems: T[];
  sortConfig: SortConfig;
  setSortField: (field: SortField) => void;
  setSort: (field: SortField, order: SortOrder) => void;
  resetSort: () => void;
}

/**
 * Hook para ordenar una lista de elementos
 * Soporta diferentes campos y direcciones de ordenamiento
 *
 * @param items - Array de elementos a ordenar
 * @param options - Configuración inicial (campo y dirección)
 * @returns Object con items ordenados, configuración actual y funciones de cambio
 */
export function useSortBy<T extends Record<string, unknown>>(
  items: T[],
  options?: UseSortByOptions
): UseSortByReturn<T> {
  const initialField: SortField = options?.initialField || 'number_house';
  const initialOrder: SortOrder = options?.initialOrder || 'asc';

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: initialField,
    order: initialOrder,
  });

  // Ordenar items basado en la configuración actual
  const sortedItems = useMemo(() => {
    if (!items || items.length === 0) return [];

    const sorted = [...items].sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];

      // Manejar valores nulos/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Comparar valores
      let comparison = 0;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        comparison = aValue === bValue ? 0 : aValue ? 1 : -1;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      // Aplicar dirección
      return sortConfig.order === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [items, sortConfig]);

  /**
   * Cambiar el campo de ordenamiento
   * Si es el mismo campo, alterna entre ASC y DESC
   * Si es un campo diferente, ordena en ASC
   */
  const setSortField = (field: SortField) => {
    setSortConfig((current) => ({
      field,
      order:
        current.field === field && current.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  /**
   * Establecer orden directamente
   */
  const setSort = (field: SortField, order: SortOrder) => {
    setSortConfig({ field, order });
  };

  /**
   * Resetear al orden inicial
   */
  const resetSort = () => {
    setSortConfig({
      field: initialField,
      order: initialOrder,
    });
  };

  return {
    sortedItems,
    sortConfig,
    setSortField,
    setSort,
    resetSort,
  };
}
