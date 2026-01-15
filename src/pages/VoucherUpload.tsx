import { useState } from 'react';
import { uploadVoucher, confirmVoucher } from '@services/voucherUploadService';
import type {
  VoucherStructuredData,
  ValidationResult,
  Step,
} from '@shared';

export function VoucherUpload() {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<VoucherStructuredData | null>(null);
  const [gcsFilename, setGcsFilename] = useState<string>('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [confirmationCode, setConfirmationCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  const processFile = async (selectedFile: File): Promise<void> => {
    setFile(selectedFile);
    setLoading(true);
    setError('');

    try {
      const result = await uploadVoucher(selectedFile, 'es');

      setExtractedData(result.structuredData);
      setGcsFilename(result.gcsFilename || '');
      setValidation(result.validation);

      // Mostrar pantalla de revisión incluso si hay validaciones faltantes
      // El usuario puede completar los datos
      setStep('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar imagen');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    await processFile(selectedFile);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      void processFile(droppedFile);
    }
  };

  const handleDataChange = (
    field: keyof VoucherStructuredData,
    value: string | number
  ): void => {
    setExtractedData((prev) =>
      prev
        ? {
            ...prev,
            [field]: value,
          }
        : null
    );
  };

  const handleConfirm = async (): Promise<void> => {
    if (!extractedData || !gcsFilename) return;

    setLoading(true);
    setError('');

    try {
      const confirmData = {
        gcsFilename,
        monto: extractedData.monto,
        fecha_pago: extractedData.fecha_pago,
        hora_transaccion: extractedData.hora_transaccion || '12:00:00',
        casa: extractedData.casa || 0,
        referencia: extractedData.referencia,
      };

      const result = await confirmVoucher(confirmData);
      setConfirmationCode(result.confirmationCode);
      setStep('confirmed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al confirmar');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (): void => {
    setStep('upload');
    setFile(null);
    setExtractedData(null);
    setGcsFilename('');
    setValidation(null);
    setConfirmationCode('');
    setError('');
  };

  const isFieldMissing = (fieldName: string): boolean => {
    return validation?.missingFields.includes(fieldName) ?? false;
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return validation?.errors[fieldName];
  };

  const canConfirm = (): boolean => {
    if (!extractedData) return false;
    // Validar que todos los campos requeridos tengan valor
    if (!extractedData.monto || !extractedData.fecha_pago || extractedData.casa === null || extractedData.casa === undefined) {
      return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        {/* STEP 1: UPLOAD */}
        {step === 'upload' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Subir Comprobante
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selecciona una imagen o PDF de tu comprobante de pago
              </p>
            </div>

            <div className="space-y-4">
              <div
                className={`flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-all cursor-pointer ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="space-y-1 text-center">
                  <svg
                    className={`mx-auto h-12 w-12 transition-colors ${
                      dragActive ? 'text-blue-500' : 'text-gray-400'
                    }`}
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx={32} cy={20} r={3} stroke="currentColor" strokeWidth={2} />
                    <path
                      d="M21 15l7 7m0 0l7-7m-7 7v8"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label className="relative cursor-pointer rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                      <span>Selecciona un archivo</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileSelect}
                        disabled={loading}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">o arrastra aquí</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    PNG, JPG, PDF hasta 10MB
                  </p>
                </div>
              </div>

              {file && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    ✓ Archivo seleccionado: {file.name}
                  </p>
                </div>
              )}

              {loading && (
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Procesando imagen con OCR...
                  </p>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                  <p className="text-sm text-red-800 dark:text-red-300">❌ {error}</p>
                </div>
              )}

              {validation?.warnings && validation.warnings.length > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                    ⚠️ Advertencias:
                  </p>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                    {validation.warnings.map((warning, idx) => (
                      <li key={idx}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: REVIEW & EDIT */}
        {step === 'review' && extractedData && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Revisar Datos Extraídos
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Verifica y edita los datos extraídos del comprobante
              </p>
            </div>

            {!validation?.isValid && validation?.missingFields.length ? (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                  ⚠️ Campos requeridos faltantes:
                </p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                  {validation.missingFields.map((field) => (
                    <li key={field}>• {field}</li>
                  ))}
                </ul>
                <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-3">
                  Por favor completa los campos marcados para continuar.
                </p>
              </div>
            ) : null}

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Monto * {isFieldMissing('monto') && <span className="text-red-500">(Falta completar)</span>}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={extractedData.monto}
                  onChange={(e) => handleDataChange('monto', e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 ${
                    isFieldMissing('monto') || getFieldError('monto')
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  required
                />
                {getFieldError('monto') && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{getFieldError('monto')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fecha de Pago * {isFieldMissing('fecha_pago') && <span className="text-red-500">(Falta completar)</span>}
                </label>
                <input
                  type="date"
                  value={extractedData.fecha_pago}
                  onChange={(e) => handleDataChange('fecha_pago', e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 ${
                    isFieldMissing('fecha_pago') || getFieldError('fecha_pago')
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  required
                />
                {getFieldError('fecha_pago') && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{getFieldError('fecha_pago')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hora de Transacción {isFieldMissing('hora_transaccion') && <span className="text-red-500">(Falta completar)</span>}
                </label>
                <input
                  type="time"
                  value={extractedData.hora_transaccion || '12:00'}
                  onChange={(e) => handleDataChange('hora_transaccion', e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 ${
                    isFieldMissing('hora_transaccion') || getFieldError('hora_transaccion')
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                {getFieldError('hora_transaccion') && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{getFieldError('hora_transaccion')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Casa * {isFieldMissing('casa') && <span className="text-red-500">(Falta completar)</span>}
                </label>
                <input
                  type="number"
                  min="1"
                  max="66"
                  value={extractedData.casa || ''}
                  onChange={(e) => handleDataChange('casa', parseInt(e.target.value))}
                  className={`mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 ${
                    isFieldMissing('casa') || getFieldError('casa')
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  required
                />
                {getFieldError('casa') && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{getFieldError('casa')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Referencia {isFieldMissing('referencia') && <span className="text-red-500">(Falta completar)</span>}
                </label>
                <input
                  type="text"
                  value={extractedData.referencia || ''}
                  onChange={(e) => handleDataChange('referencia', e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 ${
                    isFieldMissing('referencia') || getFieldError('referencia')
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Ej: AUTH123456"
                />
                {getFieldError('referencia') && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{getFieldError('referencia')}</p>
                )}
              </div>
            </form>

            {validation?.errors && Object.keys(validation.errors).length > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                  ❌ Errores de validación:
                </p>
                <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                  {Object.entries(validation.errors).map(([field, message]) => (
                    <li key={field}>• {field}: {message}</li>
                  ))}
                </ul>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                <p className="text-sm text-red-800 dark:text-red-300">❌ {error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleConfirm}
                disabled={loading || !canConfirm()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded transition-colors"
                title={!canConfirm() ? 'Completa los campos requeridos para continuar' : 'Confirmar comprobante'}
              >
                {loading ? 'Confirmando...' : 'Confirmar'}
              </button>
              <button
                onClick={resetForm}
                disabled={loading}
                className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRMED */}
        {step === 'confirmed' && (
          <div className="space-y-6 text-center">
            <div className="text-5xl">✅</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Comprobante Registrado
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Tu comprobante ha sido procesado correctamente
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Código de confirmación:
              </p>
              <p className="text-xl font-bold text-green-700 dark:text-green-400 break-all">
                {confirmationCode}
              </p>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                Guarda este código para futuras referencias
              </p>
            </div>

            <button
              onClick={resetForm}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Subir Otro Comprobante
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
