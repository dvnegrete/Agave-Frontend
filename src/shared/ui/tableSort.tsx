import type React from 'react';

export interface TableSortConfig {
  field: string;
  order: 'asc' | 'desc';
}

export const SORTABLE_HEADER_CLASSES = 'cursor-pointer select-none hover:opacity-80 transition-opacity';

/**
 * Indicador ▲/▼ para la columna ordenada actualmente; ⇅ tenue para las demás
 */
export function getSortIndicator(field: string, sortConfig?: TableSortConfig): React.ReactNode {
  if (sortConfig?.field === field) {
    return <span className="ml-1">{sortConfig.order === 'asc' ? '▲' : '▼'}</span>;
  }
  return <span className="ml-1 opacity-40">⇅</span>;
}
