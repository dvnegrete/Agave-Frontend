import { httpClient } from '../utils/httpClient';
import type {
  HistoricalRecordResponseDto,
  UploadHistoricalRecordsOptions,
  HistoricalRecordsUploadHistory,
} from '../shared';

const API_BASE = '/historical-records';

interface HistoricalRecordResponse {
  data: HistoricalRecordsUploadHistory[];
}

/**
 * Sube archivo Excel con registros históricos
 * @param file - Archivo Excel (.xlsx)
 * @param options - Opciones de upload (incluye bankName requerido)
 * @param signal - AbortSignal para cancelación
 */
export const uploadHistoricalRecords = async (
  file: File,
  options?: UploadHistoricalRecordsOptions,
  signal?: AbortSignal
): Promise<HistoricalRecordResponseDto> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    if (options?.description) {
      formData.append('description', options.description);
    }

    // Construir URL con query parameters
    let endpoint = `${API_BASE}/upload`;
    const params = new URLSearchParams();

    // bankName es requerido por el backend
    if (options?.bankName) {
      params.append('bankName', options.bankName);
    }

    if (options?.validateOnly === true) {
      params.append('validateOnly', 'true');
    }

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return httpClient.post<HistoricalRecordResponseDto>(
      endpoint,
      formData,
      { signal }
    );
  } catch (err: unknown) {
    console.error('❌ [Service] Error in uploadHistoricalRecords:', err);
    throw err;
  }
};

/**
 * Obtiene historial de uploads previos
 * @param signal - AbortSignal para cancelación
 */
export const getUploadHistory = async (
  signal?: AbortSignal
): Promise<HistoricalRecordsUploadHistory[]> => {
  try {
    const response = await httpClient.get<
      HistoricalRecordResponse | HistoricalRecordsUploadHistory[]
    >(`${API_BASE}/upload-history`, { signal });

    // Handle both direct array and wrapped response
    if (Array.isArray(response)) {
      return response;
    }
    return (response as HistoricalRecordResponse).data || [];
  } catch (err: unknown) {
    console.error('❌ [Service] Error in getUploadHistory:', err);
    throw err;
  }
};
