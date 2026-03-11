import { useState } from 'react';
import { Tabs, type TabItem } from '@shared/ui';
import { UnclaimedDepositsSection } from '@components/reconciliation';
import {
  PeriodChargesEditor,
  AdminOperations,
  PeriodsTab,
  CreatePeriodTab,
  HousePaymentsTab,
  HouseBalanceTab,
} from '@components/payment-management';
import type { ActiveTab } from '@/shared/types/payment-management.types';

export function PaymentManagement() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('unclaimed-deposits');

  return (
    <div className="container flex-1 mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">💰 Gestión de Pagos</h1>

      <Tabs
        tabs={[
          { id: 'periods', label: 'Períodos', icon: '📋', color: 'blue' },
          { id: 'create-period', label: 'Crear Período', icon: '➕', color: 'blue' },
          { id: 'house-payments', label: 'Pagos por Casa', icon: '🏠', color: 'blue' },
          { id: 'house-balance', label: 'Estado de Cuenta', icon: '💵', color: 'blue' },
          { id: 'unclaimed-deposits', label: 'Depósitos No Reclamados', icon: '🏦', color: 'blue' },
          { id: 'period-charges', label: 'Configurar Períodos', icon: '⚙️', color: 'blue' },
          { id: 'admin-operations', label: 'Operaciones Admin', icon: '🔧', color: 'orange' },
        ] as TabItem[]}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as ActiveTab)}
      />

      {activeTab === 'periods' && <PeriodsTab />}

      {activeTab === 'create-period' && (
        <CreatePeriodTab onPeriodCreated={() => setActiveTab('periods')} />
      )}

      {activeTab === 'house-payments' && <HousePaymentsTab />}

      {activeTab === 'house-balance' && <HouseBalanceTab />}

      {activeTab === 'unclaimed-deposits' && (
        <div className="bg-secondary shadow-lg rounded-lg border-4 border-primary/10 p-6">
          <h2 className="text-2xl font-bold mb-4">🏦 Depósitos No Reclamados</h2>
          <UnclaimedDepositsSection onDepositAssigned={() => {}} />
        </div>
      )}

      {activeTab === 'period-charges' && <PeriodChargesEditor />}

      {activeTab === 'admin-operations' && <AdminOperations />}
    </div>
  );
}
