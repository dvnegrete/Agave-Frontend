import { useState } from 'react';
import { useAlert } from '@hooks/useAlert';
import { useCondonePenaltyMutation } from '@hooks/usePaymentManagement';
import { Button, FormInput } from '@shared/ui';

export function CondonePenaltyPanel() {
  const alert = useAlert();
  const { condone, isPending } = useCondonePenaltyMutation();
  const [form, setForm] = useState({ houseId: '', periodId: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const houseId = parseInt(form.houseId);
    const periodId = parseInt(form.periodId);

    if (isNaN(houseId) || houseId < 1 || houseId > 66) {
      alert.error('Error', 'El número de casa debe estar entre 1 y 66');
      return;
    }
    if (isNaN(periodId) || periodId < 1) {
      alert.error('Error', 'El ID del período debe ser válido');
      return;
    }

    try {
      const result = await condone(houseId, periodId);
      alert.success('Penalidad condonada', result.message);
      setForm({ houseId: '', periodId: '' });
    } catch (error) {
      console.error('Error condoning penalty:', error);
      alert.error('Error', 'No se pudo condonar la penalidad. Verifica que no esté pagada.');
    }
  };

  return (
    <div className="bg-secondary shadow-lg rounded-lg border-4 border-primary/10 p-6">
      <div className="mb-4 p-4 border-l-4 border-warning rounded-lg">
        <h3 className="text-lg font-bold text-warning mb-2 flex items-center gap-2">
          <span className="text-2xl">🎁</span>
          2. Condonar Penalidad
        </h3>
        <p className="text-sm text-foreground-secondary">
          Elimina la penalidad de una casa en un período. Solo si no ha sido pagada.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput id="condone-house-id" label="Casa" type="number" value={form.houseId}
            onChange={(v) => setForm({ ...form, houseId: v })} placeholder="Ej: 15" min={1} max={66} required />
          <FormInput id="condone-period-id" label="ID del Período" type="number" value={form.periodId}
            onChange={(v) => setForm({ ...form, periodId: v })} placeholder="Ej: 12" min={1} required />
        </div>
        <Button type="submit" variant="warning" disabled={isPending} isLoading={isPending}>
          {isPending ? 'Procesando...' : 'Condonar Penalidad'}
        </Button>
      </form>
    </div>
  );
}
