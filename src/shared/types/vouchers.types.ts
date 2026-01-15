// Voucher Types
export interface Voucher {
  id: number;
  date: string;
  authorization_number: string;
  confirmation_code: string;
  amount: number;
  confirmation_status: boolean;
  url: string;
  viewUrl?: string;
  number_house: number;
  created_at: string;
  updated_at: string;
}

export interface CreateVoucherRequest {
  authorization_number: string;
  date: string;
  confirmation_code: string;
  amount: number;
  confirmation_status: boolean;
  url: string;
  [key: string]: unknown;
}

export interface UpdateVoucherRequest {
  authorization_number?: string;
  date?: string;
  confirmation_code?: string;
  amount?: number;
  confirmation_status?: boolean;
  url?: string;
  [key: string]: unknown;
}

export interface VouchersResponse {
  vouchers: Voucher[];
  total: number;
  page: number;
  limit: number;
}

export interface VoucherQuery {
  page?: number;
  limit?: number;
  confirmation_status?: boolean;
  startDate?: string;
  endDate?: string;
  [key: string]: unknown;
}
