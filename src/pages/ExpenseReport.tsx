import { useState, useEffect } from 'react';
import { useExpensesByMonth } from '@hooks/useExpensesByMonth';
import { useFormatDate as formatDate } from '@hooks/useFormatDate';
import { useAlert } from '@hooks/useAlert';
import { useAuth } from '@hooks/useAuth';
import { useBankRefundMutations } from '@hooks/useBankReconciliationEndpoints';
import { formatCurrency } from '@utils/formatters';
import { isAdmin } from '@shared/utils/roleAndStatusHelpers';
import {
  Button,
  InfoCard,
  Modal,
  ModalActions,
  StatsCard,
  Table,
} from '@shared/ui';
import type { UploadedTransaction } from '@shared/types/bank-transactions.types';

export function ExpenseReport() {
  const alert = useAlert();
  const { user } = useAuth();
  const canRevertRefunds = !!user?.role && isAdmin(user.role);
  const { revertBankRefund, reverting } = useBankRefundMutations();
  const [refundToRevert, setRefundToRevert] = useState<UploadedTransaction | null>(null);

  // Get previous month on component load
  const getPreviousMonth = (): Date => {
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);
    return previousMonth;
  };

  const [selectedDate, setSelectedDate] = useState<Date>(getPreviousMonth());
  const { data, loading, error, refetch } = useExpensesByMonth(selectedDate);

  useEffect(() => {
    if (error) {
      alert.error('Error', error);
    }
  }, [error, alert]);

  const handlePreviousMonth = (): void => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 15)
    );
  };

  const handleNextMonth = (): void => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 15)
    );
  };

  const getMonthYear = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      year: 'numeric',
    };
    return date.toLocaleDateString('es-ES', options);
  };

  // Devoluciones bancarias: entradas que restan del gasto total.
  // Fallbacks por si el backend aún no envía los campos nuevos.
  const totalRefunds = data?.summary.totalRefunds ?? 0;
  const refundCount = data?.summary.refundCount ?? 0;
  const netExpenses =
    data?.summary.netExpenses ?? (data ? data.summary.totalExpenses - totalRefunds : 0);

  const handleConfirmRevert = async (): Promise<void> => {
    if (!refundToRevert) return;
    try {
      await revertBankRefund(refundToRevert.id);
      alert.success('Devolución revertida', 'El depósito regresó a Depósitos No Reclamados');
      setRefundToRevert(null);
    } catch (err) {
      alert.error(
        'Error',
        err instanceof Error ? err.message : 'No se pudo revertir la devolución'
      );
    }
  };

  // Solo admin: click en una fila de devolución bancaria abre la confirmación para revertirla
  const handleRowClick = (txn: UploadedTransaction): void => {
    if (canRevertRefunds && txn.is_bank_refund) {
      setRefundToRevert(txn);
    }
  };

  // Check if we can navigate to previous month (limit: December 2024)
  const canNavigatePrevious = (): boolean => {
    const minDate = new Date(2024, 11, 15); // December 2024
    return selectedDate > minDate;
  };

  // Check if we can navigate to next month (limit: one month before today)
  const canNavigateNext = (): boolean => {
    const now = new Date();
    const maxDate = new Date(now.getFullYear(), now.getMonth() - 1, 15);
    return selectedDate < maxDate;
  };

  return (
    <div className="container flex-1 mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">📊 Informe de Gastos</h1>

      {/* Month Selector */}
      <div className="bg-base shadow-lg rounded-lg border-4 border-primary p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-bold mb-2">Mes Seleccionado</h2>
            <p className="text-2xl font-bold text-primary capitalize">
              {getMonthYear(selectedDate)}
            </p>
          </div>

          <div className="flex gap-2">
            {canNavigatePrevious() && (
              <Button
                onClick={handlePreviousMonth}
                disabled={loading}
                variant="primary"
              >
                ← Mes Anterior
              </Button>
            )}
            {canNavigateNext() && (
              <Button
                onClick={handleNextMonth}
                disabled={loading}
                variant="primary"
              >
                Mes Siguiente →
              </Button>
            )}
            <Button
              onClick={() => refetch()}
              disabled={loading}
              isLoading={loading}
              variant="info"
            >
              🔄 Recargar
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="border border-error text-error px-4 py-3 rounded mb-6">
          Error: {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-base shadow-lg rounded-lg border-4 border-info p-6 text-center mb-6">
          <p className="text-foreground">Cargando datos del mes...</p>
        </div>
      )}

      {/* Summary Cards */}
      {data && !loading && (
        <>
          <div
            className={`grid grid-cols-1 gap-4 ${refundCount > 0 ? 'mb-2 md:grid-cols-3' : 'mb-6 md:grid-cols-2'}`}
          >
            <StatsCard
              label="Gasto Total"
              value={`$${formatCurrency(netExpenses)}`}
              variant="error"
              icon="💰"
            />
            {refundCount > 0 && (
              <StatsCard
                label="Devoluciones del Banco"
                value={`$${formatCurrency(totalRefunds)}`}
                variant="success"
                icon="↩"
              />
            )}
            <StatsCard
              label="Cantidad de Transacciones"
              value={data.summary.count + refundCount}
              variant="info"
              icon="📝"
            />
          </div>
          {refundCount > 0 && (
            <p className="text-sm text-foreground-secondary mb-6">
              Gasto Total = Retiros ${formatCurrency(data.summary.totalExpenses)} − Devoluciones $
              {formatCurrency(totalRefunds)} ({data.summary.count} retiros, {refundCount}{' '}
              {refundCount === 1 ? 'devolución' : 'devoluciones'})
            </p>
          )}

          {/* Transactions Table */}
          {data.expenses && data.expenses.length > 0 ? (
            <div className="bg-base shadow-lg rounded-lg border-4 p-6">
              <h3 className="text-lg font-bold mb-4">Movimientos del Mes</h3>
              {canRevertRefunds && refundCount > 0 && (
                <p className="text-xs text-foreground-secondary -mt-2 mb-4">
                  Presiona una fila marcada como ↩ Devolución para revertirla.
                </p>
              )}
              <div className="overflow-x-auto">
                <Table
                  columns={[
                    {
                      id: 'date',
                      header: 'Fecha',
                      align: 'left',
                      render: (txn: UploadedTransaction) => formatDate(txn.date),
                    },
                    {
                      id: 'concept',
                      header: 'Concepto',
                      align: 'left',
                      render: (txn: UploadedTransaction) =>
                        txn.is_bank_refund ? (
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-success border border-success rounded-full px-2 py-0.5">
                              ↩ Devolución
                            </span>
                            {txn.concept || '—'}
                          </span>
                        ) : (
                          txn.concept || '—'
                        ),
                    },
                    {
                      id: 'amount',
                      header: 'Monto',
                      align: 'right',
                      render: (txn: UploadedTransaction) =>
                        txn.is_bank_refund ? (
                          <span className="text-success font-bold">
                            + $ {formatCurrency(Math.abs(txn.amount))} {txn.currency}
                          </span>
                        ) : (
                          <span className="text-error font-bold">
                            $ {formatCurrency(Math.abs(txn.amount))} {txn.currency}
                          </span>
                        ),
                    },
                  ]}
                  data={data.expenses}
                  onRowClick={handleRowClick}
                  keyField={(row: UploadedTransaction) => row.id}
                  maxHeight="600px"
                  emptyMessage="No hay transacciones"
                  hoverable
                />
              </div>
            </div>
          ) : (
            <div className="bg-base shadow-lg rounded-lg border-4 border-info p-6 text-center">
              <p className="text-foreground-secondary">
                No hay transacciones para el mes seleccionado
              </p>
            </div>
          )}
        </>
      )}

      {/* Confirmar reversión de devolución bancaria */}
      <Modal
        isOpen={!!refundToRevert}
        onClose={() => setRefundToRevert(null)}
        title="Revertir devolución bancaria"
        maxWidth="sm"
      >
        {refundToRevert && (
          <>
            <p className="text-sm text-foreground-secondary mb-6">
              El depósito dejará de contar como entrada en este informe y regresará a
              Depósitos No Reclamados, donde podrás asignarlo a una casa o volver a marcarlo.
            </p>
            <InfoCard
              items={[
                {
                  label: 'Monto:',
                  value: `$${formatCurrency(Math.abs(refundToRevert.amount))}`,
                  className: 'text-success',
                },
                { label: 'Fecha:', value: formatDate(refundToRevert.date) },
                { label: 'Concepto:', value: refundToRevert.concept || 'N/A' },
              ]}
            />
            <ModalActions
              onCancel={() => setRefundToRevert(null)}
              onConfirm={handleConfirmRevert}
              isLoading={reverting}
              confirmText="Revertir"
            />
          </>
        )}
      </Modal>

      {/* Initial Empty State */}
      {!data && !loading && !error && (
        <div className="bg-base shadow-lg rounded-lg border-4 border-info p-6 text-center">
          <p className="text-foreground-secondary">
            Cargando datos del mes anterior...
          </p>
        </div>
      )}
    </div>
  );
}
