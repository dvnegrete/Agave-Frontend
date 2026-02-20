import { InitialBalancePanel } from './admin/InitialBalancePanel';
import { CondonePenaltyPanel } from './admin/CondonePenaltyPanel';
import { AdjustChargePanel } from './admin/AdjustChargePanel';
import { ReverseChargePanel } from './admin/ReverseChargePanel';
import { InitialDebtPanel } from './admin/InitialDebtPanel';

export function AdminOperations() {
  return (
    <div className="space-y-6">
      <div className="bg-secondary shadow-lg rounded-lg border-4 border-primary/10 p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">🔧 Operaciones Administrativas</h2>
        <p className="text-sm text-foreground-secondary">
          Herramientas para ajustar cargos, condonar penalidades y asignar saldos iniciales (pagos pre-sistema)
        </p>
      </div>

      <InitialBalancePanel />
      <CondonePenaltyPanel />
      <AdjustChargePanel />
      <ReverseChargePanel />
      <InitialDebtPanel />
    </div>
  );
}
