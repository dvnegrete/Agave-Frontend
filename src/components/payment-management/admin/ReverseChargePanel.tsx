import { useState } from 'react';
import { useAlert } from '@hooks/useAlert';
import { useReverseChargeMutation } from '@hooks/usePaymentManagement';
import { Button, FormInput } from '@shared/ui';

export function ReverseChargePanel() {
  const alert = useAlert();
  const { reverse, isPending } = useReverseChargeMutation();
  const [form, setForm] = useState({ chargeId: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const chargeId = parseInt(form.chargeId);

    if (isNaN(chargeId) || chargeId < 1) {
      alert.error('Error', 'El ID del cargo debe ser válido');
      return;
    }

    try {
      const result = await reverse(chargeId);
      alert.success('Cargo reversado', result.message);
      setForm({ chargeId: '' });
    } catch (error) {
      console.error('Error reversing charge:', error);
      alert.error('Error', 'No se pudo reversar el cargo. Verifica que no tenga pagos asignados y no sea de más de 3 meses.');
    }
  };

  return (
    <div className="bg-secondary shadow-lg rounded-lg border-4 border-primary/10 p-6">
      <div className="mb-4 p-4 border-l-4 border-error rounded-lg">
        <h3 className="text-lg font-bold text-error mb-2 flex items-center gap-2">
          <span className="text-2xl">🗑️</span>
          4. Reversar (Eliminar) Cargo
        </h3>
        <p className="text-sm text-foreground-secondary">
          Elimina un cargo que fue creado erróneamente. Solo si no tiene pagos asignados ni es de más de 3 meses.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput id="reverse-charge-id" label="ID del Cargo" type="number" value={form.chargeId}
            onChange={(v) => setForm({ chargeId: v })} placeholder="Ej: 250" min={1} required />
        </div>
        <Button type="submit" variant="error" disabled={isPending} isLoading={isPending}>
          {isPending ? 'Procesando...' : 'Reversar Cargo'}
        </Button>
      </form>
    </div>
  );
}
