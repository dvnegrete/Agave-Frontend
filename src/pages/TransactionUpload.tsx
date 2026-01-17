import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUploadTransactions } from '@hooks/useTransactionsBank';
import { useFormatDate } from '@hooks/useFormatDate';
import { useAlert } from '@hooks/useAlert';
import {
  type TableColumn,
  Button,
  StatusBadge,
  StatsCard,
  Table,
  BankSelector,
  FileUploadZone
} from '@shared/ui';
import { ROUTES, PREDEFINED_BANKS, BANKS } from '@shared/constants';
import type { UploadedTransaction } from '@shared';

export function TransactionUpload() {
  const navigate = useNavigate();
  const alert = useAlert();
  const { upload, uploading, uploadResult, uploadError, reset } =
    useUploadTransactions();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bankSelection, setBankSelection] = useState<string>(BANKS.SANTANDER_2025);
  const [customBank, setCustomBank] = useState<string>('');

  const handleFileSelect = (file: File): void => {
    setSelectedFile(file);
    reset();
  };

  const handleUpload = async (): Promise<void> => {
    if (!selectedFile) {
      alert.warning('Archivo requerido', 'Por favor selecciona un archivo para cargar');
      return;
    }

    // Determinar qué banco usar
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

      // Limpiar archivo
      setSelectedFile(null);
      setCustomBank('');
      setBankSelection(BANKS.SANTANDER_2025);
    } catch (err) {
      console.error('Error uploading file:', err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        Cargar Transacciones Bancarias
      </h1>

      {/* Upload Section */}
      <div className="background-general shadow-lg rounded-lg border-4 p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">🏦 Cargar Transacciones Bancarias</h2>

        <BankSelector
          value={bankSelection}
          customValue={customBank}
          onBankChange={(bank) => setBankSelection(bank)}
          onCustomChange={setCustomBank}
          predefinedBanks={[...PREDEFINED_BANKS]}
          disabled={uploading}
          customPlaceholder="Ej: Scotiabank-2021, BBVA-2028, HSBC, Efectivo"
          customHint="💡 Ingresa el nombre exacto del banco y el año de la creación de la cuenta para identificar la fuente de las transacciones"
        />

        <FileUploadZone
          file={selectedFile}
          onFileSelect={handleFileSelect}
          acceptedFormats={['.csv', '.xlsx', '.xls']}
          disabled={uploading}
          dragDropEnabled={true}
          showFileSize={false}
        />

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          isLoading={uploading}
          variant="primary"
        >
          🏦 Subir Transacciones
        </Button>

        {/* Upload Error */}
        {uploadError && (
          <div className="mt-4 bg-error/10 border border-error text-error px-4 py-3 rounded">
            Error al subir archivo: {uploadError}
          </div>
        )}
      </div>

      {/* Upload Result Details */}
      {uploadResult && uploadResult.success && (
        <div className="bg-base shadow-lg rounded-lg border-4 border-success p-6 mb-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">✅</span>
            <h2 className="text-xl font-bold text-success">{uploadResult.message}</h2>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              label="Total Transacciones"
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
              label="Previamente Procesadas"
              value={uploadResult.previouslyProcessedTransactions}
              variant="warning"
              icon="⚠️"
            />
          </div>

          {/* Date Range */}
          {uploadResult.dateRange && (
            <div className="bg-tertiary p-4 rounded">
              <p className="text-sm font-semibold text-foreground mb-2">Rango de Fechas:</p>
              <p className="text-sm text-foreground">
                {useFormatDate(uploadResult.dateRange.start)} -{' '}
                {useFormatDate(uploadResult.dateRange.end)}
              </p>
            </div>
          )}

          {/* Transactions Table */}
          {uploadResult.transactions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Transacciones Procesadas ({uploadResult.transactions.length})
              </h3>
              <Table
                columns={[
                  {
                    id: 'date',
                    header: 'Fecha',
                    align: 'left',
                    render: (txn) => useFormatDate(txn.date),
                  },
                  {
                    id: 'time',
                    header: 'Hora',
                    align: 'left',
                    render: (txn) => txn.time,
                  },
                  {
                    id: 'concept',
                    header: 'Concepto',
                    align: 'left',
                    render: (txn) => txn.concept,
                  },
                  {
                    id: 'amount',
                    header: 'Monto',
                    align: 'right',
                    render: (txn) => (
                      <span className={txn.is_deposit ? 'text-success font-bold' : 'text-error font-bold'}>
                        {txn.is_deposit ? '+' : '-'}${txn.amount.toFixed(2)} {txn.currency}
                      </span>
                    ),
                  },
                  {
                    id: 'type',
                    header: 'Tipo',
                    align: 'center',
                    render: (txn) => (
                      <StatusBadge
                        status={txn.is_deposit ? 'deposit' : 'withdrawal'}
                        label={txn.is_deposit ? 'Depósito' : 'Retiro'}
                        icon={txn.is_deposit ? '📥' : '📤'}
                      />
                    ),
                  },
                  {
                    id: 'status',
                    header: 'Estado',
                    align: 'center',
                    render: (txn) => (
                      <StatusBadge
                        status={txn.status === 'pending' ? 'pending' : 'success'}
                        label={txn.status === 'pending' ? 'Pendiente' : txn.status}
                        icon={txn.status === 'pending' ? '⏳' : '✓'}
                      />
                    ),
                  },
                ] as TableColumn<UploadedTransaction>[]}
                data={uploadResult.transactions}
                keyField={(row) => row.id || row.concept}
                maxHeight="384px"
                emptyMessage="No hay transacciones procesadas"
                hoverable
              />
            </div>
          )}

          {/* Last Day Transactions */}
          {uploadResult.lastDayTransaction.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-warning">
                Transacciones del Último Día ({uploadResult.lastDayTransaction.length})
              </h3>
              <Table
                columns={[
                  {
                    id: 'date',
                    header: 'Fecha',
                    align: 'left',
                    render: (txn) => useFormatDate(txn.date),
                  },
                  {
                    id: 'time',
                    header: 'Hora',
                    align: 'left',
                    render: (txn) => txn.time,
                  },
                  {
                    id: 'concept',
                    header: 'Concepto',
                    align: 'left',
                    render: (txn) => txn.concept,
                  },
                  {
                    id: 'amount',
                    header: 'Monto',
                    align: 'right',
                    render: (txn) => (
                      <span className={txn.is_deposit ? 'text-success font-bold' : 'text-error font-bold'}>
                        {txn.is_deposit ? '+' : '-'}${txn.amount.toFixed(2)} {txn.currency}
                      </span>
                    ),
                  },
                  {
                    id: 'type',
                    header: 'Tipo',
                    align: 'center',
                    render: (txn) => (
                      <StatusBadge
                        status={txn.is_deposit ? 'deposit' : 'withdrawal'}
                        label={txn.is_deposit ? 'Depósito' : 'Retiro'}
                        icon={txn.is_deposit ? '📥' : '📤'}
                      />
                    ),
                  },
                ] as TableColumn<UploadedTransaction>[]}
                data={uploadResult.lastDayTransaction}
                keyField={(row) => row.id || row.concept}
                maxHeight="256px"
                emptyMessage="No hay transacciones del último día"
                hoverable
              />
            </div>
          )}

          {/* Errors */}
          {uploadResult.errors.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-error">
                Errores ({uploadResult.errors.length})
              </h3>
              <div className="bg-error/10 border border-error rounded p-4 max-h-48 overflow-y-auto">
                <ul className="list-disc list-inside space-y-1">
                  {uploadResult.errors.map((error, idx) => (
                    <li key={idx} className="text-sm text-error">
                      {typeof error === 'string' ? error : JSON.stringify(error)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historical Records Option */}
      <div className="mt-8 bg-base shadow-lg rounded-lg border-4 border-error p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-error/80 mb-2">📊 Cargar Registros Históricos Conciliados</h3>
            <p className="text-sm text-foreground-secondary">
              Carga registros históricos de pagos contables que hayan sido previamente Conciliados para gestionar información de años anteriores
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
    </div>
  );
}
