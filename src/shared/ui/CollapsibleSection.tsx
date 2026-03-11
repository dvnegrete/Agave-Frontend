import { useState } from 'react';
import type { ReactNode } from 'react';

type BorderColor = 'error' | 'warning' | 'success' | 'info' | 'primary';

const borderStyles: Record<BorderColor, { outer: string; header: string; hover: string }> = {
  error:   { outer: 'border-error',   header: 'border-error',   hover: 'hover:bg-error/15'   },
  warning: { outer: 'border-warning', header: 'border-warning', hover: 'hover:bg-warning/15' },
  success: { outer: 'border-success', header: 'border-success', hover: 'hover:bg-success/15' },
  info:    { outer: 'border-info',    header: 'border-info',    hover: 'hover:bg-info/15'    },
  primary: { outer: 'border-primary', header: 'border-primary', hover: 'hover:bg-primary/15' },
};

interface CollapsibleSectionProps {
  title: string;
  subtitle?: ReactNode;
  badge?: number;
  borderColor?: BorderColor;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function CollapsibleSection({
  title,
  subtitle,
  badge,
  borderColor = 'primary',
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const styles = borderStyles[borderColor];

  return (
    <div className={`shadow-lg rounded-lg border-2 ${styles.outer} overflow-hidden`}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full ${styles.hover} transition-colors px-6 py-4 flex justify-between items-center border-b ${styles.header}`}
      >
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-bold">{title}</h2>
          <div className="flex items-center gap-2">
            {badge !== undefined && (
              <span className="text-sm text-foreground-secondary">{badge}</span>
            )}
            {subtitle && (
              <div className="text-sm text-foreground-secondary">{subtitle}</div>
            )}
          </div>
        </div>
        <span className="text-lg ml-4">{isOpen ? '▼' : '▶'}</span>
      </button>

      {isOpen && <div className="p-6">{children}</div>}
    </div>
  );
}
