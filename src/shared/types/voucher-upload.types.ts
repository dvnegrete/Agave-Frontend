// Voucher Upload Types
export interface VoucherStructuredData {
  monto: string;
  fecha_pago: string;
  hora_transaccion?: string;
  casa?: number;
  referencia?: string;
  hora_asignada_automaticamente?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  errors: Record<string, string>;
  warnings?: string[];
}

export interface VoucherUploadResponse {
  success: boolean;
  structuredData: VoucherStructuredData;
  validation: ValidationResult;
  gcsFilename?: string;
  originalFilename: string;
  suggestions?: {
    casaDetectedFromCentavos?: boolean;
    autoAssignedTime?: boolean;
  };
}

export interface VoucherConfirmRequest {
  gcsFilename: string;
  monto: string;
  fecha_pago: string;
  hora_transaccion?: string;
  casa: number;
  referencia?: string;
  userId?: string | null;
  [key: string]: unknown;
}

export interface VoucherConfirmResponse {
  success: boolean;
  confirmationCode: string;
  voucher: {
    id: number;
    amount: number;
    date: string;
    casa: number;
    referencia: string;
    confirmation_status: boolean;
  };
}
