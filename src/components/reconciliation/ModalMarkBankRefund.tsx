import { useState, useEffect } from 'react';
import { Modal, FormTextarea, ErrorAlert, ModalActions, InfoCard } from '@shared/ui';
import { useBankRefundMutations, useAlert } from '@hooks/index';
import { useFormatDate as formatDate } from '@hooks/useFormatDate';
import { formatCurrency } from '@/utils/formatters';

/** Datos mínimos del depósito (compatible con ambas listas de depósitos no reclamados) */
export interface BankRefundDeposit {
  transactionBankId: string;
  amount: number;
  date: string | Date;
  concept?: string | null;
}

interface ModalMarkBankRefundProps {
  deposit: BankRefundDeposit | null;
  onClose: () => void;
  onMarked?: () => void;
}

/**
 * Confirma que un depósito no reclamado es una devolución del banco
 * (cargo no reconocido, transferencia fallida). El depósito sale de
 * no reclamados y aparece como entrada en el Informe de Gastos.
 */
export function ModalMarkBankRefund({ deposit, onClose, onMarked }: ModalMarkBankRefundProps) {
  const alert = useAlert();
  const { markBankRefund, marking } = useBankRefundMutations();
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (deposit) {
      setNotes('');
      setError(null);
    }
  }, [deposit]);

  if (!deposit) return null;

  const handleConfirm = async (): Promise<void> => {
    setError(null);
    try {
      await markBankRefund(deposit.transactionBankId, notes.trim() || undefined);
      alert.success('Devolución registrada', 'El depósito se mostrará como entrada en el Informe de Gastos');
      onMarked?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo marcar el depósito como devolución');
    }
  };

  const dateString = typeof deposit.date === 'string' ? deposit.date : deposit.date.toISOString();

  return (
    <Modal isOpen={!!deposit} onClose={onClose} title="↩ Marcar como devolución bancaria" maxWidth="sm">
      <p className="text-sm text-foreground-secondary mb-6">
        Usa esta opción cuando el depósito no es un pago de una casa, sino una devolución del banco
        (cargo no reconocido, transferencia fallida, etc.). Saldrá de depósitos no reclamados y se
        mostrará en el Informe de Gastos como entrada, restando del Gasto Total. Se puede revertir
        desde el Informe de Gastos.
      </p>

      <InfoCard
        items={[
          { label: 'Monto:', value: `$${formatCurrency(deposit.amount)}`, className: 'text-success' },
          { label: 'Fecha:', value: formatDate(dateString) },
          { label: 'Concepto:', value: deposit.concept || 'N/A' },
        ]}
      />

      <ErrorAlert message={error} />

      <div className="mb-6">
        <FormTextarea
          id="bank-refund-notes"
          label="Notas"
          value={notes}
          onChange={setNotes}
          placeholder="Ej: Devolución por cargo no reconocido"
          rows={3}
          optional={true}
        />
      </div>

      <ModalActions
        onCancel={onClose}
        onConfirm={handleConfirm}
        isLoading={marking}
        confirmText="Marcar como devolución"
      />
    </Modal>
  );
}
