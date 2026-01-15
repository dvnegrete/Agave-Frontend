import { httpClient } from '@utils/httpClient';
import { API_ENDPOINTS } from '@config/api';
import type {
  Voucher,
  VouchersResponse,
  VoucherQuery,
  CreateVoucherRequest,
  UpdateVoucherRequest,
} from '@shared/types/vouchers.types';
import type {
  ApiResponse,
} from '@shared/types/common.types';

/**
 * Get all vouchers with optional filters
 */
export const getVouchers = async (
  query?: VoucherQuery,
  signal?: AbortSignal
): Promise<VouchersResponse> => {
  try {
    const params = new URLSearchParams();

    if (query?.confirmation_status !== undefined) {
      params.append('confirmation_status', query.confirmation_status.toString());
    }
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);

    const queryString = params.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.vouchers}?${queryString}`
      : API_ENDPOINTS.vouchers;

    return httpClient.get<VouchersResponse>(endpoint, { signal });
  } catch (err: unknown) {
    console.error('❌ [Service] Error in getVouchers:', err);
    throw err;
  }
};

/**
 * Get a single voucher by ID
 */
export const getVoucherById = async (
  id: string,
  signal?: AbortSignal
): Promise<Voucher> => {
  try {
    return httpClient.get<Voucher>(API_ENDPOINTS.voucherById(id), { signal });
  } catch (err: unknown) {
    console.error('❌ [Service] Error in getVoucherById:', err);
    throw err;
  }
};

/**
 * Create a new voucher
 */
export const createVoucher = async (
  data: CreateVoucherRequest,
  signal?: AbortSignal
): Promise<ApiResponse<Voucher>> => {
  try {
    return httpClient.post<ApiResponse<Voucher>>(
      API_ENDPOINTS.vouchers,
      data,
      { signal }
    );
  } catch (err: unknown) {
    console.error('❌ [Service] Error in createVoucher:', err);
    throw err;
  }
};

/**
 * Update an existing voucher
 */
export const updateVoucher = async (
  id: string,
  data: UpdateVoucherRequest,
  signal?: AbortSignal
): Promise<ApiResponse<Voucher>> => {
  try {
    return httpClient.put<ApiResponse<Voucher>>(
      API_ENDPOINTS.voucherById(id),
      data,
      { signal }
    );
  } catch (err: unknown) {
    console.error('❌ [Service] Error in updateVoucher:', err);
    throw err;
  }
};

/**
 * Delete a voucher
 */
export const deleteVoucher = async (
  id: string,
  signal?: AbortSignal
): Promise<ApiResponse<void>> => {
  try {
    return httpClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.voucherById(id),
      { signal }
    );
  } catch (err: unknown) {
    console.error('❌ [Service] Error in deleteVoucher:', err);
    throw err;
  }
};
