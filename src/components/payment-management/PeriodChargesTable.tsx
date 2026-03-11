import { useState } from 'react';
import { usePeriodChargesQuery } from '@hooks/usePaymentManagement';
import type { PeriodChargeSummary } from '@shared';
import { formatCurrency } from '@/utils/formatters';

function groupChargesByYear(charges: PeriodChargeSummary[]): Record<number, PeriodChargeSummary[]> {
  return charges.reduce<Record<number, PeriodChargeSummary[]>>((acc, c) => {
    acc[c.year] = acc[c.year] ?? [];
    acc[c.year].push(c);
    return acc;
  }, {});
}

export function PeriodChargesTable() {
  const { charges, isLoading } = usePeriodChargesQuery();
  const currentYear = new Date().getFullYear();

  const [isOpen, setIsOpen] = useState(false);
  const [expandedYear, setExpandedYear] = useState<number | null>(currentYear);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm mb-6">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
        Cargando cuotas...
      </div>
    );
  }

  if (charges.length === 0) return null;

  const chargesByYear = groupChargesByYear(charges);
  const sortedYears = Object.keys(chargesByYear).map(Number).sort((a, b) => b - a);
  const hasWater = charges.some((c) => c.water_active);
  const hasExtraordinary = charges.some((c) => c.extraordinary_fee_active);

  const toggleYear = (year: number) => {
    setExpandedYear((prev) => (prev === year ? null : year));
  };

  return (
    <div className="shadow-lg rounded-lg border-4 border-info mb-6">
      <div
        className="flex items-center justify-between cursor-pointer p-6"
        onClick={() => setIsOpen((v) => !v)}
      >
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">Cuotas por mes</h2>
          <p className="text-sm text-foreground-tertiary mt-0.5">
            {charges.length} periodos · {sortedYears.length} años
          </p>
        </div>
        <span className="text-2xl text-info">{isOpen ? '▼' : '▶'}</span>
      </div>

      {isOpen && (
        <div className="px-6 pb-6 space-y-2">
          {sortedYears.map((year) => {
            const yearCharges = chargesByYear[year];
            const isYearOpen = expandedYear === year;

            return (
              <div key={year} className="rounded-lg border border-info overflow-hidden">
                <div
                  className="flex items-center justify-between cursor-pointer px-4 py-3 bg-base transition-colors"
                  onClick={() => toggleYear(year)}
                >
                  <span className="font-semibold text-foreground">{year}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-foreground">{yearCharges.length} meses</span>
                    <span className="text-lg text-foreground">{isYearOpen ? '▼' : '▶'}</span>
                  </div>
                </div>

                {isYearOpen && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-info text-foreground">
                          <th className="text-left px-4 py-2 font-semibold">Periodo</th>
                          <th className="text-center px-4 py-2 font-semibold">Mantenimiento</th>
                          {hasWater && <th className="text-center px-4 py-2 font-semibold">Agua</th>}
                          {hasExtraordinary && <th className="text-center px-4 py-2 font-semibold">Cuota Extra</th>}
                          <th className="text-center px-4 py-2 font-semibold">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearCharges.map((charge, idx) => {
                          const waterAmt = charge.water_active && charge.water_amount ? charge.water_amount : 0;
                          const extraAmt = charge.extraordinary_fee_active && charge.extraordinary_fee_amount ? charge.extraordinary_fee_amount : 0;
                          const total = charge.maintenance_amount + waterAmt + extraAmt;

                          return (
                            <tr key={charge.period_id} className={idx % 2 === 0 ? 'bg-secondary' : ''}>
                              <td className="px-4 py-2 font-medium">{charge.display_name}</td>
                              <td className="px-4 py-2 text-center">${formatCurrency(charge.maintenance_amount)}</td>
                              {hasWater && (
                                <td className="px-4 py-2 text-center">
                                  {charge.water_active && charge.water_amount ? `$${formatCurrency(charge.water_amount)}` : <span className="text-foreground">—</span>}
                                </td>
                              )}
                              {hasExtraordinary && (
                                <td className="px-4 py-2 text-center">
                                  {charge.extraordinary_fee_active && charge.extraordinary_fee_amount ? `$${formatCurrency(charge.extraordinary_fee_amount)}` : <span className="text-foreground-secondary">—</span>}
                                </td>
                              )}
                              <td className="px-4 py-2 text-center font-semibold text-primary">${formatCurrency(total)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
