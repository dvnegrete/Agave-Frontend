import { useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { HousePaymentCard, PeriodChargesTable } from '@components/payment-management';

export function MyHousePayments() {
  const { user } = useAuth();
  const houseNumbers = user?.houses || [];

  const [expandedHouses, setExpandedHouses] = useState<number[]>(() =>
    houseNumbers.length > 0 ? [houseNumbers[0]] : []
  );

  // Per-house: which year is expanded (null = all collapsed).
  // If a house has no entry, the most recent year is shown by default.
  const [expandedHouseYears, setExpandedHouseYears] = useState<Record<number, number | null>>({});

  const toggleHouseExpanded = (houseNumber: number): void => {
    setExpandedHouses((prev) =>
      prev.includes(houseNumber) ? prev.filter((h) => h !== houseNumber) : [...prev, houseNumber]
    );
  };

  const toggleHouseYear = (houseId: number, year: number): void => {
    setExpandedHouseYears((prev) => ({
      ...prev,
      [houseId]: prev[houseId] === year ? null : year,
    }));
  };

  if (houseNumbers.length === 0) {
    return (
      <div className="container flex-1 mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">🏠 Mis Pagos de Casa</h1>
        <div className="bg-base shadow-lg rounded-lg border-4 border-info p-6 text-center">
          <p className="text-foreground-secondary">No tienes casas registradas en el sistema</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex-1 mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">🏠 Mis Pagos de Casa</h1>

      <div className="space-y-6 my-2">
        {houseNumbers.map((houseId) => (
          <HousePaymentCard
            key={houseId}
            houseId={houseId}
            isExpanded={expandedHouses.includes(houseId)}
            activeYear={houseId in expandedHouseYears ? expandedHouseYears[houseId] : undefined}
            onToggleExpand={() => toggleHouseExpanded(houseId)}
            onToggleYear={(year) => toggleHouseYear(houseId, year)}
          />
        ))}
      </div>

      <PeriodChargesTable />
    </div>
  );
}
