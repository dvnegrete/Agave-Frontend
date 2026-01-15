import React, { useState } from 'react';

export interface ExpandableTableColumn<T = unknown> {
  id: string;
  header: string;
  render: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  align?: 'left' | 'center' | 'right';
}

export interface ExpandableTableProps<T = unknown> {
  data: T[];
  mainColumns: ExpandableTableColumn<T>[]; // Columnas siempre visibles
  expandableColumns?: ExpandableTableColumn<T>[]; // Columnas que aparecen al expandir
  expandedContent?: (row: T, index: number) => React.ReactNode; // Contenido custom en fila expandida
  expandedRowLayout?: 'grid' | 'table'; // Cómo mostrar expandableColumns: grid (cards) o table (fila adicional)
  keyField?: string | ((row: T, index: number) => string | number);
  rowClassName?: string | ((row: T, index: number) => string);
  headerClassName?: string;
  maxHeight?: string;
  emptyMessage?: string;
  hoverable?: boolean;
  striped?: boolean;
  stickyHeader?: boolean;
  variant?: 'default' | 'compact' | 'spacious';
  headerVariant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  expandButtonLabel?: {
    expand: string;
    collapse: string;
  };
}

const headerVariantStyles: Record<string, string> = {
  default: 'bg-tertiary',
  primary: 'bg-primary/20',
  success: 'bg-success/20',
  warning: 'bg-warning/20',
  error: 'bg-error/20',
  info: 'bg-info/20',
};

const variantPadding: Record<string, string> = {
  default: 'px-4 py-3',
  compact: 'px-2 py-1',
  spacious: 'px-6 py-4',
};

const alignmentClasses: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

/**
 * Tabla expandible que permite mostrar columnas adicionales al hacer click en un botón
 * Reutiliza estilos y convenciones de Table.tsx
 * Soporta tres modos de expansión:
 * 1. expandedContent: contenido completamente custom (VoucherList)
 * 2. expandableColumns + expandedRowLayout='table': columnas como fila adicional (PaymentManagement)
 * 3. expandableColumns + expandedRowLayout='grid': columnas como grid de cards
 *
 * @example
 * // Modo custom (VoucherList)
 * <ExpandableTable
 *   data={items}
 *   mainColumns={[...]}
 *   expandedContent={(item) => (
 *     <div className="p-4">
 *       <p>Acciones personalizadas</p>
 *     </div>
 *   )}
 * />
 *
 * @example
 * // Modo tabla (PaymentManagement)
 * <ExpandableTable
 *   data={items}
 *   mainColumns={[...]}
 *   expandableColumns={[
 *     { id: 'currency', header: 'Moneda', render: (item) => item.currency }
 *   ]}
 *   expandedRowLayout="table"
 * />
 */
