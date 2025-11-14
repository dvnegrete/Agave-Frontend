import { useVouchers, useVoucherMutations } from '../hooks/useVouchers';

export function VoucherList() {
  const {
    vouchers,
    loading,
    error,
    total,
    page,
    limit,
    setPage,
    refetch,
  } = useVouchers({ status: 'pending' });

  const { create, update, remove, loading: mutating } = useVoucherMutations();

  const handleCreateVoucher = async () => {
    try {
      await create({
        voucherNumber: 'V-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        description: 'Nuevo voucher de ejemplo',
        entries: [
          {
            accountId: 'account-1',
            debit: 1000,
            credit: 0,
            description: 'Cargo de ejemplo',
          },
        ],
      });
      refetch();
    } catch (err) {
      console.error('Error creating voucher:', err);
    }
  };

  const handleApproveVoucher = async (id: string) => {
    try {
      await update(id, { status: 'approved' });
      refetch();
    } catch (err) {
      console.error('Error approving voucher:', err);
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este voucher?')) {
      try {
        await remove(id);
        refetch();
      } catch (err) {
        console.error('Error deleting voucher:', err);
      }
    }
  };

  if (loading) {
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

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vouchers Pendientes</h1>
        <button
          onClick={handleCreateVoucher}
          disabled={mutating}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Crear Voucher
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vouchers.map((voucher) => (
              <tr key={voucher.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {voucher.voucherNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(voucher.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">{voucher.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ${voucher.totalAmount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      voucher.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : voucher.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {voucher.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleApproveVoucher(voucher.id)}
                    disabled={mutating}
                    className="text-green-600 hover:text-green-900 mr-3 disabled:opacity-50"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleDeleteVoucher(voucher.id)}
                    disabled={mutating}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Mostrando {vouchers.length} de {total} vouchers
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-4 py-2">Página {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={vouchers.length < limit}
            className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
