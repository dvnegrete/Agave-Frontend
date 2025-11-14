import { httpClient } from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api';
import type {
  Voucher,
  VouchersResponse,
  VoucherQuery,
  CreateVoucherRequest,
  UpdateVoucherRequest,
  ApiResponse,
} from '../types/api.types';

/**
 * Get all vouchers with optional filters
 */
export const getVouchers = async (
  query?: VoucherQuery,
  signal?: AbortSignal
): Promise<VouchersResponse> => {
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
};

/**
 * Get a single voucher by ID
 */
export const getVoucherById = async (
  id: string,
  signal?: AbortSignal
): Promise<Voucher> => {
  return httpClient.get<Voucher>(API_ENDPOINTS.voucherById(id), { signal });
};

/**
 * Create a new voucher
 */
export const createVoucher = async (
  data: CreateVoucherRequest,
  signal?: AbortSignal
): Promise<ApiResponse<Voucher>> => {
  return httpClient.post<ApiResponse<Voucher>>(
    API_ENDPOINTS.vouchers,
    data,
    { signal }
  );
};

/**
 * Update an existing voucher
 */
export const updateVoucher = async (
  id: string,
  data: UpdateVoucherRequest,
  signal?: AbortSignal
): Promise<ApiResponse<Voucher>> => {
  return httpClient.put<ApiResponse<Voucher>>(
    API_ENDPOINTS.voucherById(id),
    data,
    { signal }
  );
};

/**
 * Delete a voucher
 */
export const deleteVoucher = async (
  id: string,
  signal?: AbortSignal
): Promise<ApiResponse<void>> => {
  return httpClient.delete<ApiResponse<void>>(
    API_ENDPOINTS.voucherById(id),
    { signal }
  );
};
