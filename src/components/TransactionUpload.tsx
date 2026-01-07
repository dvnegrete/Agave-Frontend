import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUploadTransactions } from '../hooks/useTransactionsBank';
import { useFormatDate } from '../hooks/useFormatDate';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { StatsCard } from '../ui/StatsCard';
import { Table, type TableColumn } from '../ui/Table';

export function TransactionUpload() {
  const navigate = useNavigate();
  const { upload, uploading, uploadResult, uploadError, reset } =
    useUploadTransactions();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedBank, setSelectedBank] = useState<string>('Santander');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      reset();
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Por favor selecciona un archivo');
      return;
    }

    try {
      console.log('📤 [Upload] Subiendo archivo:', {
        fileName: selectedFile.name,
        bank: selectedBank,
      });

      await upload(selectedFile, selectedBank);

      console.log('✅ [Upload] Upload exitoso');

      // Limpiar archivo
      setSelectedFile(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err) {
      console.error('❌ [Upload] Error uploading file:', err);
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

        {/* Bank Selection */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Selecciona el Banco:
          </label>
          <div className="flex gap-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="bank"
                value="Santander"
                checked={selectedBank === 'Santander'}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="mr-2 w-4 h-4"
              />
              <span className="text-sm font-medium">Santander</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="bank"
                value="BBVA-2026"
                checked={selectedBank === 'BBVA-2026'}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="mr-2 w-4 h-4"
              />
              <span className="text-sm font-medium">BBVA-2026</span>
            </label>
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Selecciona el archivo:
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2"
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600">
              Archivo seleccionado: <span className="font-semibold">{selectedFile.name}</span>
            </p>
          )}
        </div>

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
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error al subir archivo: {uploadError}
          </div>
        )}
      </div>

      {/* Upload Result Details */}
      {uploadResult && uploadResult.success && (
        <div className="background-general shadow-lg rounded-lg border-4 border-green-500 p-6 mb-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">✅</span>
            <h2 className="text-xl font-bold text-green-700">{uploadResult.message}</h2>
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
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm font-semibold text-gray-700 mb-2">Rango de Fechas:</p>
              <p className="text-sm text-gray-900">
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
                ] as TableColumn[]}
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
                ] as TableColumn[]}
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
              <h3 className="text-lg font-semibold mb-3 text-red-700">
                Errores ({uploadResult.errors.length})
              </h3>
              <div className="bg-red-50 border border-red-300 rounded p-4 max-h-48 overflow-y-auto">
                <ul className="list-disc list-inside space-y-1">
                  {uploadResult.errors.map((error, idx) => (
                    <li key={idx} className="text-sm text-red-700">
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
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 shadow-lg rounded-lg border-4 border-blue-200 dark:border-blue-800 p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground mb-2">📊 Cargar Registros Históricos</h3>
            <p className="text-sm text-foreground-secondary">
              Carga registros históricos de pagos contables desde archivos Excel para gestionar información de años anteriores
            </p>
          </div>
          <Button
            onClick={() => navigate('/historical-records-upload')}
            variant="info"
            className="whitespace-nowrap"
          >
            Ir a Registros Históricos
          </Button>
        </div>
      </div>
    </div>
  );
}
