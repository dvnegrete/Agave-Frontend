import { httpClient } from '@utils/httpClient';
import { API_ENDPOINTS } from '@config/api';
import type {
  VoucherUploadResponse,
  VoucherConfirmRequest,
  VoucherConfirmResponse,
} from '@shared/types/voucher-upload.types';

/**
 * Upload a voucher file (image or PDF) for OCR processing
 */
export const uploadVoucher = async (
  file: File,
  language: string = 'es',
  userId?: string | null,
  signal?: AbortSignal
): Promise<VoucherUploadResponse> => {
  try {
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
  } catch (err: unknown) {
    console.error('❌ [Service] Error in uploadVoucher:', err);
    throw err;
  }
};

/**
 * Confirm a voucher and save it to the database
 */
export const confirmVoucher = async (
  data: VoucherConfirmRequest,
  signal?: AbortSignal
): Promise<VoucherConfirmResponse> => {
  try {
    return httpClient.post<VoucherConfirmResponse>(
      API_ENDPOINTS.voucherFrontendConfirm,
      data,
      { signal }
    );
  } catch (err: unknown) {
    console.error('❌ [Service] Error in confirmVoucher:', err);
    throw err;
  }
};
