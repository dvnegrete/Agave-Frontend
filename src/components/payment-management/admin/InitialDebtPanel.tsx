import { useState } from 'react';
import { useAlert } from '@hooks/useAlert';
import { useInitialDebtMutation, usePeriodsQuery } from '@hooks/usePaymentManagement';
import { Button, FormInput } from '@shared/ui';

export function InitialDebtPanel() {
  const alert = useAlert();
  const { setDebt, isPending } = useInitialDebtMutation();
  const { periods } = usePeriodsQuery();
  const [form, setForm] = useState({
    houseId: '',
    periodId: '',
    conceptType: 'maintenance' as 'maintenance' | 'water' | 'extraordinary_fee' | 'penalties',
    amount: '',
    reason: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const houseId = parseInt(form.houseId);
    const periodId = parseInt(form.periodId);
    const amount = parseFloat(form.amount);

    if (isNaN(houseId) || houseId < 1 || houseId > 66) {
      alert.error('Error', 'El número de casa debe estar entre 1 y 66');
      return;
    }
    if (isNaN(periodId) || periodId < 1) {
      alert.error('Error', 'Debes seleccionar un período válido');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      alert.error('Error', 'El monto debe ser mayor a 0');
      return;
    }

    try {
      const result = await setDebt(houseId, {
        period_id: periodId,
        concept_type: form.conceptType,
        amount,
        reason: form.reason || undefined,
      });
      const actionText = result.action === 'created' ? 'registrada' : 'actualizada';
      alert.success(`Deuda ${actionText}`, result.message);
      setForm({ houseId: '', periodId: '', conceptType: 'maintenance', amount: '', reason: '' });
    } catch (error) {
      console.error('Error setting initial debt:', error);
      alert.error('Error', 'No se pudo registrar la deuda inicial. Verifica los datos.');
    }
  };

  return (
    <div className="bg-secondary shadow-lg rounded-lg border-4 border-primary/10 p-6">
      <div className="mb-4 p-4 border-l-4 border-warning rounded-lg">
        <h3 className="text-lg font-bold text-warning mb-2 flex items-center gap-2">
          <span className="text-2xl">📋</span>
          5. Asignar Deuda Inicial (Pre-Sistema)
        </h3>
        <p className="text-sm text-foreground-secondary">
          Registra una deuda que existía antes del sistema. Crea o actualiza el cargo esperado
          (house_period_charge) para el trío casa/período/concepto. Aparecerá en morosidad
          hasta que sea pagada.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput id="debt-house-id" label="Casa" type="number" value={form.houseId}
            onChange={(v) => setForm({ ...form, houseId: v })} placeholder="Ej: 47" min={1} max={66} required />

          <div className="flex flex-col gap-1">
            <label htmlFor="debt-period-id" className="text-sm font-medium text-foreground">Período</label>
            <select
              id="debt-period-id"
              value={form.periodId}
              onChange={(e) => setForm({ ...form, periodId: e.target.value })}
              className="border rounded-md px-3 py-2 bg-base text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Selecciona un período</option>
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {String(period['display_name'] ?? `${period.month}/${period.year}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="debt-concept-type" className="text-sm font-medium text-foreground">Concepto</label>
            <select
              id="debt-concept-type"
              value={form.conceptType}
              onChange={(e) => setForm({ ...form, conceptType: e.target.value as typeof form.conceptType })}
              className="border border-border rounded-md px-3 py-2 bg-base text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="maintenance">Mantenimiento</option>
              <option value="water">Agua</option>
              <option value="extraordinary_fee">Cuota Extraordinaria</option>
              <option value="penalties">Penalidades</option>
            </select>
          </div>
          <FormInput id="debt-amount" label="Monto ($)" type="number" value={form.amount}
            onChange={(v) => setForm({ ...form, amount: v })} placeholder="Ej: 600.00" min="0" required />
        </div>

        <FormInput id="debt-reason" label="Razón" type="text" value={form.reason}
          onChange={(v) => setForm({ ...form, reason: v })}
          placeholder="Ej: Cuota extraordinaria pendiente Ene 2025" optional required={false} />

        <Button type="submit" variant="warning" disabled={isPending} isLoading={isPending}>
          {isPending ? 'Procesando...' : 'Registrar Deuda'}
        </Button>
      </form>
    </div>
  );
}
