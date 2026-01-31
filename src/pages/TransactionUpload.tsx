import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUploadTransactions, useTransactionsBank } from '@hooks/useTransactionsBank';
import { useFormatDate } from '@hooks/useFormatDate';
import { useAlert } from '@hooks/useAlert';
import {
  type TabItem,
  Button,
  StatusBadge,
  StatsCard,
  Table,
  BankSelector,
  FileUploadZone,
  Tabs,
} from '@shared/ui';
import type { BankTransaction } from '@shared/types/bank-transactions.types';
import { ROUTES, PREDEFINED_BANKS, BANKS } from '@shared/constants';

// Type for transaction with additional optional fields
type TransactionWithExtras = BankTransaction & {
  bank_name?: string;
  time?: string;
  amount?: number;
  is_deposit?: boolean;
  currency?: string;
  status?: string;
  concept?: string;
};

// Helper functions for safe property access
function getBankName(transaction: TransactionWithExtras): string {
  return transaction.bank_name || '';
}

function getTransactionDate(transaction: TransactionWithExtras): string {
  return transaction.date || transaction.createdAt || '';
}

function getTransactionTime(transaction: TransactionWithExtras): string {
  return transaction.time || '';
}

function getTransactionConcept(transaction: TransactionWithExtras): string {
  return transaction.concept || '';
}

function getTransactionAmount(transaction: TransactionWithExtras): number {
  if (transaction.amount !== undefined) {
    return transaction.amount;
  }
  return transaction.credit || transaction.debit || 0;
}

function isTransactionDeposit(transaction: TransactionWithExtras): boolean {
  if (transaction.is_deposit !== undefined) {
    return transaction.is_deposit;
  }
  return (transaction.credit || 0) > 0;
}

function getTransactionCurrency(transaction: TransactionWithExtras): string {
  return transaction.currency || '';
}

function getTransactionStatus(transaction: TransactionWithExtras): string {
  if (transaction.status) {
    return transaction.status;
  }
  return transaction.reconciled ? 'reconciled' : 'pending';
}

