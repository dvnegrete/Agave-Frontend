import { useState } from 'react';
import { useVouchersQuery, useVoucherMutations } from '../hooks/useVouchersQuery';
import { useFormatDate } from '../hooks/useFormatDate';
import { useSortBy } from '../hooks/useSortBy';
import { getVoucherById } from '../services/voucherService';

export function VoucherList() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loadingViewUrl, setLoadingViewUrl] = useState<number | null>(null);

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

  const { create, update, remove, isLoading: mutating } = useVoucherMutations();

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleViewVoucher = async (id: number) => {
    setLoadingViewUrl(id);
    try {
      const voucher = await getVoucherById(id.toString());

      console.log('📄 [View Voucher] Respuesta de la API:', voucher);

      if (voucher.viewUrl) {
        window.open(voucher.viewUrl, '_blank');
      } else {
        alert('No hay URL de visualización disponible para este comprobante');
      }
    } catch (err) {
      console.error('❌ [View Voucher] Error al obtener el comprobante:', err);
      alert('Error al obtener el comprobante');
    } finally {
      setLoadingViewUrl(null);
    }
  };

  const handleCreateVoucher = async () => {
    try {
      await create({
        authorization_number: 'AUTH-' + Date.now(),
        date: new Date().toISOString(),
        confirmation_code: 'CONF-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        amount: 1000,
        confirmation_status: false,
        url: '',
      });
      // React Query automáticamente invalida y refetch las queries
    } catch (err) {
      console.error('Error creating voucher:', err);
      alert('Error al crear el voucher');
    }
  };

  const handleConfirmVoucher = async (id: number) => {
    try {
      await update({
        id: id.toString(),
        data: { confirmation_status: true }
      });
      // React Query automáticamente invalida y refetch las queries
    } catch (err) {
      console.error('Error confirming voucher:', err);
      alert('Error al confirmar el voucher');
    }
  };

  const handleDeleteVoucher = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este voucher?')) {
      try {
        await remove(id.toString());
        // React Query automáticamente invalida y refetch las queries
      } catch (err) {
        console.error('Error deleting voucher:', err);
        alert('Error al eliminar el voucher');
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
      <div className="bg-error/20 border border-error text-error px-4 py-3 rounded">
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

  return (
    <div className="container mx-auto p-4">
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
        <button
          onClick={handleCreateVoucher}
          disabled={mutating}
          className="bg-gray-700 hover:shadow-lg text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 transition-all duration-300 hover:scale-105 flex items-center gap-2 cursor-pointer"
          style={{ opacity: mutating ? 0.5 : 1 }}
        >
          ➕ Crear Voucher
        </button>
      </div>

      <div className="shadow-xl rounded-xl overflow-hidden border border-primary/10">
        <table className="min-w-full">
          <thead className="bg-gray-700">
            <tr>
              <th
                onClick={() => setSortField('number_house')}
                className={`px-6 py-4 text-center text-xs font-bold uppercase tracking-widest cursor-pointer select-none transition-all duration-200 ${
                  sortConfig.field === 'number_house'
                    ? 'text-white bg-primary/50 shadow-lg'
                    : 'text-white hover:bg-primary/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  Casa
                  {sortConfig.field === 'number_house' && (
                    <span className="text-lg">{sortConfig.order === 'asc' ? '▲' : '▼'}</span>
                  )}
                </div>
              </th>
              <th
                onClick={() => setSortField('date')}
                className={`px-6 py-4 text-center text-xs font-bold uppercase tracking-widest cursor-pointer select-none transition-all duration-200 ${
                  sortConfig.field === 'date'
                    ? 'text-white bg-primary/50 shadow-lg'
                    : 'text-white hover:bg-primary/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  Fecha
                  {sortConfig.field === 'date' && (
                    <span className="text-lg">{sortConfig.order === 'asc' ? '▲' : '▼'}</span>
                  )}
                </div>
              </th>
              <th
                onClick={() => setSortField('amount')}
                className={`px-6 py-4 text-center text-xs font-bold uppercase tracking-widest cursor-pointer select-none transition-all duration-200 ${
                  sortConfig.field === 'amount'
                    ? 'text-white bg-primary/50 shadow-lg'
                    : 'text-white hover:bg-primary/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  Monto
                  {sortConfig.field === 'amount' && (
                    <span className="text-lg">{sortConfig.order === 'asc' ? '▲' : '▼'}</span>
                  )}
                </div>
              </th>
              <th
                onClick={() => setSortField('confirmation_status')}
                className={`px-6 py-4 text-center text-xs font-bold uppercase tracking-widest cursor-pointer select-none transition-all duration-200 ${
                  sortConfig.field === 'confirmation_status'
                    ? 'text-white bg-primary/50 shadow-lg'
                    : 'text-white hover:bg-primary/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  Estado
                  {sortConfig.field === 'confirmation_status' && (
                    <span className="text-lg">{sortConfig.order === 'asc' ? '▲' : '▼'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-widest">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-base divide-y divide-primary/5">
            {sortedVouchers.map((voucher) => (
              <>
                <tr key={voucher.id} className={`transition-all duration-300 ${expandedId === voucher.id ? 'bg-primary/5 border-l-4 border-primary shadow-md' : 'hover:bg-primary/3 hover:shadow-md'}`}>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-center text-foreground font-medium">
                    {voucher.number_house}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-center text-foreground">
                    {useFormatDate(voucher.date)}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-center font-bold text-primary-light">
                    ${voucher.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-center">
                    <span
                      className={`px-4 py-2 inline-flex text-xs leading-5 font-bold rounded-full transition-all duration-200 ${voucher.confirmation_status
                          ? 'bg-success/30 text-success border border-success/50 shadow-sm'
                          : 'bg-warning/30 text-warning border border-warning/50 shadow-sm'
                        }`}
                    >
                      {voucher.confirmation_status ? '✓ Confirmado' : '⏳ Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-center">
                    <button
                      onClick={() => toggleExpand(voucher.id)}
                      className="text-primary hover:text-white font-bold cursor-pointer transition-all duration-300 hover:scale-110 px-3 py-1 rounded-lg hover:shadow-md"
                      style={{
                        backgroundColor: expandedId === voucher.id ? 'var(--color-primary)' : 'rgba(59, 130, 246, 0.1)'
                      }}
                    >
                      {expandedId === voucher.id ? '▼ Ocultar' : '▶ Ver detalles'}
                    </button>
                  </td>
                </tr>
                {expandedId === voucher.id && (
                  <tr key={`${voucher.id}-details`} className="bg-gray-500/50">
                    <td colSpan={5} className="px-6 py-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                        <button
                          onClick={() => handleViewVoucher(voucher.id)}
                          disabled={loadingViewUrl === voucher.id}
                          className="bg-blue-600/85 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
                          style={{ opacity: loadingViewUrl === voucher.id ? 0.7 : 1 }}
                        >
                          {loadingViewUrl === voucher.id ? (
                            <>
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Cargando...
                            </>
                          ) : (
                            <>
                              📄 Ver comprobante
                            </>
                          )}
                        </button>
                        {!voucher.confirmation_status && (
                          <button
                            onClick={() => handleConfirmVoucher(voucher.id)}
                            disabled={mutating}
                            className="bg-green-700/80 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
                            style={{ opacity: mutating ? 0.5 : 1 }}
                          >
                            ✓ Confirmar
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteVoucher(voucher.id)}
                          disabled={mutating}
                          className="bg-red-600/85 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
                          style={{ opacity: mutating ? 0.5 : 1 }}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-foreground-secondary">
        Total: {total} vouchers
      </div>
    </div>
  );
}