export function ExpandableTable<T = unknown>({
  data,
  mainColumns,
  expandableColumns = [],
  expandedContent,
  expandedRowLayout = 'grid',
  keyField = (_row, idx) => idx,
  rowClassName,
  headerClassName = 'sticky top-0',
  maxHeight,
  emptyMessage = 'No hay datos disponibles',
  hoverable = true,
  striped = false,
  stickyHeader = true,
  variant = 'default',
  headerVariant = 'default',
  expandButtonLabel = { expand: '▶ Ver detalles', collapse: '▼ Ocultar' },
}: ExpandableTableProps<T>): React.ReactNode {
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  const hasExpandableContent = expandableColumns.length > 0 || expandedContent;

  const getRowKey = (row: T, index: number): string | number => {
    if (typeof keyField === 'function') {
      return keyField(row, index);
    }
    if (typeof keyField === 'string') {
      const value = (row as Record<string, unknown>)[keyField];
      return (value as string | number | null | undefined) ?? index;
    }
    return index;
  };

  const toggleExpand = (id: string | number): void => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getRowClassName = (row: T, index: number, isExpanded: boolean): string | undefined => {
    let classes = variantPadding[variant];

    if (striped && index % 2 === 0) {
      classes += ' bg-secondary';
    }

    if (isExpanded) {
      classes += ' bg-primary/5 border-l-4 border-primary shadow-md transition-all duration-300';
    } else if (hoverable) {
      classes += ' hover:bg-base transition-colors';
    }

    if (typeof rowClassName === 'function') {
      return `${classes} ${rowClassName(row, index)}`;
    }

    return `${classes} ${rowClassName || ''}`;
  };

  const containerClasses = maxHeight
    ? `overflow-x-auto border rounded`
    : 'overflow-x-auto';

  const tableWrapperClasses = maxHeight
    ? `max-h-[${maxHeight}] overflow-y-auto`
    : '';

  const classesButtonExpanded = "font-bold cursor-pointer transition-all duration-300 hover:scale-110 px-3 py-1 rounded-lg hover:shadow-md";  

  return (
    <div className={containerClasses}>
      <div className={tableWrapperClasses}>
        <table className="min-w-full border-collapse">
          <thead className={`${headerVariantStyles[headerVariant]} ${stickyHeader ? headerClassName : ''}`}>
            <tr className="border-b border-base">
              {mainColumns.map((column) => (
                <th
                  key={column.id}
                  className={`
                    ${variantPadding[variant]}
                    text-xs font-bold text-foreground
                    ${alignmentClasses[column.align || 'left']}
                    ${column.headerClassName || ''}
                  `}
                >
                  {column.header}
                </th>
              ))}
              {hasExpandableContent && (
                <th
                  className={`
                    ${variantPadding[variant]}
                    text-xs font-bold text-foreground text-center
                  `}
                >
                  Opciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-base">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={mainColumns.length + (hasExpandableContent ? 1 : 0)}
                  className={`${variantPadding[variant]} text-center text-foreground-secondary`}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              <>
                {data.map((row, idx) => {
                  const rowKey = getRowKey(row, idx);
                  const isExpanded = expandedId === rowKey;

                  return (
                    <React.Fragment key={rowKey}>
                      <tr className={`divide-x divide-base ${getRowClassName(row, idx, isExpanded)}`}>
                        {mainColumns.map((column) => (
                          <td
                            key={`${rowKey}-${column.id}`}
                            className={`
                              ${alignmentClasses[column.align || 'center']}
                              ${column.className || 'px-3'}
                            `}
                          >
                            {column.render(row, idx)}
                          </td>
                        ))}
                        {hasExpandableContent && (
                          <td className={`${variantPadding[variant]} text-center`}>
                            <button
                              onClick={() => toggleExpand(rowKey)}
                              className={`${classesButtonExpanded} ${ !isExpanded 
                                    ? ' bg-info' 
                                    : 'bg-tertiary border border-info text-info'}`}
                            >
                              {isExpanded ? expandButtonLabel.collapse : expandButtonLabel.expand}
                            </button>
                          </td>
                        )}
                      </tr>
                      {isExpanded && hasExpandableContent && (
                        <tr key={`${rowKey}-expanded`} className="bg-tertiary">
                          {expandedContent ? (
                            // Modo custom: contenido personalizado (para VoucherList)
                            <td
                              colSpan={mainColumns.length + (hasExpandableContent ? 1 : 0)}
                              className={`${variantPadding[variant]}`}
                            >
                              {expandedContent(row, idx)}
                            </td>
                          ) : expandedRowLayout === 'table' ? (
                            // Modo tabla: mostrar expandableColumns como celdas adicionales (para PaymentManagement)
                            <>
                              {expandableColumns.map((column) => (
                                <td
                                  key={column.id}
                                  className={`
                                    ${variantPadding[variant]}
                                    ${alignmentClasses[column.align || 'left']}
                                    border-l border-base
                                    text-sm
                                  `}
                                >
                                  <span className='text-foreground-tertiary'>{column.header}: </span>
                                  {column.render(row, idx)}
                                </td>
                              ))}
                              <td className={`${variantPadding[variant]} border-l border-base`}></td>
                            </>
                          ) : (
                            // Modo grid: mostrar expandableColumns como cards (para futuros componentes)
                            <td
                              colSpan={mainColumns.length + (hasExpandableContent ? 1 : 0)}
                              className={`${variantPadding[variant]}`}
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {expandableColumns.map((column) => (
                                  <div key={column.id} className="bg-base rounded-lg p-4 border border-primary/10">
                                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
                                      {column.header}
                                    </p>
                                    <p className="text-sm text-foreground">{column.render(row, idx)}</p>
                                  </div>
                                ))}
                              </div>
                            </td>
                          )}
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
