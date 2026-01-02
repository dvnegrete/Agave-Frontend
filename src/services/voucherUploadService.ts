import { httpClient } from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api';
import type {
  VoucherUploadResponse,
  VoucherConfirmRequest,
  VoucherConfirmResponse,
} from '../types/api.types';

/**
 * Upload a voucher file (image or PDF) for OCR processing
 */
export const uploadVoucher = async (
  file: File,
  language: string = 'es',
  userId?: string | null,
  signal?: AbortSignal
): Promise<VoucherUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);
  if (userId) {
    formData.append('userId', userId);
  }

  return httpClient.post<VoucherUploadResponse>(
    API_ENDPOINTS.voucherFrontendUpload,
    formData,
    { signal }
  );
};

/**
 * Confirm a voucher and save it to the database
 */
export const confirmVoucher = async (
  data: VoucherConfirmRequest,
  signal?: AbortSignal
): Promise<VoucherConfirmResponse> => {
  return httpClient.post<VoucherConfirmResponse>(
    API_ENDPOINTS.voucherFrontendConfirm,
    data,
    { signal }
  );
};
