import { useState } from 'react';
import { HouseStatusCard } from '../HouseStatusCard';

export function HouseBalanceTab() {
  const [selectedHouseId, setSelectedHouseId] = useState<number | null>(null);

  return (
    <div className="bg-secondary shadow-lg rounded-lg border-4 border-primary/10 p-6">
      <h2 className="text-2xl font-bold mb-4">💵 Estado de Cuenta</h2>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-foreground mb-2">Número de Casa</label>
        <input
          type="number"
          min="1"
          max="66"
          value={selectedHouseId || ''}
          onChange={(e) => setSelectedHouseId(e.target.value ? parseInt(e.target.value) : null)}
          placeholder="Ingresa el número de casa (1-66)"
          className="w-full px-4 py-2 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder-foreground-tertiary transition-all duration-200"
        />
      </div>

      {selectedHouseId ? (
        <HouseStatusCard houseId={selectedHouseId} />
      ) : (
        <div className="text-center py-8 text-foreground-secondary">
          Selecciona una casa para ver su estado de cuenta
        </div>
      )}
    </div>
  );
}
