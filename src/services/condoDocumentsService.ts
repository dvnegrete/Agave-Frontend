import { httpClient } from '@utils/httpClient';
import { API_ENDPOINTS } from '@config/api';
import type {
  CondoDocumentItem,
  CondoDocumentSignedUrl,
  CondoDocumentType,
  UploadCondoDocumentRequest,
  UploadCondoDocumentResponse,
} from '@shared/types/condo-documents.types';

export const listCondoDocuments = (
  type: CondoDocumentType,
  signal?: AbortSignal,
): Promise<CondoDocumentItem[]> => {
  const url = `${API_ENDPOINTS.condoDocuments}?type=${encodeURIComponent(type)}`;
  return httpClient.get<CondoDocumentItem[]>(url, { signal });
};

export const getCondoDocumentSignedUrl = (
  name: string,
  type: CondoDocumentType,
  signal?: AbortSignal,
): Promise<CondoDocumentSignedUrl> => {
  const params = new URLSearchParams({ name, type });
  const url = `${API_ENDPOINTS.condoDocumentsSignedUrl}?${params.toString()}`;
  return httpClient.get<CondoDocumentSignedUrl>(url, { signal });
};

export const uploadCondoDocument = (
  payload: UploadCondoDocumentRequest,
): Promise<UploadCondoDocumentResponse> => {
  const formData = new FormData();
  formData.append('file', payload.file);
  formData.append('type', payload.type);
  if (payload.date) {
    formData.append('date', payload.date);
  }
  return httpClient.post<UploadCondoDocumentResponse>(
    API_ENDPOINTS.condoDocumentsUpload,
    formData,
  );
};
