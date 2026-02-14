import { httpClient } from '@utils/httpClient';
import type {
  PeriodResponseDto,
  CreatePeriodDto,
  PeriodConfigResponseDto,
  CreatePeriodConfigDto,
  PaymentHistoryResponseDTO,
  HouseBalanceDTO,
  EnrichedHouseBalance,
  BackfillAllocationsResponse,
  PeriodChargeSummary,
  BatchUpdatePeriodChargesRequest,
  BatchUpdateResult,
  ReprocessResult,
  InitialBalanceRequest,
  InitialBalanceResponse,
  CondonePenaltyResponse,
  AdjustChargeRequest,
  AdjustChargeResponse,
  ReverseChargeResponse,
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
    return response;
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
    return response;
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
    return response;
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
    return response;
  } catch (err: unknown) {
    console.error('❌ [Service] Error in getHouseBalance:', err);
    throw err;
  }
};

/**
 * Obtener estado enriquecido de una casa (desglose por períodos, conceptos, penalidades)
 * @param houseId - Número de la casa
 */
export const getHouseStatus = async (
  houseId: number,
  signal?: AbortSignal
): Promise<EnrichedHouseBalance> => {
  try {
    const response = await httpClient.get<EnrichedHouseBalance>(
      `${API_BASE}/houses/${houseId}/status`,
      { signal }
    );
    return response;
  } catch (err: unknown) {
    console.error('❌ [Service] Error in getHouseStatus:', err);
    throw err;
  }
};

/**
 * Realizar backfill de asignaciones de pagos (idempotente)
 * @param houseNumber - Número de casa opcional (1-66). Sin param procesa todas.
 */
export const backfillAllocations = async (
  houseNumber?: number,
  signal?: AbortSignal
): Promise<BackfillAllocationsResponse> => {
  try {
    const params = houseNumber ? `?houseNumber=${houseNumber}` : '';
    const response = await httpClient.post<BackfillAllocationsResponse>(
      `${API_BASE}/backfill-allocations${params}`,
      {},
      { signal }
    );
    return response;
  } catch (err: unknown) {
    console.error('❌ [Service] Error in backfillAllocations:', err);
    throw err;
  }
};

/**
 * Obtener resumen de cargos por período (montos de mantenimiento, agua, cuota extra)
 */
export const getPeriodChargesSummary = async (
  signal?: AbortSignal
): Promise<PeriodChargeSummary[]> => {
  try {
    const response = await httpClient.get<PeriodChargeSummary[]>(
      `${API_BASE}/period-charges`,
      { signal }
    );
    return Array.isArray(response) ? response : [];
  } catch (err: unknown) {
    console.error('❌ [Service] Error in getPeriodChargesSummary:', err);
    throw err;
  }
};

/**
 * Actualizar cargos en batch para un rango de períodos
 */
export const batchUpdatePeriodCharges = async (
  data: BatchUpdatePeriodChargesRequest,
  signal?: AbortSignal
): Promise<BatchUpdateResult> => {
  try {
    const response = await httpClient.post<BatchUpdateResult>(
      `${API_BASE}/period-charges/batch-update`,
      data,
      { signal }
    );
    return response;
  } catch (err: unknown) {
    console.error('❌ [Service] Error in batchUpdatePeriodCharges:', err);
    throw err;
  }
};

/**
 * Reprocesar todas las asignaciones de pago (nuclear)
 */
export const reprocessAllocations = async (
  signal?: AbortSignal
): Promise<ReprocessResult> => {
  try {
    const response = await httpClient.post<ReprocessResult>(
      `${API_BASE}/reprocess-allocations`,
      {},
      { signal }
    );
    return response;
  } catch (err: unknown) {
    console.error('❌ [Service] Error in reprocessAllocations:', err);
    throw err;
  }
};

// ──────────────────────────────────────────────
// ADMIN: Operaciones de ajuste y crédito inicial
// ──────────────────────────────────────────────

/**
 * Asignar crédito/saldo inicial a una casa
 * El crédito se distribuye automáticamente en FIFO cubriendo períodos impagos
 */
export const setInitialBalance = async (
  houseId: number,
  data: InitialBalanceRequest,
  signal?: AbortSignal
): Promise<InitialBalanceResponse> => {
  try {
    const response = await httpClient.post<InitialBalanceResponse>(
      `${API_BASE}/houses/${houseId}/initial-balance`,
      data,
      { signal }
    );
    return response;
  } catch (err: unknown) {
    console.error('❌ [Service] Error in setInitialBalance:', err);
    throw err;
  }
};

/**
 * Condonar penalidad de una casa en un período
 */
export const condonePenalty = async (
  houseId: number,
  periodId: number,
  signal?: AbortSignal
): Promise<CondonePenaltyResponse> => {
  try {
    const response = await httpClient.post<CondonePenaltyResponse>(
      `${API_BASE}/houses/${houseId}/periods/${periodId}/condone-penalty`,
      {},
      { signal }
    );
    return response;
  } catch (err: unknown) {
    console.error('❌ [Service] Error in condonePenalty:', err);
    throw err;
  }
};

/**
 * Ajustar el monto de un cargo existente
 */
export const adjustCharge = async (
  chargeId: number,
  data: AdjustChargeRequest,
  signal?: AbortSignal
): Promise<AdjustChargeResponse> => {
  try {
    const response = await httpClient.patch<AdjustChargeResponse>(
      `${API_BASE}/charges/${chargeId}/adjust`,
      data,
      { signal }
    );
    return response;
  } catch (err: unknown) {
    console.error('❌ [Service] Error in adjustCharge:', err);
    throw err;
  }
};

/**
 * Reversar (eliminar) un cargo que nunca fue pagado
 */
export const reverseCharge = async (
  chargeId: number,
  signal?: AbortSignal
): Promise<ReverseChargeResponse> => {
  try {
    const response = await httpClient.delete<ReverseChargeResponse>(
      `${API_BASE}/charges/${chargeId}/reverse`,
      { signal }
    );
    return response;
  } catch (err: unknown) {
    console.error('❌ [Service] Error in reverseCharge:', err);
    throw err;
  }
};
