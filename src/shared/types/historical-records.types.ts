// Historical Records Upload Types
export interface UploadHistoricalRecordsOptions {
  bankName?: string;          // Nombre del banco origen de los registros
  description?: string;        // Descripción opcional del archivo
  validateOnly?: boolean;      // Si es true, solo valida sin insertar en BD
}

export interface RowErrorDto {
  row_number: number;
  error_type: 'validation' | 'database' | 'business_rule';
  message: string;
  details?: Record<string, unknown>;
}

export interface HistoricalRecordResponseDto {
  total_rows: number;
  successful: number;
  failed: number;
  success_rate: number;
  errors: RowErrorDto[];
  created_record_ids: number[];
}

export interface HistoricalRecord {
  id: number;
  date: string;
  time: string;
  concept: string;
  deposit: number;
  house_id: number | null;
  cta_extraordinary_fee: number;
  cta_maintenance: number;
  cta_penalties: number;
  cta_water: number;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface HistoricalRecordsUploadHistory {
  id: number;
  filename: string;
  description?: string;
  uploaded_by?: string;
  uploaded_at: string;
  total_rows: number;
  successful: number;
  failed: number;
  success_rate: number;
}

// Component UI Types
export type ActiveTab = 'upload' | 'history';
