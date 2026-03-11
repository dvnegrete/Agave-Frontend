import { useState } from 'react';
import { useAlert } from '@hooks/useAlert';
import { useInitialBalanceMutation } from '@hooks/usePaymentManagement';
import { Button, FormInput } from '@shared/ui';

export function InitialBalancePanel() {
  const alert = useAlert();
  const { setBalance, isPending } = useInitialBalanceMutation();
  const [form, setForm] = useState({ houseId: '', amount: '', reason: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const houseId = parseInt(form.houseId);
    const amount = parseFloat(form.amount);

    if (isNaN(houseId) || houseId < 1 || houseId > 66) {
      alert.error('Error', 'El número de casa debe estar entre 1 y 66');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      alert.error('Error', 'El monto debe ser mayor a 0');
      return;
    }

    try {
      const result = await setBalance(houseId, {
        amount,
        reason: form.reason || 'Saldo inicial - pagos pre-sistema',
      });
      alert.success(
        'Crédito asignado',
        `Se asignó $${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} a la casa ${houseId}. Se cubrieron ${result.credit_distribution.periods_covered} períodos completos.`
      );
      setForm({ houseId: '', amount: '', reason: '' });
    } catch (error) {
      console.error('Error setting initial balance:', error);
      alert.error('Error', 'No se pudo asignar el crédito inicial. Intenta de nuevo.');
    }
  };

  return (
    <div className="bg-secondary shadow-lg rounded-lg border-4 border-primary/10 p-6">
      <div className="mb-4 p-4 border-l-4 border-info rounded-lg">
        <h3 className="text-lg font-bold text-info mb-2 flex items-center gap-2">
          <span className="text-2xl">💰</span>
          1. Asignar Crédito Inicial (Pagos Pre-Sistema)
        </h3>
        <p className="text-sm text-foreground-secondary">
          Para casas que pagaron antes de que el sistema existiera. El crédito se distribuye automáticamente en FIFO.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput id="initial-house-id" label="Casa" type="number" value={form.houseId}
            onChange={(v) => setForm({ ...form, houseId: v })} placeholder="Ej: 15" min={1} max={66} required />
          <FormInput id="initial-amount" label="Monto ($)" type="number" value={form.amount}
            onChange={(v) => setForm({ ...form, amount: v })} placeholder="Ej: 4800.00" min="1" required />
          <FormInput id="initial-reason" label="Razón" type="text" value={form.reason}
            onChange={(v) => setForm({ ...form, reason: v })} placeholder="6 meses pre-sistema" optional required={false} />
        </div>
        <Button type="submit" variant="primary" disabled={isPending} isLoading={isPending}>
          {isPending ? 'Procesando...' : 'Asignar Crédito'}
        </Button>
      </form>
    </div>
  );
}
