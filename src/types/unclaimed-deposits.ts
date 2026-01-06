/**
 * Types para Depósitos No Reclamados
 */

// DTO de respuesta individual
export interface UnclaimedDeposit {
  transactionBankId: string;
  amount: number;
  date: Date | string;
  concept: string | null;
  validationStatus: 'conflict' | 'not-found';
  reason: string;
  suggestedHouseNumber: number | null;
  conceptHouseNumber: number | null;
  processedAt: Date | string;
}

// DTO de respuesta paginada
export interface UnclaimedDepositsPage {
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  items: UnclaimedDeposit[];
}

// Filtros para GET
export interface UnclaimedDepositsFilters {
  startDate?: string;        // ISO format: "2025-01-01"
  endDate?: string;          // ISO format: "2025-01-31"
  validationStatus?: 'conflict' | 'not-found' | 'all';
  houseNumber?: number;
  page?: number;             // Default: 1
  limit?: number;            // Default: 20
  sortBy?: 'date' | 'amount'; // Default: 'date'
}

// Request para asignación
export interface AssignHouseRequest {
  houseNumber: number;
  adminNotes?: string;
}

// DTO de respuesta de asignación
export interface AssignHouseResponse {
  message: string;
  reconciliation: {
    transactionBankId: string;
    houseNumber: number;
    status: 'confirmed';
    paymentAllocation?: {
      total_distributed: number;
      allocations: Array<{
        conceptType: string;
        allocatedAmount: number;
        paymentStatus: string;
      }>;
    };
  };
  assignedAt: string;
}

// Errores de API
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
