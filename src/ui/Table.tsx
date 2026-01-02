import React from 'react';

export interface TableColumn<T = any> {
  id: string;
  header: string;
  render: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
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
}

const headerVariantStyles: Record<string, string> = {
  default: 'bg-gray-200 dark:bg-gray-700',
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

export function Table<T = any>({
  columns,
  data,
  keyField = (row, idx) => idx,
  rowClassName,
  headerClassName = 'sticky top-0',
  maxHeight,
  emptyMessage = 'No hay datos disponibles',
  hoverable = true,
  striped = false,
  stickyHeader = true,
  variant = 'default',
  headerVariant = 'default',
}: TableProps<T>) {
  const getRowKey = (row: T, index: number): string | number => {
    if (typeof keyField === 'function') {
      return keyField(row, index);
    }
    return (row as any)[keyField] ?? index;
  };

  const getRowClassName = (row: T, index: number): string => {
    let classes = variantPadding[variant];

    if (striped && index % 2 === 1) {
      classes += ' bg-secondary';
    }

    if (hoverable) {
      classes += ' hover:bg-base transition-colors cursor-pointer';
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

  return (
    <div className={containerClasses}>
      <div className={tableWrapperClasses}>
        <table className="min-w-full border-collapse">
          <thead className={`${headerVariantStyles[headerVariant]} ${stickyHeader ? headerClassName : ''}`}>
            <tr className="border-b border-base">
              {columns.map((column) => (
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
            </tr>
          </thead>
          <tbody className="divide-y divide-base">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className={`${variantPadding[variant]} text-center text-foreground-secondary`}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={getRowKey(row, idx)}
                  className={`divide-x divide-base ${getRowClassName(row, idx)}`}
                >
                  {columns.map((column) => (
                    <td
                      key={`${getRowKey(row, idx)}-${column.id}`}
                      className={`
                        ${alignmentClasses[column.align || 'left']}
                        ${column.className || ''}
                      `}
                    >
                      {column.render(row, idx)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
