import { httpClient } from '@utils/httpClient';
import type {
  PeriodResponseDto,
  CreatePeriodDto,
  PeriodConfigResponseDto,
  CreatePeriodConfigDto,
  PaymentHistoryResponseDTO,
  HouseBalanceDTO,
} from '@shared/types/payment-management.types';

const API_BASE = '/payment-management';

interface PeriodResponse {
  data: PeriodResponseDto[];
}

/**
 * Obtener todos los períodos de facturación registrados
 */
export const getPeriods = async (signal?: AbortSignal): Promise<PeriodResponseDto[]> => {
  try {
    const response = await httpClient.get<PeriodResponse | PeriodResponseDto[]>(
      `${API_BASE}/periods`,
      { signal }
    );

    // Handle both direct array and wrapped response
    if (Array.isArray(response)) {
      return response;
    }
    return (response as PeriodResponse).data || [];
  } catch (err: unknown) {
    console.error('❌ [Service] Error in getPeriods:', err);
    throw err;
  }
};

/**
 * Crear nuevo período de facturación manualmente
 */
export const createPeriod = async (
  data: CreatePeriodDto,
  signal?: AbortSignal
): Promise<PeriodResponseDto> => {
  try {
    const response = await httpClient.post<PeriodResponseDto>(
      `${API_BASE}/periods`,
      data,
      { signal }
    );
    return response.data;
  } catch (err: unknown) {
    console.error('❌ [Service] Error in createPeriod:', err);
    throw err;
  }
};

/**
 * Asegurar existencia de período (crea si no existe)
 * Endpoint especial para el sistema de conciliación bancaria
 */
export const ensurePeriod = async (
  data: CreatePeriodDto,
  signal?: AbortSignal
): Promise<PeriodResponseDto> => {
  try {
    const response = await httpClient.post<PeriodResponseDto>(
      `${API_BASE}/periods/ensure`,
      data,
      { signal }
    );
    return response.data;
  } catch (err: unknown) {
    console.error('❌ [Service] Error in ensurePeriod:', err);
    throw err;
  }
};

/**
 * Crear nueva configuración de período con montos y reglas de pago
 */
export const createPeriodConfig = async (
  data: CreatePeriodConfigDto,
  signal?: AbortSignal
): Promise<PeriodConfigResponseDto> => {
  try {
    const response = await httpClient.post<PeriodConfigResponseDto>(
      `${API_BASE}/config`,
      data,
      { signal }
    );
    return response.data;
  } catch (err: unknown) {
    console.error('❌ [Service] Error in createPeriodConfig:', err);
    throw err;
  }
};

/**
 * Obtener historial completo de pagos de una casa
 * @param houseId - Número de la casa
 */
export const getPaymentHistory = async (
  houseId: number,
  signal?: AbortSignal
): Promise<PaymentHistoryResponseDTO> => {
  try {
    const response = await httpClient.get<PaymentHistoryResponseDTO>(
      `${API_BASE}/houses/${houseId}/payments`,
      { signal }
    );
    return response;
  } catch (err: unknown) {
    console.error('❌ [Service] Error in getPaymentHistory:', err);
    throw err;
  }
};

/**
 * Obtener pagos de una casa en período específico
 * @param houseId - Número de la casa
 * @param periodId - ID del período
 */
export const getPaymentsByPeriod = async (
  houseId: number,
  periodId: number,
  signal?: AbortSignal
): Promise<PaymentHistoryResponseDTO> => {
  try {
    const response = await httpClient.get<PaymentHistoryResponseDTO>(
      `${API_BASE}/houses/${houseId}/payments/${periodId}`,
      { signal }
    );
    return response;
  } catch (err: unknown) {
    console.error('❌ [Service] Error in getPaymentsByPeriod:', err);
    throw err;
  }
};

/**
 * Obtener saldo actual de una casa (deuda, crédito, centavos acumulados)
 * @param houseId - Número de la casa
 */
export const getHouseBalance = async (
  houseId: number,
  signal?: AbortSignal
): Promise<HouseBalanceDTO> => {
  try {
    const response = await httpClient.get<HouseBalanceDTO>(
      `${API_BASE}/houses/${houseId}/balance`,
      { signal }
    );
    return response.data;
  } catch (err: unknown) {
    console.error('❌ [Service] Error in getHouseBalance:', err);
    throw err;
  }
};
