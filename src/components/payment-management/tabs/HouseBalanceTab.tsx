import { useState } from 'react';
import { Button } from '@shared/ui';
import { HouseStatusCard } from '../HouseStatusCard';
import { HousesOverviewPanel } from '../HousesOverviewPanel';

export function HouseBalanceTab() {
  const [selectedHouseId, setSelectedHouseId] = useState<number | null>(null);

  return (
    <div className="bg-secondary shadow-lg rounded-lg border-4 border-primary/10 p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold">💵 Estado de Cuenta</h2>
        {selectedHouseId !== null && (
          <Button variant="sameUi" onClick={() => setSelectedHouseId(null)}>
            ← Volver al resumen
          </Button>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-foreground mb-2">
          Buscar casa por número (1-66)
        </label>
        <input
          type="number"
          min="1"
          max="66"
          value={selectedHouseId ?? ''}
          onChange={(e) => setSelectedHouseId(e.target.value ? parseInt(e.target.value) : null)}
          placeholder="Ingresa el número de casa para ver su detalle"
          className="w-full px-4 py-2 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder-foreground-tertiary transition-all duration-200"
        />
      </div>

      {selectedHouseId !== null
        ? <HouseStatusCard houseId={selectedHouseId} />
        : <HousesOverviewPanel onSelectHouse={(n) => setSelectedHouseId(n)} />}
    </div>
  );
}
