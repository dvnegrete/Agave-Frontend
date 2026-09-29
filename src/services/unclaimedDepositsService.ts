import { httpClient, type HttpClientOptions } from '@utils/httpClient';
import type {
  UnclaimedDepositsPage,
  UnclaimedDepositsFilters,
  DepositAssignHouseRequest,
  DepositAssignHouseResponse,
  BankRefundRequest,
  BankRefundResponse,
} from '@/shared/types/unclaimed-deposits.types';

class UnclaimedDepositsService {
  /**
   * Obtener autorización headers con token
   */
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Obtener depósitos no reclamados con filtros
   */
  async getUnclaimedDeposits(
    filters: UnclaimedDepositsFilters = {}
  ): Promise<UnclaimedDepositsPage> {
    try {
      // Validar y establecer defaults para page y limit
      const page = Math.max(1, Number(filters.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));

      // Construir query string manualmente para mayor control
      const params: Record<string, string | number> = {
        page,
        limit,
      };

      if (filters.startDate) {
        params.startDate = filters.startDate;
      }
      if (filters.endDate) {
        params.endDate = filters.endDate;
      }
      if (filters.validationStatus && filters.validationStatus !== 'all') {
        params.validationStatus = filters.validationStatus;
      }
      if (filters.houseNumber) {
        params.houseNumber = filters.houseNumber;
      }
      if (filters.sortBy) {
        params.sortBy = filters.sortBy;
      }

      // Construir URL con parámetros
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');

      const endpoint = `/bank-reconciliation/unclaimed-deposits?${queryString}`;

      const options: HttpClientOptions = {
        headers: this.getAuthHeaders(),
      };

      const response = await httpClient.get<UnclaimedDepositsPage>(
        endpoint,
        options
      );

      return response;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  /**
   * Asignar manualmente una casa a un depósito
   */
  async assignHouseToDeposit(
    transactionId: string,
    request: DepositAssignHouseRequest
  ): Promise<DepositAssignHouseResponse> {
    try {
      const options: HttpClientOptions = {
        headers: this.getAuthHeaders(),
      };

      const response = await httpClient.post<DepositAssignHouseResponse>(
        `/bank-reconciliation/unclaimed-deposits/${transactionId}/assign-house`,
        request,
        options
      );

      return response;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  /**
   * Marcar un depósito no reclamado como devolución bancaria (solo admin)
   */
  async markAsBankRefund(
    transactionId: string,
    request: BankRefundRequest = {}
  ): Promise<BankRefundResponse> {
    try {
      const options: HttpClientOptions = {
        headers: this.getAuthHeaders(),
      };

      return await httpClient.post<BankRefundResponse>(
        `/bank-reconciliation/unclaimed-deposits/${transactionId}/bank-refund`,
        request,
        options
      );
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  /**
   * Revertir una devolución bancaria: regresa a depósitos no reclamados (solo admin)
   */
  async revertBankRefund(transactionId: string): Promise<BankRefundResponse> {
    try {
      const options: HttpClientOptions = {
        headers: this.getAuthHeaders(),
      };

      return await httpClient.delete<BankRefundResponse>(
        `/bank-reconciliation/unclaimed-deposits/${transactionId}/bank-refund`,
        options
      );
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    return new Error('Error desconocido en la solicitud');
  }
}

// Singleton
export const unclaimedDepositsService = new UnclaimedDepositsService();
