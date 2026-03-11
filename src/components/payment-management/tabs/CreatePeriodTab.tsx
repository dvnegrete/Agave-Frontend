import { useState } from 'react';
import { usePeriodMutations, usePeriodConfigMutations } from '@hooks/usePaymentManagement';
import { useAlert } from '@hooks/useAlert';
import { Button, FormInput } from '@shared/ui';

interface CreatePeriodTabProps {
  onPeriodCreated: () => void;
}

export function CreatePeriodTab({ onPeriodCreated }: CreatePeriodTabProps) {
  const alert = useAlert();

  const [newYear, setNewYear] = useState<number>(new Date().getFullYear());
  const [newMonth, setNewMonth] = useState<number>(new Date().getMonth() + 1);
  const [newConfigData, setNewConfigData] = useState({
    maintenance_amount: 0,
    water_amount: 0,
    extraordinary_fee: 0,
    due_day: 15,
  });

  const { createPeriod, isLoading: periodMutating } = usePeriodMutations();
  const { createConfig, isLoading: configMutating } = usePeriodConfigMutations();

  const handleCreatePeriod = async (): Promise<void> => {
    try {
      await createPeriod({ year: newYear, month: newMonth });
      setNewYear(new Date().getFullYear());
      setNewMonth(new Date().getMonth() + 1);
      onPeriodCreated();
    } catch (err) {
      console.error('Error creating period:', err);
    }
  };

  const handleCreateConfig = async (): Promise<void> => {
    try {
      await createConfig(newConfigData);
      setNewConfigData({ maintenance_amount: 0, water_amount: 0, extraordinary_fee: 0, due_day: 15 });
      alert.success('Éxito', 'Configuración creada exitosamente');
    } catch (err) {
      console.error('Error creating config:', err);
      alert.error('Error', 'No se pudo crear la configuración. Intenta de nuevo.');
    }
  };

  return (
    <div className="bg-secondary shadow-lg rounded-lg border-4 border-primary/10 p-6">
      <h2 className="text-2xl font-bold mb-4">➕ Crear Nuevo Período</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <FormInput
          id="new-year"
          label="Año"
          type="number"
          value={String(newYear)}
          onChange={(v) => setNewYear(parseInt(v))}
          disabled={periodMutating}
        />
        <FormInput
          id="new-month"
          label="Mes (1-12)"
          type="number"
          value={String(newMonth)}
          onChange={(v) => setNewMonth(parseInt(v))}
          min={1}
          max={12}
          disabled={periodMutating}
        />
      </div>

      <div className="flex gap-3 mb-8">
        <Button onClick={handleCreatePeriod} disabled={periodMutating} isLoading={periodMutating} variant="success">
          Crear Período
        </Button>
        <Button onClick={onPeriodCreated} disabled={periodMutating} variant="sameUi">
          Cancelar
        </Button>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-300">
        <h3 className="text-xl font-bold mb-4">Crear Configuración de Período</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <FormInput
            id="config-maintenance"
            label="Monto Mantenimiento"
            type="number"
            value={String(newConfigData.maintenance_amount)}
            onChange={(v) => setNewConfigData({ ...newConfigData, maintenance_amount: parseFloat(v) })}
            disabled={configMutating}
          />
          <FormInput
            id="config-water"
            label="Monto Agua"
            type="number"
            value={String(newConfigData.water_amount)}
            onChange={(v) => setNewConfigData({ ...newConfigData, water_amount: parseFloat(v) })}
            disabled={configMutating}
          />
          <FormInput
            id="config-extraordinary"
            label="Cuota Extraordinaria"
            type="number"
            value={String(newConfigData.extraordinary_fee)}
            onChange={(v) => setNewConfigData({ ...newConfigData, extraordinary_fee: parseFloat(v) })}
            disabled={configMutating}
          />
          <FormInput
            id="config-due-day"
            label="Día de Vencimiento"
            type="number"
            value={String(newConfigData.due_day)}
            onChange={(v) => setNewConfigData({ ...newConfigData, due_day: parseInt(v) })}
            min={1}
            max={31}
            disabled={configMutating}
          />
        </div>

        <Button onClick={handleCreateConfig} disabled={configMutating} isLoading={configMutating} variant="info">
          Crear Configuración
        </Button>
      </div>
    </div>
  );
}
