import React, { useState, useCallback, createContext } from 'react';
import { AlertDialog, type AlertVariant, type AlertConfig } from '@shared/ui/AlertDialog';

interface AlertPayload {
  title: string;
  message: string;
  variant: AlertVariant;
  autoClose?: boolean;
  duration?: number;
  onConfirm?: () => void;
  showConfirmButton?: boolean;
  confirmButtonText?: string;
}

interface AlertContextType {
  addAlert: (alert: AlertPayload) => void;
}

export const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<AlertConfig[]>([]);

  const addAlert = useCallback((alert: AlertPayload) => {
    const id = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setAlerts((prev) => [
      ...prev,
      {
        id,
        ...alert,
      },
    ]);
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ addAlert }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-3 pointer-events-none">
        {alerts.map((alert) => (
          <div key={alert.id} className="pointer-events-auto">
            <AlertDialog {...alert} onClose={removeAlert} />
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
}
