import { useState } from 'react';
import { useVouchersQuery, useVoucherMutations } from '../hooks/useVouchersQuery';
import { useFormatDate } from '../hooks/useFormatDate';
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
  } = useVouchersQuery();

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
        console.log('🔗 [View Voucher] Abriendo URL:', voucher.viewUrl);
        window.open(voucher.viewUrl, '_blank');
      } else {
        console.warn('⚠️ [View Voucher] No hay viewUrl disponible:', voucher);
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
        <div className="text-lg">Cargando vouchers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  // Validar que vouchers sea un array
  if (!vouchers || !Array.isArray(vouchers)) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg text-gray-500">No hay vouchers disponibles</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Vouchers</h1>
          {isFetching && !isLoading && (
            <div className="flex items-center text-sm text-gray-500">
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
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Crear Voucher
        </button>
      </div>

      <div className="shadow-md border-2 border-gray-300 rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">
                Casa
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="background-general divide-y divide-gray-200">
            {vouchers.map((voucher) => (
              <>
                <tr key={voucher.id} className={expandedId === voucher.id ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {voucher.number_house}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {useFormatDate(voucher.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold">
                    ${voucher.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${voucher.confirmation_status
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}
                    >
                      {voucher.confirmation_status ? 'Confirmado' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <button
                      onClick={() => toggleExpand(voucher.id)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      {expandedId === voucher.id ? 'Ocultar detalles' : 'Ver detalles'}
                    </button>
                  </td>
                </tr>
                {expandedId === voucher.id && (
                  <tr key={`${voucher.id}-details`} className="bg-blue-50">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Número de Autorización:</p>
                          <p className="text-sm text-gray-900">{voucher.authorization_number}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Código de Confirmación:</p>
                          <p className="text-sm text-gray-900 font-mono">{voucher.confirmation_code}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => handleViewVoucher(voucher.id)}
                          disabled={loadingViewUrl === voucher.id}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 flex items-center gap-2"
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
                            'Ver comprobante'
                          )}
                        </button>
                        {!voucher.confirmation_status && (
                          <button
                            onClick={() => handleConfirmVoucher(voucher.id)}
                            disabled={mutating}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                          >
                            Confirmar
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteVoucher(voucher.id)}
                          disabled={mutating}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                        >
                          Eliminar
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

      <div className="mt-4 text-sm text-gray-700">
        Total: {total} vouchers
      </div>
    </div>
  );
}
