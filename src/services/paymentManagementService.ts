import { httpClient } from '../utils/httpClient';
import type {
  PeriodResponseDto,
  CreatePeriodDto,
  PeriodConfigResponseDto,
  CreatePeriodConfigDto,
  PaymentHistoryResponseDTO,
  HouseBalanceDTO,
} from '../types/api.types';

const API_BASE = '/payment-management';

/**
 * Obtener todos los períodos de facturación registrados
 */
export const getPeriods = async (signal?: AbortSignal) => {
  const response = await httpClient.get<{ data: PeriodResponseDto[] } | PeriodResponseDto[]>(
    `${API_BASE}/periods`,
    { signal }
  );

  // Handle both direct array and wrapped response
  if (Array.isArray(response)) {
    return response;
  }
  return (response as any).data || [];
};

/**
 * Crear nuevo período de facturación manualmente
 */
export const createPeriod = async (
  data: CreatePeriodDto,
  signal?: AbortSignal
) => {
  const response = await httpClient.post<PeriodResponseDto>(
    `${API_BASE}/periods`,
    data,
    { signal }
  );
  return response.data;
};

/**
 * Asegurar existencia de período (crea si no existe)
 * Endpoint especial para el sistema de conciliación bancaria
 */
export const ensurePeriod = async (
  data: CreatePeriodDto,
  signal?: AbortSignal
) => {
  const response = await httpClient.post<PeriodResponseDto>(
    `${API_BASE}/periods/ensure`,
    data,
    { signal }
  );
  return response.data;
};

/**
 * Crear nueva configuración de período con montos y reglas de pago
 */
export const createPeriodConfig = async (
  data: CreatePeriodConfigDto,
  signal?: AbortSignal
) => {
  const response = await httpClient.post<PeriodConfigResponseDto>(
    `${API_BASE}/config`,
    data,
    { signal }
  );
  return response.data;
};

/**
 * Obtener historial completo de pagos de una casa
 * @param houseId - Número de la casa
 */
export const getPaymentHistory = async (
  houseId: number,
  signal?: AbortSignal
) => {
  const response = await httpClient.get<PaymentHistoryResponseDTO>(
    `${API_BASE}/houses/${houseId}/payments`,
    { signal }
  );
  return response;
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
) => {
  const response = await httpClient.get<PaymentHistoryResponseDTO>(
    `${API_BASE}/houses/${houseId}/payments/${periodId}`,
    { signal }
  );
  return response;
};

/**
 * Obtener saldo actual de una casa (deuda, crédito, centavos acumulados)
 * @param houseId - Número de la casa
 */
export const getHouseBalance = async (
  houseId: number,
  signal?: AbortSignal
) => {
  const response = await httpClient.get<HouseBalanceDTO>(
    `${API_BASE}/houses/${houseId}/balance`,
    { signal }
  );
  return response.data;
};
