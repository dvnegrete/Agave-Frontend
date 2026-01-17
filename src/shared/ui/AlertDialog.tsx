import { useEffect } from 'react';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AlertConfig {
  id: string;
  title: string;
  message: string;
  variant: AlertVariant;
  autoClose?: boolean;
  duration?: number;
  onConfirm?: () => void;
  showConfirmButton?: boolean;
  confirmButtonText?: string;
}

interface AlertDialogProps extends AlertConfig {
  onClose: (id: string) => void;
}

const variantStyles: Record<AlertVariant, { bg: string; border: string; text: string; icon: string }> = {
  success: {
    bg: 'bg-success/10',
    border: 'border-success',
    text: 'text-success',
    icon: '✅',
  },
  error: {
    bg: 'bg-error/10',
    border: 'border-error',
    text: 'text-error',
    icon: '❌',
  },
  warning: {
    bg: 'bg-warning/10',
    border: 'border-warning',
    text: 'text-warning',
    icon: '⚠️',
  },
  info: {
    bg: 'bg-info/10',
    border: 'border-info',
    text: 'text-info',
    icon: 'ℹ️',
  },
};

export function AlertDialog({
  id,
  title,
  message,
  variant,
  autoClose = true,
  duration = 4000,
  onConfirm,
  showConfirmButton = false,
  confirmButtonText = 'Aceptar',
  onClose,
}: AlertDialogProps) {
  const styles = variantStyles[variant];

  useEffect(() => {
    if (autoClose && !showConfirmButton) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, autoClose, duration, showConfirmButton, onClose]);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose(id);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in"
      role="dialog"
      aria-labelledby={`alert-title-${id}`}
      aria-describedby={`alert-message-${id}`}
    >
      <div className="animate-in zoom-in-95 slide-in-from-bottom-4 bg-secondary border-2 rounded-lg shadow-xl max-w-sm w-full">
        <div className={`flex items-start gap-4 p-6 border-l-4 ${styles.bg} ${styles.border}`}>
          <span className="text-2xl flex-shrink-0">{styles.icon}</span>

          <div className="flex-1">
            <h3 id={`alert-title-${id}`} className={`text-lg font-bold mb-2 ${styles.text}`}>
              {title}
            </h3>
            <p id={`alert-message-${id}`} className={`text-sm ${styles.text}`}>
              {message}
            </p>
          </div>

          {!showConfirmButton && (
            <button
              onClick={() => onClose(id)}
              className={`flex-shrink-0 ${styles.text} hover:opacity-80 transition-opacity`}
              type="button"
              aria-label="Cerrar alerta"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {showConfirmButton && (
          <div className="flex gap-3 px-6 py-4 border-t border-base">
            <button
              onClick={() => onClose(id)}
              className="flex-1 px-4 py-2 bg-base border border-base rounded-lg text-foreground hover:bg-tertiary transition-colors font-medium"
              type="button"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors
                ${
                  variant === 'success'
                    ? 'bg-success hover:bg-success/80'
                    : variant === 'error'
                      ? 'bg-error hover:bg-error/80'
                      : variant === 'warning'
                        ? 'bg-warning hover:bg-warning/80'
                        : 'bg-info hover:bg-info/80'
                }`}
              type="button"
            >
              {confirmButtonText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
