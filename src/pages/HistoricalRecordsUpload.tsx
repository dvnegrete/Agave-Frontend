import { useState } from 'react';
import { useHistoricalRecordsMutation, useUploadHistoryQuery } from '@hooks/index';
import {
  type TabItem,
  type TableColumn,
  Button,
  Tabs,
  StatsCard,
  StatusBadge,
  Table,
  BankSelector,
  FileUploadZone,
} from '@shared/ui';
import {
  type HistoricalRecordResponseDto,
  type RowErrorDto,
  type HistoricalRecordsUploadHistory,
  BANKS,
} from '@shared';
import type { ActiveTab } from '@shared/types/historical-records.types';

export function HistoricalRecordsUpload() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [validateOnly, setValidateOnly] = useState(false);
  const [description, setDescription] = useState('');
  const [bankSelection, setBankSelection] = useState<string>(BANKS.BBVA);
  const [customBank, setCustomBank] = useState<string>('');
  const [uploadResult, setUploadResult] = useState<HistoricalRecordResponseDto | null>(null);
  const [error, setError] = useState<string>('');

  const { upload, isUploading, error: uploadError, reset: resetMutation } = useHistoricalRecordsMutation();
  const { uploadHistory, isLoading: historyLoading } = useUploadHistoryQuery();

  const handleFileSelect = (selectedFile: File): void => {
    setFile(selectedFile);
    setError('');
  };

  const handleUpload = async (): Promise<void> => {
    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }

    // Determinar qué banco usar
    let bankName = '';
    if (bankSelection === 'custom') {
      bankName = customBank.trim();
      if (!bankName) {
        setError('Por favor ingresa el nombre del banco personalizado');
        return;
      }
    } else {
      bankName = bankSelection;
    }

    setError('');
    try {
      const result = await upload({
        file,
        options: {
          bankName: bankName,
          description: description || undefined,
          validateOnly: validateOnly || undefined
        },
      });
      setUploadResult(result as HistoricalRecordResponseDto);
      setFile(null);
      setValidateOnly(false);
      setDescription('');
      setCustomBank('');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Error al subir el archivo');
    }
  };

  const resetForm = (): void => {
    setFile(null);
    setValidateOnly(false);
    setDescription('');
    setBankSelection(BANKS.BBVA);
    setCustomBank('');
    setUploadResult(null);
    setError('');
    resetMutation();
  };

  // Helper to get badge color for error type
  const getErrorTypeBadgeVariant = (errorType: string): 'success' | 'warning' | 'error' | 'info' => {
    switch (errorType) {
      case 'validation':
        return 'warning';
      case 'database':
        return 'error';
      case 'business_rule':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <div className="container flex-1 mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">📊 Registros Históricos Conciliados</h1>

      {/* Tab Navigation */}
      <Tabs
        tabs={[
          { id: 'upload', label: 'Subir Archivo', icon: '📁', color: 'blue' },
          { id: 'history', label: 'Historial', icon: '📜', color: 'blue' },
        ] as TabItem[]}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as ActiveTab)}
      />

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="bg-secondary shadow-lg rounded-lg border-4 border-primary/10 p-6">
          <h2 className="text-2xl font-bold mb-4 text-foreground">📁 Subir Registros Históricos Conciliados</h2>

          {/* Error Message */}
          {(error || uploadError) && (
            <div className="bg-error/10 border-l-4 border-error rounded-lg p-4 mb-4 flex items-start gap-3">
              <span className="text-error text-xl">❌</span>
              <div className="flex-1">
                <p className="text-error font-semibold">Error</p>
                <p className="text-error text-sm">{error || uploadError}</p>
              </div>
            </div>
          )}

          <BankSelector
            value={bankSelection}
            customValue={customBank}
            onBankChange={(bank) => setBankSelection(bank)}
            onCustomChange={setCustomBank}
            predefinedBanks={[BANKS.SANTANDER_2025]}
            disabled={isUploading}
            customPlaceholder="Ej: Scotiabank-2021, BBVA-2028, HSBC, Efectivo"
            customHint="💡 Ingresa el nombre exacto del banco para identificar la fuente de los registros históricos conciliados"
          />

          <FileUploadZone
            file={file}
            onFileSelect={handleFileSelect}
            acceptedFormats={['.xlsx']}
            disabled={isUploading}
            dragDropEnabled={true}
            showFileSize={true}
            label="Selecciona el archivo Excel:"
          />

          {/* Description field */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción (opcional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Registros de enero 2024"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isUploading}
            />
          </div>

          {/* Validate Only Checkbox */}
          <div className="mt-4 flex items-center gap-3">
            <input
              type="checkbox"
              id="validate-only"
              checked={validateOnly}
              onChange={(e) => setValidateOnly(e.target.checked)}
              disabled={isUploading}
              className="w-4 h-4 cursor-pointer"
            />
            <label htmlFor="validate-only" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              Solo validar (sin insertar en base de datos)
            </label>
          </div>

          {/* Upload Button */}
          <div className="mt-6 flex gap-4">
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              isLoading={isUploading}
              variant="success"
            >
              {isUploading ? 'Subiendo...' : 'Subir Archivo'}
            </Button>
            {file && (
              <Button
                onClick={resetForm}
                disabled={isUploading}
                variant="info"
              >
                Cancelar
              </Button>
            )}
          </div>

          {/* Results */}
          {uploadResult && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-6 text-foreground">📊 Resultados de Carga</h3>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatsCard
                  label="Total de Filas"
                  value={uploadResult.total_rows.toString()}
                  variant="info"
                  icon="📋"
                />
                <StatsCard
                  label="Exitosas"
                  value={uploadResult.successful.toString()}
                  variant="success"
                  icon="✅"
                />
                <StatsCard
                  label="Fallidas"
                  value={uploadResult.failed.toString()}
                  variant={uploadResult.failed > 0 ? 'error' : 'success'}
                  icon="❌"
                />
                <StatsCard
                  label="Tasa de Éxito"
                  value={`${uploadResult.success_rate.toFixed(1)}%`}
                  variant={uploadResult.success_rate === 100 ? 'success' : 'warning'}
                  icon="📈"
                />
              </div>

              {/* Errors Table */}
              {uploadResult.errors.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-bold mb-4 text-foreground flex items-center gap-2">
                    <span className="text-error">⚠️</span> Errores Encontrados ({uploadResult.errors.length})
                  </h4>

                  <div className="overflow-x-auto">
                    <Table
                      columns={
                        [
                          {
                            id: 'row_number',
                            header: 'Fila',
                            align: 'center',
                            render: (error: RowErrorDto) => error.row_number,
                          },
                          {
                            id: 'error_type',
                            header: 'Tipo',
                            align: 'center',
                            render: (error: RowErrorDto) => (
                              <StatusBadge
                                status={getErrorTypeBadgeVariant(error.error_type)}
                                label={error.error_type}
                                icon={
                                  error.error_type === 'validation'
                                    ? '⚠️'
                                    : error.error_type === 'database'
                                      ? '🗄️'
                                      : '📋'
                                }
                              />
                            ),
                          },
                          {
                            id: 'message',
                            header: 'Mensaje',
                            align: 'left',
                            render: (error: RowErrorDto) => (
                              <div className="text-sm max-w-xs">
                                {error.message}
                                {error.details && (
                                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                    {JSON.stringify(error.details, null, 2)}
                                  </div>
                                )}
                              </div>
                            ),
                          },
                        ] as TableColumn[]
                      }
                      data={uploadResult.errors}
                      emptyMessage="Sin errores"
                      hoverable
                    />
                  </div>
                </div>
              )}

              {/* Summary Message */}
              <div
                className={`mt-6 p-4 rounded-lg border-l-4 bg-tertiary ${uploadResult.failed === 0
                  ? 'border-success text-success'
                  : 'border-warning text-warning'
                  }`}
              >
                <p className="font-semibold">
                  {uploadResult.failed === 0
                    ? '✅ Carga completada exitosamente'
                    : `⚠️ Carga completada con ${uploadResult.failed} errores`}
                </p>
                <p className="text-sm mt-1">
                  {uploadResult.successful} de {uploadResult.total_rows} filas fueron procesadas correctamente
                </p>
              </div>

              {/* Reset Button */}
              <Button onClick={resetForm} variant="info" className="mt-4">
                Subir Otro Archivo
              </Button>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-secondary shadow-lg rounded-lg border-4 border-primary/10 p-6">
          <h2 className="text-2xl font-bold mb-4 text-foreground">📜 Historial de Cargas</h2>

          {historyLoading ? (
            <div className="text-center py-8 text-foreground-secondary">
              Cargando historial...
            </div>
          ) : uploadHistory.length === 0 ? (
            <div className="text-center py-8 text-foreground-secondary">
              No hay cargas registradas aún
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table
                columns={
                  [
                    {
                      id: 'uploaded_at',
                      header: 'Fecha',
                      align: 'left',
                      render: (record) =>
                        new Date(record.uploaded_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }),
                    },
                    {
                      id: 'filename',
                      header: 'Archivo',
                      align: 'left',
                      render: (record) => record.filename,
                    },
                    {
                      id: 'description',
                      header: 'Descripción',
                      align: 'left',
                      render: (record) => record.description || '-',
                    },
                    {
                      id: 'total_rows',
                      header: 'Total',
                      align: 'center',
                      render: (record) => record.total_rows,
                    },
                    {
                      id: 'successful',
                      header: 'Exitosas',
                      align: 'center',
                      render: (record) => (
                        <span className="text-success font-semibold">{record.successful}</span>
                      ),
                    },
                    {
                      id: 'failed',
                      header: 'Fallidas',
                      align: 'center',
                      render: (record) => (
                        <span className={record.failed > 0 ? 'text-error font-semibold' : ''}>
                          {record.failed}
                        </span>
                      ),
                    },
                    {
                      id: 'success_rate',
                      header: 'Tasa de Éxito',
                      align: 'center',
                      render: (record) => (
                        <StatusBadge
                          status={record.success_rate === 100 ? 'success' : 'warning'}
                          label={`${record.success_rate.toFixed(1)}%`}
                          icon={record.success_rate === 100 ? '✅' : '⚠️'}
                        />
                      ),
                    },
                  ] as TableColumn<HistoricalRecordsUploadHistory>[]
                }
                data={uploadHistory}
                emptyMessage="Sin historial de cargas"
                hoverable
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
