import { useState } from 'react';
import {
  useManualValidationPending,
  useManualValidationMutations,
  useManualValidationStats,
  useAlert,
} from '@hooks/index';
import { Button, Table, CollapsibleSection, PaginationControls, Modal } from '@shared/ui';
import type { ManualValidationPendingItem } from '@shared/types/bank-reconciliation.types';
import { formatCurrency } from '@/utils/formatters';

const PAGE_LIMIT = 20;

export function ManualValidationSection() {
  const alert = useAlert();

  const [page, setPage] = useState(1);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [selectedItem, setSelectedItem] = useState<ManualValidationPendingItem | null>(null);

  const { data, isLoading, refetch } = useManualValidationPending({ page, limit: PAGE_LIMIT });
  const { data: stats } = useManualValidationStats();
  const { approve, approving } = useManualValidationMutations();

  const handleApprove = async (transactionId: string) => {
    if (!selectedItem) {
      alert.error('Error', 'Por favor selecciona un voucher');
      return;
    }
    try {
      await approve(transactionId, {
        voucherId: selectedItem.possibleMatches[0]?.voucherId || 0,
        approverNotes: approvalNotes,
      });
      alert.success('Éxito', 'Caso aprobado exitosamente');
      setSelectedItem(null);
      setApprovalNotes('');
      refetch();
    } catch (err) {
      console.error('Error approving:', err);
      alert.error('Error', 'No se pudo aprobar el caso');
    }
  };

  const subtitle = stats
    ? `${stats.totalPending} pendientes • ${stats.totalApproved} aprobados`
    : undefined;

  return (
    <>
      <CollapsibleSection
        title="🔍 Validación Manual - Casos Pendientes"
        subtitle={subtitle}
        borderColor="border-error"
      >
        {isLoading ? (
          <p className="text-center text-foreground-tertiary py-4">Cargando...</p>
        ) : data && data.items.length > 0 ? (
          <>
            <Table
              columns={[
                {
                  id: 'transactionBankId',
                  header: 'Transacción ID',
                  align: 'left',
                  render: (item) => <span className="font-medium">{item.transactionBankId}</span>,
                },
                { id: 'transactionConcept', header: 'Concepto', align: 'left', render: (item) => item.transactionConcept },
                { id: 'transactionAmount', header: 'Monto', align: 'right', render: (item) => `$${formatCurrency(item.transactionAmount)}` },
                {
                  id: 'possibleMatches',
                  header: 'Posibles Vouchers',
                  align: 'left',
                  render: (item) => (
                    <div className="space-y-1 text-sm">
                      {item.possibleMatches.map((match, idx) => (
                        <div key={idx}>Voucher #{match.voucherId} ({(match.similarity * 100).toFixed(0)}%)</div>
                      ))}
                    </div>
                  ),
                },
                {
                  id: 'actions',
                  header: 'Acciones',
                  align: 'center',
                  render: (item) => (
                    <Button onClick={() => setSelectedItem(item)} variant="info" className="text-xs py-1 px-2">
                      Revisar
                    </Button>
                  ),
                },
              ]}
              data={data.items}
              emptyMessage="No hay casos pendientes"
              headerVariant="error"
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
          <p className="text-center text-foreground-tertiary py-8">No hay casos pendientes de validación manual</p>
        )}
      </CollapsibleSection>

      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Validar Caso"
        maxWidth="sm"
      >
        {selectedItem && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Transacción ID:</label>
              <p className="text-foreground">{selectedItem.transactionBankId}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Monto:</label>
              <p className="text-foreground">${formatCurrency(selectedItem.transactionAmount)}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Vouchers Posibles:</label>
              <select className="w-full mt-1 p-2 border border-base rounded">
                <option value="">Selecciona un voucher</option>
                {selectedItem.possibleMatches.map((match: any, idx: number) => (
                  <option key={idx} value={match.voucherId}>
                    Voucher #{match.voucherId} - ${formatCurrency(match.voucherAmount)} ({(match.similarity * 100).toFixed(0)}%)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Notas del Aprobador:</label>
              <textarea
                className="w-full mt-1 p-2 border border-base rounded text-sm"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Notas opcionales..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleApprove(selectedItem.transactionBankId)}
                variant="success"
                isLoading={approving}
                className="flex-1"
              >
                Aprobar
              </Button>
              <Button onClick={() => setSelectedItem(null)} variant="error" className="flex-1">
                Rechazar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
