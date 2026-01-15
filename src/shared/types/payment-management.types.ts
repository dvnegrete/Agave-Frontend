// Payment Management Types

// Period Types
export interface PeriodResponseDto {
  id: number;
  year: number;
  month: number;
  period_config_id: string;
  start_date: string;        // ISO date
  end_date: string;          // ISO date
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface CreatePeriodDto {
  year: number;
  month: number;
  period_config_id?: number;  // Optional for create, required for certain operations
}

// Period Config Types
export interface PeriodConfigResponseDto {
  id: number;
  maintenance_amount: number;
  water_amount: number;
  extraordinary_fee: number;
  due_day: number;           // Día de vencimiento
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface CreatePeriodConfigDto {
  maintenance_amount: number;
  water_amount: number;
  extraordinary_fee?: number;
  due_day: number;
  [key: string]: unknown;
}

// Payment Types
export interface PaymentRecord {
  id: number;
  record_id: number;
  house_id: number;
  concept_type: string;
  concept_id: number;
  allocated_amount: number;
  expected_amount: number;
  payment_status: 'COMPLETE' | 'PARTIAL' | 'OVERPAID';
  difference: number;
  period_year: number;
  period_month: number;
  payment_date: string;
}

export interface PaymentAssignment {
  id?: number;
  concept: string;           // e.g., "Mantenimiento", "Agua", "Cuota Extraordinaria"
  amount: number;
  due_date: string;          // ISO date
  payment_status: 'pending' | 'paid' | 'partially_paid' | 'overdue';
  paid_amount?: number;
  payment_date?: string;
}

export interface PaymentHistoryPeriod {
  period_id: number;
  period_name: string;
  year: number;
  month: number;
  assignments: PaymentAssignment[];
  total_amount: number;
  total_paid: number;
}

// House Payment Transaction (from /payment-management/houses/{id}/payments)
export interface HousePaymentTransaction {
  date: string;              // ISO datetime
  time: string;              // HH:MM:SS
  concept: string;           // Concepto de la transacción
  amount: number;            // Monto de la transacción
  currency: string;          // Moneda (e.g., "USD")
  bank_name: string;         // Nombre del banco
  confirmation_status: boolean;  // Estado de confirmación
}

// Unreconciled Voucher (from house payments response)
export interface UnreconciledVoucher {
  date: string;              // ISO datetime
  amount: number;            // Monto del voucher
  confirmation_status: boolean;  // Estado de confirmación
  created_at: string;        // ISO datetime de creación
  confirmation_code: string; // Código de confirmación del voucher
}

// Unreconciled Vouchers Response
export interface UnreconciledVouchersResponse {
  total_count: number;       // Total de vouchers no reconciliados
  vouchers: UnreconciledVoucher[];
}

// House Payments Response
export interface HousePayments {
  house_id: number;
  house_number: number;
  total_transactions: number;     // Total de transacciones
  total_amount: number;           // Monto total
  confirmed_transactions: number; // Transacciones confirmadas
  pending_transactions: number;   // Transacciones pendientes
  transactions: HousePaymentTransaction[];
  unreconciled_vouchers?: UnreconciledVouchersResponse; // Vouchers no reconciliados
}

// Alias para compatibilidad backwards
export interface PaymentHistoryResponseDTO extends HousePayments {
  history?: PaymentHistoryPeriod[]; // Para soporte de datos históricos
}

// Legacy: Registros de pago (estructura antigua)
export interface HousePaymentsLegacy {
  house_id: number;
  house_number: number;
  total_payments: number;
  total_paid: number;
  total_expected: number;
  payments: PaymentRecord[];
}

// House Balance Types
export interface HouseBalance {
  house_id: number;
  house_number: number;
  accumulated_cents: number;
  credit_balance: number;    // Crédito acumulado
  debit_balance: number;     // Deuda acumulada
  net_balance: number;       // Saldo neto (crédito - deuda)
  status: 'balanced' | 'credited' | 'in-debt';  // Estado financiero
  updated_at: string;        // Última actualización
}

// Alias para compatibilidad backwards
export interface HouseBalanceDTO extends HouseBalance {
  current_balance?: number;  // Para compatibilidad con datos antiguos
  last_payment_date?: string;
  [key: string]: unknown;
}

// Query Types
export interface PaymentManagementQuery {
  year?: number;
  month?: number;
  house_id?: number;
  period_id?: number;
  [key: string]: unknown;
}
