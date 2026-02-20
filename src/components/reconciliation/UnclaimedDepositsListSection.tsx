import { useState } from 'react';
import { useUnclaimedDeposits, useUnclaimedDepositsMutations, useAlert } from '@hooks/index';
import { Button, Table, StatusBadge, CollapsibleSection, PaginationControls, Modal } from '@shared/ui';
import type { UnclaimedDepositsItem } from '@shared/types/bank-reconciliation.types';
import { formatCurrency } from '@/utils/formatters';
import { useFormatDate } from '@hooks/useFormatDate';

const PAGE_LIMIT = 20;

export function UnclaimedDepositsListSection() {
  const alert = useAlert();

  const [page, setPage] = useState(1);
  const [validationStatus, setValidationStatus] = useState<'all' | 'conflict' | 'not-found'>('all');
  const [selectedDeposit, setSelectedDeposit] = useState<UnclaimedDepositsItem | null>(null);
  const [houseNumber, setHouseNumber] = useState('');

  const { data, isLoading, refetch } = useUnclaimedDeposits({ page, limit: PAGE_LIMIT, validationStatus });
  const { assignHouse, assigning } = useUnclaimedDepositsMutations();

  const handleAssignHouse = async () => {
    if (!selectedDeposit || !houseNumber) {
      alert.warning('Validación requerida', 'Por favor especifica una casa');
      return;
    }
    try {
      await assignHouse(selectedDeposit.transactionBankId, { houseNumber: parseInt(houseNumber, 10) });
      alert.success('Éxito', 'Casa asignada exitosamente');
      setSelectedDeposit(null);
      setHouseNumber('');
      refetch();
    } catch (err) {
      console.error('Error assigning house:', err);
      alert.error('Error', 'No se pudo asignar la casa');
    }
  };

  const subtitle = data ? `${data.totalCount} total` : undefined;

  return (
    <>
      <CollapsibleSection
        title="➕ Depósitos No Asociados"
        subtitle={subtitle}
        borderColor="border-warning"
      >
        <div className="mb-4 flex gap-2">
          <select
            value={validationStatus}
            onChange={(e) => {
              setValidationStatus(e.target.value as typeof validationStatus);
              setPage(1);
            }}
            className="bg-base px-3 py-2 border border-base rounded text-sm"
          >
            <option value="all">Todos</option>
            <option value="conflict">Conflicto</option>
            <option value="not-found">No Encontrado</option>
          </select>
        </div>

        {isLoading ? (
          <p className="text-center text-foreground-tertiary py-4">Cargando...</p>
        ) : data && data.items.length > 0 ? (
          <>
            <Table
              columns={[
                { id: 'date', header: 'Fecha', align: 'center', render: (item) => useFormatDate(item.date) },
                { id: 'amount', header: 'Monto', align: 'center', render: (item) => `$${formatCurrency(item.amount)}` },
                { id: 'concept', header: 'Concepto', align: 'left', render: (item) => item.concept },
                {
                  id: 'validationStatus',
                  header: 'Estado',
                  align: 'center',
                  render: (item) => (
                    <StatusBadge
                      status={item.validationStatus === 'conflict' ? 'warning' : 'info'}
                      label={item.validationStatus === 'conflict' ? 'Conflicto' : 'No Encontrado'}
                      icon={item.validationStatus === 'conflict' ? '⚠️' : '❓'}
                    />
                  ),
                },
                {
                  id: 'actions',
                  header: 'Acciones',
                  align: 'center',
                  render: (item) => (
                    <Button
                      onClick={() => { setSelectedDeposit(item); }}
                      variant="info"
                      className="text-xs py-1 px-2"
                    >
                      Asignar Casa
                    </Button>
                  ),
                },
              ]}
              data={data.items}
              emptyMessage="No hay depósitos no asociados"
              headerVariant="warning"
              hoverable
            />
            <PaginationControls
              page={page}
              totalPages={data.totalPages}
              onPrev={() => setPage(Math.max(1, page - 1))}
              onNext={() => setPage(Math.min(data.totalPages, page + 1))}
            />
          </>
        ) : (
          <p className="text-center text-foreground-tertiary py-8">No hay depósitos no asociados</p>
        )}
      </CollapsibleSection>

      <Modal
        isOpen={!!selectedDeposit}
        onClose={() => { setSelectedDeposit(null); setHouseNumber(''); }}
        title="Asignar Casa a Depósito"
        maxWidth="sm"
      >
        {selectedDeposit && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Transacción ID:</label>
              <p className="text-foreground">{selectedDeposit.transactionBankId}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Monto:</label>
              <p className="text-foreground">${formatCurrency(selectedDeposit.amount)}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Número de Casa (1-66):</label>
              <input
                type="number"
                min="1"
                max="66"
                className="w-full mt-1 px-3 py-2 border border-base rounded"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder="Ej: 15"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAssignHouse} variant="success" isLoading={assigning} className="flex-1">
                Asignar
              </Button>
              <Button
                onClick={() => { setSelectedDeposit(null); setHouseNumber(''); }}
                variant="info"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
