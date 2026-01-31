import { useState, useEffect } from 'react';
import { useExpensesByMonth } from '@hooks/useExpensesByMonth';
import { useFormatDate } from '@hooks/useFormatDate';
import { useAlert } from '@hooks/useAlert';
import { formatCurrency } from '@utils/formatters';
import {
  Button,
  StatsCard,
  Table,
} from '@shared/ui';
import type { UploadedTransaction } from '@shared/types/bank-transactions.types';

export function ExpenseReport() {
  const alert = useAlert();

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
        <div className="bg-error/10 border border-error text-error px-4 py-3 rounded mb-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <StatsCard
              label="Gasto Total"
              value={`$${formatCurrency(data.summary.totalExpenses)}`}
              variant="error"
              icon="💰"
            />
            <StatsCard
              label="Cantidad de Transacciones"
              value={data.summary.count}
              variant="info"
              icon="📝"
            />
          </div>

          {/* Transactions Table */}
          {data.expenses && data.expenses.length > 0 ? (
            <div className="bg-base shadow-lg rounded-lg border-4 p-6">
              <h3 className="text-lg font-bold mb-4">Gastos del Mes</h3>
              <div className="overflow-x-auto">
                <Table
                  columns={[
                    {
                      id: 'date',
                      header: 'Fecha',
                      align: 'left',
                      render: (txn: UploadedTransaction) =>
                        useFormatDate(txn.date),
                    },
                    {
                      id: 'concept',
                      header: 'Concepto',
                      align: 'left',
                      render: (txn: UploadedTransaction) => txn.concept || '—',
                    },
                    {
                      id: 'amount',
                      header: 'Monto',
                      align: 'right',
                      render: (txn: UploadedTransaction) => (
                        <span className='text-error font-bold'>
                          $ {formatCurrency(Math.abs(txn.amount))} {txn.currency}
                        </span>
                      ),
                    },
                  ]}
                  data={data.expenses}
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
