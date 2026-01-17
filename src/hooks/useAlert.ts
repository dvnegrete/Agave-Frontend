import { useContext } from 'react';
import { AlertContext } from '@shared/context/AlertContext';
import type { AlertVariant } from '@shared/ui/AlertDialog';

interface ShowAlertOptions {
  autoClose?: boolean;
  duration?: number;
  onConfirm?: () => void;
  showConfirmButton?: boolean;
  confirmButtonText?: string;
}

export function useAlert() {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }

  const showAlert = (title: string, message: string, variant: AlertVariant = 'info', options: ShowAlertOptions = {}) => {
    context.addAlert({
      title,
      message,
      variant,
      autoClose: options.autoClose !== false,
      duration: options.duration || 4000,
      onConfirm: options.onConfirm,
      showConfirmButton: options.showConfirmButton || false,
      confirmButtonText: options.confirmButtonText || 'Aceptar',
    });
  };

  return {
    success: (title: string, message: string, options?: ShowAlertOptions) =>
      showAlert(title, message, 'success', options),
    error: (title: string, message: string, options?: ShowAlertOptions) =>
      showAlert(title, message, 'error', options),
    warning: (title: string, message: string, options?: ShowAlertOptions) =>
      showAlert(title, message, 'warning', options),
    info: (title: string, message: string, options?: ShowAlertOptions) =>
      showAlert(title, message, 'info', options),
  };
}
