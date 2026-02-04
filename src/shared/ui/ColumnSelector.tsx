export interface ColumnOption {
  id: string;
  label: string;
}

interface ColumnSelectorProps {
  availableColumns: ColumnOption[];
  visibleColumns: string[];
  onVisibleColumnsChange: (columnIds: string[]) => void;
  isExpanded: boolean;
  onToggleExpand: (expanded: boolean) => void;
}

export function ColumnSelector({
  availableColumns,
  visibleColumns,
  onVisibleColumnsChange,
  isExpanded,
  onToggleExpand,
}: ColumnSelectorProps) {
  const handleColumnToggle = (columnId: string) => {
    if (visibleColumns.includes(columnId)) {
      onVisibleColumnsChange(visibleColumns.filter((id) => id !== columnId));
    } else {
      onVisibleColumnsChange([...visibleColumns, columnId]);
    }
  };

  return (
    <div className="bg-secondary border border-base rounded-lg mb-8 shadow-lg">
      {/* Header con botón de toggle */}
      <div className="flex items-center justify-between p-6">
        <h2 className="text-lg font-semibold text-foreground">⚙️ Columnas</h2>
        <button
          onClick={() => onToggleExpand(!isExpanded)}
          className="px-4 py-2 bg-primary text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
        >
          {isExpanded ? '▼ Ocultar' : '▶ Mostrar'}
        </button>
      </div>

      {/* Grid de columnas */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          isExpanded ? 'opacity-100 visible' : 'hidden opacity-100'
        }`}
      >
        <div className="p-6 pt-0 lg:pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableColumns.map((column) => (
            <div key={column.id} className="flex items-center">
              <label className="flex items-center gap-3 cursor-pointer w-full">
                <input
                  type="checkbox"
                  checked={visibleColumns.includes(column.id)}
                  onChange={() => handleColumnToggle(column.id)}
                  className="w-4 h-4 rounded accent-primary"
                />
                <span className="text-sm font-semibold text-foreground">{column.label}</span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
