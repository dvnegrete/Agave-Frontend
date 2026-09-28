import { useState } from 'react';
import { useVouchersQuery, useVoucherMutations } from '@hooks/useVouchersQuery';
// useFormatDate es una función pura (no usa hooks); se renombra para usarla dentro de render
import { useFormatDate as formatDate } from '@hooks/useFormatDate';
import { useSortBy } from '@hooks/useSortBy';
import { useAlert } from '@hooks/useAlert';
import { getVoucherById } from '@services/voucherService';
import { Button, StatusBadge, ExpandableTable, type ExpandableTableColumn } from '@shared/ui';
import { ModalMatchVoucherDeposit } from '@components/vouchers';
import type { Voucher } from '@shared';
import { formatCurrency } from '@/utils/formatters';

export function VoucherList() {
  const alert = useAlert();
  const [loadingViewUrl, setLoadingViewUrl] = useState<number | null>(null);
  const [voucherToMatch, setVoucherToMatch] = useState<Voucher | null>(null);

  const {
    vouchers,
    total,
    isLoading,
    isFetching,
    error,
  } = useVouchersQuery({
    confirmation_status: false
  });

  const { sortedItems: sortedVouchers, sortConfig, setSortField } = useSortBy(
    vouchers,
    {
      initialField: 'number_house',
      initialOrder: 'asc'
    }
  );

  const { remove, isLoading: mutating } = useVoucherMutations();

  const handleViewVoucher = async (id: number): Promise<void> => {
    setLoadingViewUrl(id);
    try {
      const voucher = await getVoucherById(id.toString());

      if (voucher.viewUrl) {
        window.open(voucher.viewUrl, '_blank');
      } else {
        alert.warning('Sin URL disponible', 'No hay URL de visualización disponible para este comprobante');
      }
    } catch (err) {
      console.error('Error al obtener el comprobante:', err);
      alert.error('Error', 'No se pudo obtener el comprobante');
    } finally {
      setLoadingViewUrl(null);
    }
  };

  const handleDeleteVoucher = async (id: number): Promise<void> => {
    if (confirm('¿Estás seguro de eliminar este voucher?')) {
      try {
        await remove(id.toString());
        alert.success('Éxito', 'Voucher eliminado exitosamente');
        // React Query automáticamente invalida y refetch las queries
      } catch (err) {
        console.error('Error deleting voucher:', err);
        const message = err instanceof Error ? err.message : '';
        alert.error('No se pudo eliminar el voucher', message);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg text-foreground">Cargando vouchers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-error text-error px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  // Validar que vouchers sea un array
  if (!vouchers || !Array.isArray(vouchers)) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg text-foreground-tertiary">No hay vouchers disponibles</div>
      </div>
    );
  }

  const mainColumns: ExpandableTableColumn<Voucher>[] = [
    {
      id: 'number_house',
      sortable: true,
      header: 'Casa',
      align: 'center',
      render: (voucher: Voucher) => voucher.number_house,
    },
    {
      id: 'date',
      sortable: true,
      header: 'Fecha',
      align: 'center',
      render: (voucher: Voucher) => formatDate(voucher.date),
    },
    {
      id: 'amount',
      sortable: true,
      header: 'Monto',
      align: 'center',
      render: (voucher: Voucher) => `$${formatCurrency(voucher.amount)}`,
      className: 'font-bold text-primary-light',
    },
    {
      id: 'confirmation_status',
      sortable: true,
      header: 'Estado',
      align: 'center',
      render: (voucher: Voucher) => (
        <StatusBadge
          status={voucher.confirmation_status ? 'success' : 'warning'}
          label={voucher.confirmation_status ? 'Confirmado' : 'Pendiente'}
          icon={voucher.confirmation_status ? '✓' : '⏳'}
        />
      ),
    },
  ];

  const expandedContentRender = (voucher: Voucher): React.ReactNode => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-background rounded-lg p-4 border border-primary/10">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Número de Autorización</p>
          <p className="text-lg text-foreground font-semibold font-mono">{voucher.authorization_number}</p>
        </div>
        <div className="bg-background rounded-lg p-4 border border-primary/10">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Código de Confirmación</p>
          <p className="text-lg text-foreground font-semibold font-mono">{voucher.confirmation_code}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => handleViewVoucher(voucher.id)}
          disabled={loadingViewUrl === voucher.id}
          isLoading={loadingViewUrl === voucher.id}
          variant="primary"
        >
          📄 Ver comprobante
        </Button>
        {!voucher.confirmation_status && (
          <Button
            onClick={() => setVoucherToMatch(voucher)}
            disabled={mutating}
            variant="success"
          >
            🔗 Asociar movimiento
          </Button>
        )}
        <Button
          onClick={() => handleDeleteVoucher(voucher.id)}
          disabled={mutating}
          variant="error"
        >
          🗑️ Eliminar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container flex-1 mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Vouchers</h1>
          {isFetching && !isLoading && (
            <div className="flex items-center text-sm text-foreground-secondary">
              <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Actualizando...
            </div>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <div className="text-lg text-foreground">Cargando vouchers...</div>
        </div>
      )}

      {error && (
        <div className="border border-error text-error px-4 py-3 rounded">
          Error: {error}
        </div>
      )}

      {!isLoading && !error && vouchers && Array.isArray(vouchers) && (
        <>
          <div className="shadow-xl rounded-xl overflow-hidden border border-primary/10">
            <ExpandableTable
              data={sortedVouchers}
              mainColumns={mainColumns}
              expandedContent={expandedContentRender}
              keyField="id"
              sortConfig={sortConfig}
              onSort={setSortField}
              headerVariant="primary"
              variant="spacious"
              emptyMessage="No hay vouchers disponibles"
            />
          </div>

          <div className="mt-4 text-sm text-foreground-secondary">
            Total: {total} vouchers
          </div>
        </>
      )}

      <ModalMatchVoucherDeposit
        voucher={voucherToMatch}
        onClose={() => setVoucherToMatch(null)}
      />

      {!isLoading && (!vouchers || !Array.isArray(vouchers)) && (
        <div className="flex justify-center items-center p-8">
          <div className="text-lg text-foreground-tertiary">No hay vouchers disponibles</div>
        </div>
      )}
    </div>
  );
}
