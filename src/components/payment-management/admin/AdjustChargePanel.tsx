import { useState } from 'react';
import { useAlert } from '@hooks/useAlert';
import { useAdjustChargeMutation } from '@hooks/usePaymentManagement';
import { Button, FormInput } from '@shared/ui';

export function AdjustChargePanel() {
  const alert = useAlert();
  const { adjust, isPending } = useAdjustChargeMutation();
  const [form, setForm] = useState({ chargeId: '', newAmount: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const chargeId = parseInt(form.chargeId);
    const newAmount = parseFloat(form.newAmount);

    if (isNaN(chargeId) || chargeId < 1) {
      alert.error('Error', 'El ID del cargo debe ser válido');
      return;
    }
    if (isNaN(newAmount) || newAmount < 0) {
      alert.error('Error', 'El nuevo monto debe ser mayor o igual a 0');
      return;
    }

    try {
      const result = await adjust(chargeId, { new_amount: newAmount });
      const diffText = result.difference > 0 ? 'aumento' : 'disminución';
      alert.success(
        'Cargo ajustado',
        `Cargo de casa ${result.houseId}: ${diffText} de $${Math.abs(result.difference).toLocaleString('es-MX', { minimumFractionDigits: 2 })}. Nuevo monto: $${result.newAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
      );
      setForm({ chargeId: '', newAmount: '' });
    } catch (error) {
      console.error('Error adjusting charge:', error);
      alert.error('Error', 'No se pudo ajustar el cargo. Verifica las restricciones (3 meses, no bajar de lo pagado).');
    }
  };

  return (
    <div className="bg-secondary shadow-lg rounded-lg border-4 border-primary/10 p-6">
      <div className="mb-4 p-4 border-l-4 border-info rounded-lg">
        <h3 className="text-lg font-bold text-info mb-2 flex items-center gap-2">
          <span className="text-2xl">📝</span>
          3. Ajustar Monto de Cargo
        </h3>
        <p className="text-sm text-foreground-secondary">
          Modifica el monto esperado de un cargo. Restricción: períodos de los últimos 3 meses, no bajar de lo pagado.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput id="adjust-charge-id" label="ID del Cargo" type="number" value={form.chargeId}
            onChange={(v) => setForm({ ...form, chargeId: v })} placeholder="Ej: 250" min={1} required />
          <FormInput id="adjust-new-amount" label="Nuevo Monto ($)" type="number" value={form.newAmount}
            onChange={(v) => setForm({ ...form, newAmount: v })} placeholder="Ej: 900.00" min="0" required />
        </div>
        <Button type="submit" variant="info" disabled={isPending} isLoading={isPending}>
          {isPending ? 'Procesando...' : 'Ajustar Cargo'}
        </Button>
      </form>
    </div>
  );
}
