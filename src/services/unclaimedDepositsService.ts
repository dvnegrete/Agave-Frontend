import { httpClient, type HttpClientOptions } from '../utils/httpClient';
import type {
  UnclaimedDepositsPage,
  UnclaimedDepositsFilters,
  AssignHouseRequest,
  AssignHouseResponse,
} from '../types/unclaimed-deposits';

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

      console.log('🔍 [UnclaimedDeposits DEBUG] Input filters:', filters);
      console.log('🔍 [UnclaimedDeposits DEBUG] Parsed values:', {
        page: { value: page, type: typeof page },
        limit: { value: limit, type: typeof limit },
      });

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

      console.log('🔍 [UnclaimedDeposits DEBUG] Final endpoint:', endpoint);
      console.log('🔍 [UnclaimedDeposits DEBUG] Params object:', params);
      console.log('🔍 [UnclaimedDeposits DEBUG] Query string:', queryString);

      const options: HttpClientOptions = {
        headers: this.getAuthHeaders(),
      };

      console.log('📤 [UnclaimedDeposits] Enviando petición GET...');
      console.log('   Endpoint:', endpoint);
      console.log('   Headers:', this.getAuthHeaders());

      const response = await httpClient.get<UnclaimedDepositsPage>(
        endpoint,
        options
      );

      console.log('✅ [UnclaimedDeposits] Respuesta exitosa:', {
        totalCount: response.totalCount,
        page: response.page,
        totalPages: response.totalPages,
        itemsCount: response.items.length,
      });

      return response;
    } catch (error: unknown) {
      console.error('❌ [UnclaimedDeposits ERROR] Error en getUnclaimedDeposits:', error);

      if (error instanceof Error) {
        console.error('   Mensaje:', error.message);
        console.error('   Stack:', error.stack);
      }

      throw this.handleError(error);
    }
  }

  /**
   * Asignar manualmente una casa a un depósito
   */
  async assignHouseToDeposit(
    transactionId: string,
    request: AssignHouseRequest
  ): Promise<AssignHouseResponse> {
    try {
      const options: HttpClientOptions = {
        headers: this.getAuthHeaders(),
      };

      const response = await httpClient.post<AssignHouseResponse>(
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
   * Manejo centralizado de errores
   */
  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      console.error('❌ Error en UnclaimedDepositsService:', error.message);
      return error;
    }

    const unknownError = new Error('Error desconocido en la solicitud');
    console.error('❌ Error en UnclaimedDepositsService:', unknownError.message);
    return unknownError;
  }
}

// Singleton
export const unclaimedDepositsService = new UnclaimedDepositsService();
