import { useState } from 'react';
import { useUploadTransactions } from '../hooks/useTransactionsBank';
import { useFormatDate } from '../hooks/useFormatDate';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { StatsCard } from '../ui/StatsCard';

export function TransactionUpload() {
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
              <div className="overflow-x-auto max-h-96 overflow-y-auto border rounded">
                <table className="min-w-full">
                  <thead className="bg-gray-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Fecha</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Hora</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Concepto</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">Monto</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-700">Tipo</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-700">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {uploadResult.transactions.map((txn, idx) => (
                      <tr key={txn.id || idx} className="hover:bg-gray-500">
                        <td className="px-4 py-3 text-sm">{useFormatDate(txn.date)}</td>
                        <td className="px-4 py-3 text-sm">{txn.time}</td>
                        <td className="px-4 py-3 text-sm">{txn.concept}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold">
                          <span className={txn.is_deposit ? 'text-green-700' : 'text-red-700'}>
                            {txn.is_deposit ? '+' : '-'}${txn.amount.toFixed(2)} {txn.currency}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <StatusBadge
                            status={txn.is_deposit ? 'deposit' : 'withdrawal'}
                            label={txn.is_deposit ? 'Depósito' : 'Retiro'}
                            icon={txn.is_deposit ? '📥' : '📤'}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <StatusBadge
                            status={txn.status === 'pending' ? 'pending' : 'success'}
                            label={txn.status === 'pending' ? 'Pendiente' : txn.status}
                            icon={txn.status === 'pending' ? '⏳' : '✓'}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Last Day Transactions */}
          {uploadResult.lastDayTransaction.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-orange-700">
                Transacciones del Último Día ({uploadResult.lastDayTransaction.length})
              </h3>
              <div className="overflow-x-auto max-h-64 overflow-y-auto border rounded border-orange-300">
                <table className="min-w-full">
                  <thead className="bg-orange-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-orange-900">Fecha</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-orange-900">Hora</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-orange-900">Concepto</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-orange-900">Monto</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-orange-900">Tipo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-200">
                    {uploadResult.lastDayTransaction.map((txn, idx) => (
                      <tr key={txn.id || idx} className="hover:bg-orange-50">
                        <td className="px-4 py-3 text-sm">{useFormatDate(txn.date)}</td>
                        <td className="px-4 py-3 text-sm">{txn.time}</td>
                        <td className="px-4 py-3 text-sm">{txn.concept}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold">
                          <span className={txn.is_deposit ? 'text-green-700' : 'text-red-700'}>
                            {txn.is_deposit ? '+' : '-'}${txn.amount.toFixed(2)} {txn.currency}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <StatusBadge
                            status={txn.is_deposit ? 'deposit' : 'withdrawal'}
                            label={txn.is_deposit ? 'Depósito' : 'Retiro'}
                            icon={txn.is_deposit ? '📥' : '📤'}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
    </div>
  );
}
