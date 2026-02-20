import { useState } from 'react';
import { Button, FormInput } from '@shared/ui';
import { useAlert } from '@hooks/useAlert';
import {
  useInitialBalanceMutation,
  useCondonePenaltyMutation,
  useAdjustChargeMutation,
  useReverseChargeMutation,
  useInitialDebtMutation,
  usePeriodsQuery,
} from '@hooks/usePaymentManagement';

export function AdminOperations() {
  const alert = useAlert();
  const { periods } = usePeriodsQuery();

  // State para cada operación
  const [initialBalanceForm, setInitialBalanceForm] = useState({
    houseId: '',
    amount: '',
    reason: '',
  });

  const [condonePenaltyForm, setCondonePenaltyForm] = useState({
    houseId: '',
    periodId: '',
  });

  const [adjustChargeForm, setAdjustChargeForm] = useState({
    chargeId: '',
    newAmount: '',
  });

  const [reverseChargeForm, setReverseChargeForm] = useState({
    chargeId: '',
  });

  const [initialDebtForm, setInitialDebtForm] = useState({
    houseId: '',
    periodId: '',
    conceptType: 'maintenance' as 'maintenance' | 'water' | 'extraordinary_fee' | 'penalties',
    amount: '',
    reason: '',
  });

  // Mutations
  const { setBalance, isPending: isSettingBalance } = useInitialBalanceMutation();
  const { condone, isPending: isCondoningPenalty } = useCondonePenaltyMutation();
  const { adjust, isPending: isAdjustingCharge } = useAdjustChargeMutation();
  const { reverse, isPending: isReversingCharge } = useReverseChargeMutation();
  const { setDebt, isPending: isSettingDebt } = useInitialDebtMutation();

  // Handlers
  const handleSetInitialBalance = async (e: React.FormEvent) => {
    e.preventDefault();

    const houseId = parseInt(initialBalanceForm.houseId);
    const amount = parseFloat(initialBalanceForm.amount);

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
        reason: initialBalanceForm.reason || 'Saldo inicial - pagos pre-sistema',
      });

      alert.success(
        'Crédito asignado',
        `Se asignó $${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} a la casa ${houseId}. Se cubrieron ${result.credit_distribution.periods_covered} períodos completos.`
      );

      setInitialBalanceForm({ houseId: '', amount: '', reason: '' });
    } catch (error) {
      console.error('Error setting initial balance:', error);
      alert.error('Error', 'No se pudo asignar el crédito inicial. Intenta de nuevo.');
    }
  };

  const handleCondonePenalty = async (e: React.FormEvent) => {
    e.preventDefault();

    const houseId = parseInt(condonePenaltyForm.houseId);
    const periodId = parseInt(condonePenaltyForm.periodId);

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
      setCondonePenaltyForm({ houseId: '', periodId: '' });
    } catch (error) {
      console.error('Error condoning penalty:', error);
      alert.error('Error', 'No se pudo condonar la penalidad. Verifica que no esté pagada.');
    }
  };

  const handleAdjustCharge = async (e: React.FormEvent) => {
    e.preventDefault();

    const chargeId = parseInt(adjustChargeForm.chargeId);
    const newAmount = parseFloat(adjustChargeForm.newAmount);

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
      setAdjustChargeForm({ chargeId: '', newAmount: '' });
    } catch (error) {
      console.error('Error adjusting charge:', error);
      alert.error('Error', 'No se pudo ajustar el cargo. Verifica las restricciones (3 meses, no bajar de lo pagado).');
    }
  };

  const handleReverseCharge = async (e: React.FormEvent) => {
    e.preventDefault();

    const chargeId = parseInt(reverseChargeForm.chargeId);

    if (isNaN(chargeId) || chargeId < 1) {
      alert.error('Error', 'El ID del cargo debe ser válido');
      return;
    }

    try {
      const result = await reverse(chargeId);
      alert.success('Cargo reversado', result.message);
      setReverseChargeForm({ chargeId: '' });
    } catch (error) {
      console.error('Error reversing charge:', error);
      alert.error('Error', 'No se pudo reversar el cargo. Verifica que no tenga pagos asignados y no sea de más de 3 meses.');
    }
  };

  const handleSetInitialDebt = async (e: React.FormEvent) => {
    e.preventDefault();

    const houseId = parseInt(initialDebtForm.houseId);
    const periodId = parseInt(initialDebtForm.periodId);
    const amount = parseFloat(initialDebtForm.amount);

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
        concept_type: initialDebtForm.conceptType,
        amount,
        reason: initialDebtForm.reason || undefined,
      });

      const actionText = result.action === 'created' ? 'registrada' : 'actualizada';
      alert.success(
        `Deuda ${actionText}`,
        result.message,
      );

      setInitialDebtForm({ houseId: '', periodId: '', conceptType: 'maintenance', amount: '', reason: '' });
    } catch (error) {
      console.error('Error setting initial debt:', error);
      alert.error('Error', 'No se pudo registrar la deuda inicial. Verifica los datos.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-secondary shadow-lg rounded-lg border-4 border-primary/10 p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          🔧 Operaciones Administrativas
        </h2>
        <p className="text-sm text-foreground-secondary">
          Herramientas para ajustar cargos, condonar penalidades y asignar saldos iniciales (pagos pre-sistema)
        </p>
      </div>

      {/* 1. Saldo Inicial */}
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

        <form onSubmit={handleSetInitialBalance} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              id="initial-house-id"
              label="Casa"
              type="number"
              value={initialBalanceForm.houseId}
              onChange={(value) => setInitialBalanceForm({ ...initialBalanceForm, houseId: value })}
              placeholder="Ej: 15"
              min={1}
              max={66}
              required
            />
            <FormInput
              id="initial-amount"
              label="Monto ($)"
              type="number"
              value={initialBalanceForm.amount}
              onChange={(value) => setInitialBalanceForm({ ...initialBalanceForm, amount: value })}
              placeholder="Ej: 4800.00"
              min="1"
              required
            />
            <FormInput
              id="initial-reason"
              label="Razón"
              type="text"
              value={initialBalanceForm.reason}
              onChange={(value) => setInitialBalanceForm({ ...initialBalanceForm, reason: value })}
              placeholder="6 meses pre-sistema"
              optional
              required={false}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={isSettingBalance}
            isLoading={isSettingBalance}
          >
            {isSettingBalance ? 'Procesando...' : 'Asignar Crédito'}
          </Button>
        </form>
      </div>

      {/* 2. Condonar Penalidad */}
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

        <form onSubmit={handleCondonePenalty} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              id="condone-house-id"
              label="Casa"
              type="number"
              value={condonePenaltyForm.houseId}
              onChange={(value) => setCondonePenaltyForm({ ...condonePenaltyForm, houseId: value })}
              placeholder="Ej: 15"
              min={1}
              max={66}
              required
            />
            <FormInput
              id="condone-period-id"
              label="ID del Período"
              type="number"
              value={condonePenaltyForm.periodId}
              onChange={(value) => setCondonePenaltyForm({ ...condonePenaltyForm, periodId: value })}
              placeholder="Ej: 12"
              min={1}
              required
            />
          </div>
          <Button
            type="submit"
            variant="warning"
            disabled={isCondoningPenalty}
            isLoading={isCondoningPenalty}
          >
            {isCondoningPenalty ? 'Procesando...' : 'Condonar Penalidad'}
          </Button>
        </form>
      </div>

      {/* 3. Ajustar Cargo */}
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

        <form onSubmit={handleAdjustCharge} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              id="adjust-charge-id"
              label="ID del Cargo"
              type="number"
              value={adjustChargeForm.chargeId}
              onChange={(value) => setAdjustChargeForm({ ...adjustChargeForm, chargeId: value })}
              placeholder="Ej: 250"
              min={1}
              required
            />
            <FormInput
              id="adjust-new-amount"
              label="Nuevo Monto ($)"
              type="number"
              value={adjustChargeForm.newAmount}
              onChange={(value) => setAdjustChargeForm({ ...adjustChargeForm, newAmount: value })}
              placeholder="Ej: 900.00"
              min="0"
              required
            />
          </div>
          <Button
            type="submit"
            variant="info"
            disabled={isAdjustingCharge}
            isLoading={isAdjustingCharge}
          >
            {isAdjustingCharge ? 'Procesando...' : 'Ajustar Cargo'}
          </Button>
        </form>
      </div>

      {/* 4. Reversar Cargo */}
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

        <form onSubmit={handleReverseCharge} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              id="reverse-charge-id"
              label="ID del Cargo"
              type="number"
              value={reverseChargeForm.chargeId}
              onChange={(value) => setReverseChargeForm({ chargeId: value })}
              placeholder="Ej: 250"
              min={1}
              required
            />
          </div>
          <Button
            type="submit"
            variant="error"
            disabled={isReversingCharge}
            isLoading={isReversingCharge}
          >
            {isReversingCharge ? 'Procesando...' : 'Reversar Cargo'}
          </Button>
        </form>
      </div>

      {/* 5. Asignar Deuda Inicial */}
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

        <form onSubmit={handleSetInitialDebt} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              id="debt-house-id"
              label="Casa"
              type="number"
              value={initialDebtForm.houseId}
              onChange={(value) => setInitialDebtForm({ ...initialDebtForm, houseId: value })}
              placeholder="Ej: 47"
              min={1}
              max={66}
              required
            />
            <div className="flex flex-col gap-1">
              <label htmlFor="debt-period-id" className="text-sm font-medium text-foreground">
                Período
              </label>
              <select
                id="debt-period-id"
                value={initialDebtForm.periodId}
                onChange={(e) => setInitialDebtForm({ ...initialDebtForm, periodId: e.target.value })}
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
              <label htmlFor="debt-concept-type" className="text-sm font-medium text-foreground">
                Concepto
              </label>
              <select
                id="debt-concept-type"
                value={initialDebtForm.conceptType}
                onChange={(e) =>
                  setInitialDebtForm({
                    ...initialDebtForm,
                    conceptType: e.target.value as typeof initialDebtForm.conceptType,
                  })
                }
                className="border border-border rounded-md px-3 py-2 bg-base text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="maintenance">Mantenimiento</option>
                <option value="water">Agua</option>
                <option value="extraordinary_fee">Cuota Extraordinaria</option>
                <option value="penalties">Penalidades</option>
              </select>
            </div>
            <FormInput
              id="debt-amount"
              label="Monto ($)"
              type="number"
              value={initialDebtForm.amount}
              onChange={(value) => setInitialDebtForm({ ...initialDebtForm, amount: value })}
              placeholder="Ej: 600.00"
              min="0.01"
              required
            />
          </div>

          <FormInput
            id="debt-reason"
            label="Razón"
            type="text"
            value={initialDebtForm.reason}
            onChange={(value) => setInitialDebtForm({ ...initialDebtForm, reason: value })}
            placeholder="Ej: Cuota extraordinaria pendiente Ene 2025"
            optional
            required={false}
          />

          <Button
            type="submit"
            variant="warning"
            disabled={isSettingDebt}
            isLoading={isSettingDebt}
          >
            {isSettingDebt ? 'Procesando...' : 'Registrar Deuda'}
          </Button>
        </form>
      </div>
    </div>
  );
}
