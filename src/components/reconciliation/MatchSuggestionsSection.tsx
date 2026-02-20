import { useMatchSuggestions, useMatchSuggestionsMutations, useAlert, useFormatDate } from '@hooks/index';
import { Button, Table, StatusBadge, CollapsibleSection } from '@shared/ui';
import type { MatchSuggestionItem } from '@shared/types/bank-reconciliation.types';
import { formatCurrency } from '@/utils/formatters';

export function MatchSuggestionsSection() {
  const alert = useAlert();
  const { data, isLoading, refetch } = useMatchSuggestions();
  const { applySuggestion, applyBatch, applying, applyingBatch } = useMatchSuggestionsMutations();

  const handleApplySuggestion = async (suggestion: MatchSuggestionItem) => {
    if (!suggestion.houseNumber) {
      alert.warning('Casa requerida', 'Esta sugerencia no tiene casa identificada');
      return;
    }
    try {
      await applySuggestion({
        transactionBankId: suggestion.transactionBankId,
        voucherId: suggestion.voucherId,
        houseNumber: suggestion.houseNumber,
      });
      alert.success('Aplicado', `Depósito ${suggestion.transactionBankId} conciliado con Voucher ${suggestion.voucherId}`);
      refetch();
    } catch (err) {
      console.error('Error applying suggestion:', err);
      alert.error('Error', 'No se pudo aplicar la sugerencia');
    }
  };

  const handleApplyAllHighConfidence = async () => {
    if (!data) return;
    const highConfSuggestions = data.suggestions
      .filter((s) => s.confidence === 'high' && s.houseNumber)
      .map((s) => ({ transactionBankId: s.transactionBankId, voucherId: s.voucherId, houseNumber: s.houseNumber! }));

    if (highConfSuggestions.length === 0) {
      alert.warning('Sin sugerencias', 'No hay sugerencias de alta confianza para aplicar');
      return;
    }
    try {
      const result = await applyBatch({ suggestions: highConfSuggestions });
      if (result) {
        alert.success('Batch completado', `${result.totalApplied} aplicados, ${result.totalFailed} fallidos`);
      }
      refetch();
    } catch (err) {
      console.error('Error applying batch:', err);
      alert.error('Error', 'No se pudo aplicar el batch');
    }
  };

  const subtitle = data
    ? `${data.totalSuggestions} sugerencias (${data.highConfidence} alta, ${data.mediumConfidence} media)`
    : undefined;

  return (
    <CollapsibleSection
      title="🔗 Sugerencias de Conciliación (Cross-Matching)"
      subtitle={subtitle}
      borderColor="success"
    >
      {isLoading ? (
        <p className="text-center text-foreground-tertiary py-4">Cargando sugerencias...</p>
      ) : data && data.suggestions.length > 0 ? (
        <>
          {data.highConfidence > 0 && (
            <div className="mb-4">
              <Button onClick={handleApplyAllHighConfidence} variant="success" isLoading={applyingBatch}>
                Aplicar Todas ({data.highConfidence} Alta Confianza)
              </Button>
            </div>
          )}
          <Table
            columns={[
              { id: 'transactionBankId', header: 'Depósito ID', align: 'center', render: (item: MatchSuggestionItem) => <span className="font-medium">{item.transactionBankId}</span> },
              { id: 'voucherId', header: 'Voucher ID', align: 'center', render: (item: MatchSuggestionItem) => `#${item.voucherId}` },
              { id: 'amount', header: 'Monto', align: 'right', render: (item: MatchSuggestionItem) => `$${formatCurrency(item.amount)}` },
              { id: 'depositDate', header: 'Fecha Depósito', align: 'center', render: (item: MatchSuggestionItem) => useFormatDate(item.depositDate) },
              { id: 'voucherDate', header: 'Fecha Voucher', align: 'center', render: (item: MatchSuggestionItem) => useFormatDate(item.voucherDate) },
              { id: 'houseNumber', header: 'Casa', align: 'center', render: (item: MatchSuggestionItem) => item.houseNumber ? `Casa ${item.houseNumber}` : 'N/A' },
              {
                id: 'confidence', header: 'Confianza', align: 'center',
                render: (item: MatchSuggestionItem) => (
                  <StatusBadge
                    status={item.confidence === 'high' ? 'success' : 'warning'}
                    label={item.confidence === 'high' ? 'Alta' : 'Media'}
                    icon={item.confidence === 'high' ? '✅' : '⚠️'}
                  />
                ),
              },
              {
                id: 'actions', header: 'Acciones', align: 'center',
                render: (item: MatchSuggestionItem) => (
                  <Button
                    onClick={() => handleApplySuggestion(item)}
                    variant="success"
                    className="text-xs py-1 px-2"
                    isLoading={applying}
                    disabled={!item.houseNumber}
                  >
                    Aplicar
                  </Button>
                ),
              },
            ]}
            data={data.suggestions}
            emptyMessage="No hay sugerencias de cross-matching"
            headerVariant="success"
            hoverable
          />
        </>
      ) : (
        <p className="text-center text-foreground-tertiary py-8">No hay sugerencias de cross-matching disponibles</p>
      )}
    </CollapsibleSection>
  );
}
