import { useFormatDate, useFormatDateShort } from '../../hooks/useFormatDate';

interface DateTimeCellProps {
  dateString: string | null | undefined;
  timeString: string | null | undefined; // Formato HH:MM:SS desde la API
  variant?: 'full' | 'compact'; // full: "05-septiembre-2025\n14:30:45", compact: "05/09/2025 14:30"
  showIcon?: boolean;
  className?: string;
}

/**
 * Componente reutilizable para mostrar fecha y hora de manera separada y elegante
 * Soporta dos variantes: full (con nombres de meses) y compact (formato corto)
 *
 * @example
 * // Variante full (por defecto)
 * <DateTimeCell dateString="2025-09-05T14:30:45.000Z" timeString="14:30:45" />
 * // Muestra: 05-septiembre-2025
 * //         14:30:45
 *
 * @example
 * // Variante compact
 * <DateTimeCell dateString="2025-09-05T14:30:45.000Z" timeString="14:30:45" variant="compact" />
 * // Muestra: 05/09/2025 14:30
 */
export function DateTimeCell({
  dateString,
  timeString,
  variant = 'full',
  showIcon = true,
  className = '',
}: DateTimeCellProps) {
  const date = useFormatDate(dateString);
  const dateShort = useFormatDateShort(dateString);

  // Validar que timeString sea válido, si no, usar "N/A"
  const time = timeString && timeString.trim() !== '' ? timeString : 'N/A';

  if (variant === 'compact') {
    // Mostrar solo HH:MM de la hora (primeros 5 caracteres de "HH:MM:SS")
    const displayTime = time !== 'N/A' ? time.substring(0, 5) : 'N/A';

    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {showIcon && <span className="text-gray-400">🕐</span>}
        <span className="font-mono text-sm">
          {dateShort} <span className="text-foreground-secondary">{displayTime}</span>
        </span>
      </div>
    );
  }

  // variant === 'full' (por defecto)
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-1">
        {showIcon && <span className="text-gray-400">📅</span>}
        <span className="text-sm font-medium">{date}</span>
      </div>
      <div className="flex items-center gap-1 pl-6">
        {showIcon && <span className="text-gray-400">🕐</span>}
        <span className="text-xs text-foreground-secondary font-mono">{time}</span>
      </div>
    </div>
  );
}