export function TransactionUpload() {
  const navigate = useNavigate();
  const alert = useAlert();
  const { upload, uploading, uploadResult, uploadError, reset } = useUploadTransactions();

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bankSelection, setBankSelection] = useState<string>(BANKS.SANTANDER_2025);
  const [customBank, setCustomBank] = useState<string>('');

  // View/Filter state
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [bankFilter, setBankFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('view');
  const [filtersApplied, setFiltersApplied] = useState<boolean>(false);

  // Memoizar el objeto query para evitar re-renders innecesarios
  const query = useMemo(
    () =>
      filtersApplied
        ? {
            startDate: dateFrom,
            endDate: dateTo,
          }
        : undefined,
    [filtersApplied, dateFrom, dateTo]
  );

  // Get transactions with filters - only when filters are explicitly applied
  const { transactions, loading, error } = useTransactionsBank(query);

  const handleFileSelect = (file: File): void => {
    setSelectedFile(file);
    reset();
  };

  const handleUpload = async (): Promise<void> => {
    if (!selectedFile) {
      alert.warning('Archivo requerido', 'Por favor selecciona un archivo para cargar');
      return;
    }

    let bankName = '';
    if (bankSelection === 'custom') {
      bankName = customBank.trim();
      if (!bankName) {
        alert.warning('Banco requerido', 'Por favor ingresa el nombre del banco personalizado');
        return;
      }
    } else {
      bankName = bankSelection as string;
    }

    try {
      await upload(selectedFile, bankName);
      setSelectedFile(null);
      setCustomBank('');
      setBankSelection(BANKS.SANTANDER_2025);

      alert.success('Éxito', 'Transacciones cargadas correctamente');
    } catch (err) {
      console.error('Error uploading file:', err);
    }
  };

  const handleResetFilters = (): void => {
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setBankFilter('');
    setFiltersApplied(false);
  };

  const handleApplyFilters = async (): Promise<void> => {
    if (!dateFrom || !dateTo) {
      alert.warning('Filtros incompletos', 'Por favor completa las fechas de búsqueda');
      return;
    }
    // setFiltersApplied dispara el efecto en useTransactionsBank automáticamente
    setFiltersApplied(true);
  };

  // Filter transactions by bank if filter is set
  const filteredTransactions = useMemo<TransactionWithExtras[]>(() => {
    // Garantizar que siempre es un array, nunca undefined
    const txns = (transactions || []) as TransactionWithExtras[];

    if (!bankFilter || txns.length === 0) {
      return txns;
    }

    return txns.filter((transaction) => {
      const bankName = getBankName(transaction);
      return bankName.toLowerCase().includes(bankFilter.toLowerCase());
    });
  }, [transactions, bankFilter]);

  const tabs: TabItem[] = [
    {
      id: 'view',
      label: 'Ver Transacciones',
      icon: '📊',
      color: 'green',
      badge: filteredTransactions?.length || 0,
    },
    {
      id: 'upload',
      label: 'Subir Transacciones',
      icon: '📤',
      color: 'blue',
    },
    {
      id: 'history',
      label: 'Registros Históricos',
      icon: '📋',
      color: 'red',
    },
  ];

  return (
    <div className="container flex-1 mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestión de Transacciones Bancarias</h1>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ============ TAB 1: Upload ============ */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          {/* Upload Card - Comprimido */}
          <div className="bg-base shadow-lg rounded-lg border-4 border-primary p-6">
            <h2 className="text-lg font-bold mb-4">🏦 Cargar Transacciones Bancarias</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BankSelector
                value={bankSelection}
                customValue={customBank}
                onBankChange={(bank) => setBankSelection(bank)}
                onCustomChange={setCustomBank}
                predefinedBanks={[...PREDEFINED_BANKS]}
                disabled={uploading}
                customPlaceholder="Ej: Scotiabank-2021, BBVA-2028"
                customHint="Nombre exacto del banco y año"
              />

              <FileUploadZone
                file={selectedFile}
                onFileSelect={handleFileSelect}
                acceptedFormats={['.csv', '.xlsx', '.xls']}
                disabled={uploading}
                dragDropEnabled={true}
                showFileSize={false}
              />
            </div>

            <div className="mt-4">
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                isLoading={uploading}
                variant="primary"
              >
                🏦 Subir Transacciones
              </Button>
            </div>

            {/* Upload Error */}
            {uploadError && (
              <div className="mt-4 bg-error/10 border border-error text-error px-4 py-3 rounded">
                Error: {uploadError}
              </div>
            )}
          </div>

          {/* Upload Result Summary */}
          {uploadResult && uploadResult.success && (
            <div className="bg-base shadow-lg rounded-lg border-4 border-success p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <h3 className="text-lg font-bold text-success">{uploadResult.message}</h3>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                  label="Total"
                  value={uploadResult.totalTransactions}
                  variant="primary"
                  icon="📊"
                />
                <StatsCard
                  label="Válidas"
                  value={uploadResult.validTransactions}
                  variant="success"
                  icon="✅"
                />
                <StatsCard
                  label="Inválidas"
                  value={uploadResult.invalidTransactions}
                  variant="error"
                  icon="❌"
                />
                <StatsCard
                  label="Previas"
                  value={uploadResult.previouslyProcessedTransactions}
                  variant="warning"
                  icon="⚠️"
                />
              </div>

              {/* Date Range */}
              {uploadResult.dateRange && (
                <div className="bg-tertiary p-4 rounded">
                  <p className="text-sm font-semibold text-foreground mb-1">Rango de Fechas:</p>
                  <p className="text-sm text-foreground">
                    {useFormatDate(uploadResult.dateRange.start)} → {useFormatDate(uploadResult.dateRange.end)}
                  </p>
                </div>
              )}

              {/* Errors if any */}
              {uploadResult.errors.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-error mb-2">
                    Errores ({uploadResult.errors.length}):
                  </h4>
                  <div className="bg-error/10 border border-error rounded p-3 max-h-32 overflow-y-auto">
                    <ul className="space-y-1 text-xs text-error">
                      {uploadResult.errors.map((err, idx) => (
                        <li key={idx}>• {typeof err === 'string' ? err : JSON.stringify(err)}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============ TAB 2: View & Filter ============ */}
      {activeTab === 'view' && (
        <div className="space-y-6">
          {/* Filters Card */}
          <div className="bg-base shadow-lg rounded-lg border-4 border-secondary p-6">
            <h2 className="text-lg font-bold mb-4">🔍 Filtrar Transacciones</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-secondary border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Todos</option>
                  <option value="pending">Pendiente</option>
                  <option value="processed">Procesado</option>
                  <option value="failed">Fallido</option>
                  <option value="reconciled">Conciliado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Desde</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-secondary border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Hasta</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-secondary border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Banco</label>
                <input
                  type="text"
                  value={bankFilter}
                  onChange={(e) => setBankFilter(e.target.value)}
                  placeholder="Ej: BANCO_VALOR, Santander"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-secondary border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-foreground-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleApplyFilters}
                disabled={loading}
                isLoading={loading}
                variant="primary"
              >
                🔍 Aplicar Filtros
              </Button>
              <Button
                onClick={handleResetFilters}
                disabled={loading}
                variant="sameUi"
              >
                ↺ Limpiar
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 bg-error/10 border border-error text-error px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Results Summary */}
          {filtersApplied && !loading && filteredTransactions.length > 0 && (
            <div className="bg-secondary shadow-lg rounded-lg border-4 border-info p-4">
              <p className="text-sm text-foreground">
                Mostrando <span className="font-bold">{filteredTransactions.length}</span> de{' '}
                <span className="font-bold">{transactions.length || 0}</span> transacciones
              </p>
            </div>
          )}

          {/* Empty State - No filters applied yet */}
          {!filtersApplied && !loading && (
            <div className="bg-base shadow-lg rounded-lg border-4 border-info p-6 text-center">
              <p className="text-foreground-secondary">
                Aplica los filtros y haz clic en "Aplicar Filtros" para ver las transacciones
              </p>
            </div>
          )}

          {/* Transactions Table */}
          {filtersApplied && filteredTransactions.length > 0 ? (
            <div className="bg-base shadow-lg rounded-lg border-4 p-6">
              <h3 className="text-lg font-bold mb-4">📋 Transacciones</h3>
              <div className="overflow-x-auto">
                <Table
                  columns={[
                    {
                      id: 'date',
                      header: 'Fecha',
                      align: 'left',
                      render: (txn: TransactionWithExtras) => useFormatDate(getTransactionDate(txn)),
                    },
                    {
                      id: 'time',
                      header: 'Hora',
                      align: 'center',
                      render: (txn: TransactionWithExtras) => {
                        const time = getTransactionTime(txn);
                        return time || '—';
                      },
                    },
                    {
                      id: 'concept',
                      header: 'Concepto',
                      align: 'left',
                      render: (txn: TransactionWithExtras) => {
                        const concept = getTransactionConcept(txn);
                        return concept || '—';
                      },
                    },
                    {
                      id: 'amount',
                      header: 'Monto',
                      align: 'right',
                      render: (txn: TransactionWithExtras) => {
                        const amount = getTransactionAmount(txn);
                        const isDeposit = isTransactionDeposit(txn);
                        const currency = getTransactionCurrency(txn);
                        return (
                          <span className={isDeposit ? 'text-success font-bold' : 'text-error font-bold'}>
                            {isDeposit ? '+' : '-'}${Math.abs(amount).toFixed(2)} {currency}
                          </span>
                        );
                      },
                    },
                    {
                      id: 'type',
                      header: 'Tipo',
                      align: 'center',
                      render: (txn: TransactionWithExtras) => {
                        const isDeposit = isTransactionDeposit(txn);
                        return (
                          <StatusBadge
                            status={isDeposit ? 'deposit' : 'withdrawal'}
                            label={isDeposit ? 'Depósito' : 'Retiro'}
                            icon={isDeposit ? '📥' : '📤'}
                          />
                        );
                      },
                    },
                    {
                      id: 'status',
                      header: 'Estado',
                      align: 'center',
                      render: (txn: TransactionWithExtras) => {
                        const status = getTransactionStatus(txn);
                        const isReconciled = status === 'reconciled' || txn.reconciled;
                        return (
                          <StatusBadge
                            status={isReconciled ? 'success' : 'pending'}
                            label={isReconciled ? 'Conciliado' : 'Pendiente'}
                            icon={isReconciled ? '✓' : '⏳'}
                          />
                        );
                      },
                    },
                  ]}
                  data={filteredTransactions}
                  keyField={(row: TransactionWithExtras) => row.id}
                  maxHeight="500px"
                  emptyMessage="No hay transacciones"
                  hoverable
                />
              </div>
            </div>
          ) : (
            filtersApplied && !loading && (
              <div className="bg-base shadow-lg rounded-lg border-4 border-warning p-6 text-center">
                <p className="text-foreground-secondary">No hay transacciones que coincidan con los filtros</p>
              </div>
            )
          )}

          {/* Loading State */}
          {filtersApplied && loading && (
            <div className="bg-base shadow-lg rounded-lg border-4 border-info p-6 text-center">
              <p className="text-foreground">Cargando transacciones...</p>
            </div>
          )}
        </div>
      )}

      {/* ============ TAB 3: Historical Records ============ */}
      {activeTab === 'history' && (
        <div className="bg-base shadow-lg rounded-lg border-4 border-error p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-error/80 mb-2">📋 Registros Históricos Conciliados</h3>
              <p className="text-sm text-foreground-secondary">
                Carga registros históricos de pagos contables que hayan sido previamente conciliados
                para gestionar información de años anteriores
              </p>
            </div>
            <Button
              onClick={() => navigate(ROUTES.HISTORICAL_RECORDS_UPLOAD)}
              variant="error"
              className="whitespace-nowrap"
            >
              Ir a Registros Históricos
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
