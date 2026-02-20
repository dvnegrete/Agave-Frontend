import { useState } from 'react';
import { useUnfundedVouchers, useUnfundedVouchersMutations, useAlert, useFormatDate } from '@hooks/index';
import { Button, Table, CollapsibleSection, PaginationControls, Modal } from '@shared/ui';
import type { UnfundedVouchersItem } from '@shared/types/bank-reconciliation.types';
import { formatCurrency } from '@/utils/formatters';

const PAGE_LIMIT = 20;

export function UnfundedVouchersSection() {
  const alert = useAlert();

  const [page, setPage] = useState(1);
  const [selectedVoucher, setSelectedVoucher] = useState<UnfundedVouchersItem | null>(null);
  const [transactionBankId, setTransactionBankId] = useState('');
  const [houseNumber, setHouseNumber] = useState('');

  const { data, isLoading, refetch } = useUnfundedVouchers({ page, limit: PAGE_LIMIT });
  const { matchDeposit, matching } = useUnfundedVouchersMutations();

  const handleMatchDeposit = async () => {
    if (!selectedVoucher || !transactionBankId || !houseNumber) {
      alert.warning('Validación requerida', 'Por favor completa todos los campos');
      return;
    }
    try {
      await matchDeposit(selectedVoucher.voucherId, {
        transactionBankId,
        houseNumber: parseInt(houseNumber, 10),
      });
      alert.success('Éxito', 'Voucher conciliado exitosamente');
      setSelectedVoucher(null);
      setTransactionBankId('');
      setHouseNumber('');
      refetch();
    } catch (err) {
      console.error('Error matching deposit:', err);
      alert.error('Error', 'No se pudo conciliar el voucher');
    }
  };

  const subtitle = data ? `${data.totalCount} total` : undefined;

  return (
    <>
      <CollapsibleSection
        title="⏳ Comprobantes Sin Fondos"
        subtitle={subtitle}
        borderColor="border-warning"
      >
        {isLoading ? (
          <p className="text-center text-foreground-tertiary py-4">Cargando...</p>
        ) : data && data.items.length > 0 ? (
          <>
            <Table
              columns={[
                { id: 'houseNumber', header: 'Casa', align: 'center', render: (item) => item.houseNumber ? `Casa ${item.houseNumber}` : 'N/A' },
                { id: 'amount', header: 'Monto', align: 'center', render: (item) => `$${formatCurrency(item.amount)}` },
                { id: 'date', header: 'Fecha', align: 'center', render: (item) => useFormatDate(item.date) },
                {
                  id: 'actions',
                  header: 'Acciones',
                  align: 'center',
                  render: (item) => (
                    <Button
                      onClick={() => setSelectedVoucher(item)}
                      variant="info"
                      className="text-xs py-1 px-2"
                    >
                      Conciliar
                    </Button>
                  ),
                },
              ]}
              data={data.items}
              emptyMessage="No hay comprobantes sin fondos"
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
          <p className="text-center text-foreground-tertiary py-8">No hay comprobantes sin fondos</p>
        )}
      </CollapsibleSection>

      <Modal
        isOpen={!!selectedVoucher}
        onClose={() => { setSelectedVoucher(null); setTransactionBankId(''); setHouseNumber(''); }}
        title="Conciliar Comprobante con Depósito"
        maxWidth="sm"
      >
        {selectedVoucher && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Voucher ID:</label>
              <p className="text-foreground">#{selectedVoucher.voucherId}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Monto:</label>
              <p className="text-foreground">${formatCurrency(selectedVoucher.amount)}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Transacción Bancaria ID:</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border border-base rounded"
                value={transactionBankId}
                onChange={(e) => setTransactionBankId(e.target.value)}
                placeholder="Ej: TX-001 o 12345"
              />
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
              <Button onClick={handleMatchDeposit} variant="success" isLoading={matching} className="flex-1">
                Conciliar
              </Button>
              <Button
                onClick={() => { setSelectedVoucher(null); setTransactionBankId(''); setHouseNumber(''); }}
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
