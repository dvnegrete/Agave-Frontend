import { httpClient } from '@utils/httpClient';
import { API_ENDPOINTS } from '@config/api';
import { isAdminOrOwner, isAdmin, isActive } from '@shared/utils/roleAndStatusHelpers';

export interface VoucherMetrics {
  confirmed: number;
  pending: number;
  total: number;
}

export interface TransactionMetrics {
  total: number;
  reconciled: number;
  pending: number;
}

export interface ReconciliationMetrics {
  manualValidationRequired: number;
  unclaimedDeposits: number;
}

export interface UserMetrics {
  total: number;
  active: number;
}

export interface DashboardMetrics {
  vouchers: VoucherMetrics;
  transactions: TransactionMetrics;
  reconciliation: ReconciliationMetrics;
  users?: UserMetrics;
}

interface VouchersResponse {
  vouchers?: unknown[];
  total?: number;
  [key: string]: unknown;
}

interface TransactionSummaryResponse {
  total?: number;
  reconciled?: number;
  pending?: number;
  [key: string]: unknown;
}

interface ReconciliationStatsResponse {
  manualValidationRequired?: number;
  totalVouchers?: number;
  totalTransactions?: number;
  matched?: number;
  pendingVouchers?: number;
  surplusTransactions?: number;
  [key: string]: unknown;
}

interface UnclaimedDepositsResponse {
  totalCount?: number;
  items?: unknown[];
  [key: string]: unknown;
}

interface UserManagementResponse {
  users?: Array<{
    id?: string;
    status?: 'active' | 'suspend' | 'inactive';
    role?: string;
    email?: string;
  }>;
  total?: number;
  [key: string]: unknown;
}

/**
 * Obtiene métricas consolidadas del dashboard
 * Utiliza Promise.allSettled para no bloquear si una métrica falla
 */
export const getDashboardMetrics = async (
  userRole?: string,
  signal?: AbortSignal
): Promise<DashboardMetrics> => {
  try {
    console.log('📊 [Service] Obteniendo métricas del dashboard...');

    // Construir array de promesas condicionales según rol
    const promises: Array<Promise<{ type: string; data: unknown }>> = [];

    // Vouchers: todos los usuarios
    promises.push(
      httpClient
        .get<VouchersResponse>(
          `${API_ENDPOINTS.vouchers}?confirmation_status=true`,
          { signal }
        )
        .then((res) => ({
          type: 'confirmed_vouchers',
          data: res,
        }))
        .catch((err) => {
          console.error('❌ Error fetching confirmed vouchers:', err);
          return { type: 'confirmed_vouchers', data: null };
        })
    );

    promises.push(
      httpClient
        .get<VouchersResponse>(
          `${API_ENDPOINTS.vouchers}?confirmation_status=false`,
          { signal }
        )
        .then((res) => ({
          type: 'pending_vouchers',
          data: res,
        }))
        .catch((err) => {
          console.error('❌ Error fetching pending vouchers:', err);
          return { type: 'pending_vouchers', data: null };
        })
    );

    // Transacciones: solo admin y owner
    if (userRole && isAdminOrOwner(userRole)) {
      promises.push(
        httpClient
          .get<TransactionSummaryResponse>(API_ENDPOINTS.transactionsBank, { signal })
          .then((res) => ({
            type: 'transactions',
            data: res,
          }))
          .catch((err) => {
            console.error('❌ Error fetching transactions summary:', err);
            return { type: 'transactions', data: null };
          })
      );
    }

    // Reconciliación: solo admin y owner
    if (userRole && isAdminOrOwner(userRole)) {
      promises.push(
        httpClient
          .get<ReconciliationStatsResponse>(
            API_ENDPOINTS.bankReconciliationManualValidationStats,
            { signal }
          )
          .then((res) => ({
            type: 'reconciliation',
            data: res,
          }))
          .catch((err) => {
            console.error('❌ Error fetching reconciliation stats:', err);
            return { type: 'reconciliation', data: null };
          })
      );

      promises.push(
        httpClient
          .get<UnclaimedDepositsResponse>(
            API_ENDPOINTS.bankReconciliationUnclaimedDeposits,
            { signal }
          )
          .then((res) => ({
            type: 'unclaimed_deposits',
            data: res,
          }))
          .catch((err) => {
            console.error('❌ Error fetching unclaimed deposits:', err);
            return { type: 'unclaimed_deposits', data: null };
          })
      );
    }

    // Usuarios: solo admin
    if (userRole && isAdmin(userRole)) {
      promises.push(
        httpClient
          .get<UserManagementResponse>(API_ENDPOINTS.userManagementUsers, { signal })
          .then((res) => ({
            type: 'users',
            data: res,
          }))
          .catch((err) => {
            console.error('❌ Error fetching users:', err);
            return { type: 'users', data: null };
          })
      );
    }

    // Ejecutar todas las promesas en paralelo
    const results = await Promise.allSettled(promises);

    // Procesar resultados
    let confirmedVouchersCount = 0;
    let pendingVouchersCount = 0;
    let transactionTotal = 0;
    let transactionReconciled = 0;
    let reconciliationManualValidation = 0;
    let reconciliationUnclaimed = 0;
    let usersTotal = 0;
    let usersActive = 0;

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { type, data } = result.value;

        if (data === null) return;

        if (type === 'confirmed_vouchers') {
          const vouchersData = data as VouchersResponse;
          confirmedVouchersCount =
            vouchersData.total || (Array.isArray(vouchersData.vouchers) ? vouchersData.vouchers.length : 0) || 0;
        } else if (type === 'pending_vouchers') {
          const vouchersData = data as VouchersResponse;
          pendingVouchersCount =
            vouchersData.total || (Array.isArray(vouchersData.vouchers) ? vouchersData.vouchers.length : 0) || 0;
        } else if (type === 'transactions') {
          const transData = data as TransactionSummaryResponse;
          transactionTotal = transData.total || 0;
          // Buscar en diferentes propiedades posibles
          transactionReconciled =
            transData.reconciled ||
            (transData as any).matched ||
            0;
        } else if (type === 'reconciliation') {
          const reconcData = data as ReconciliationStatsResponse;
          // Buscar en diferentes propiedades posibles
          reconciliationManualValidation =
            reconcData.manualValidationRequired ||
            0;

          console.log('🔍 [Service] Datos de reconciliación recibidos:', reconcData);
        } else if (type === 'unclaimed_deposits') {
          const unclaimedData = data as UnclaimedDepositsResponse;
          reconciliationUnclaimed = unclaimedData.totalCount || (Array.isArray(unclaimedData.items) ? unclaimedData.items.length : 0) || 0;
        } else if (type === 'users') {
          const userData = data as UserManagementResponse;
          usersTotal = userData.total || (Array.isArray(userData.users) ? userData.users.length : 0) || 0;
          // Contar solo usuarios activos
          usersActive =
            Array.isArray(userData.users)
              ? userData.users.filter((u) => u.status && isActive(u.status)).length
              : 0;

          console.log('👥 [Service] Datos de usuarios recibidos:', {
            total: usersTotal,
            active: usersActive,
            raw: userData.users?.map((u) => ({ status: u.status, email: u.email })) || [],
          });
        }
      }
    });

    const metrics: DashboardMetrics = {
      vouchers: {
        confirmed: confirmedVouchersCount,
        pending: pendingVouchersCount,
        total: confirmedVouchersCount + pendingVouchersCount,
      },
      transactions: {
        total: transactionTotal,
        reconciled: transactionReconciled,
        pending: transactionTotal - transactionReconciled,
      },
      reconciliation: {
        manualValidationRequired: reconciliationManualValidation,
        unclaimedDeposits: reconciliationUnclaimed,
      },
    };

    // Solo agregar usuarios si el rol es admin
    if (userRole && isAdmin(userRole)) {
      metrics.users = {
        total: usersTotal,
        active: usersActive,
      };
    }

    console.log('✅ Métricas obtenidas exitosamente:', metrics);
    console.log('📊 Detalles:', {
      confirmedVouchers: confirmedVouchersCount,
      pendingVouchers: pendingVouchersCount,
      transactionTotal,
      transactionReconciled,
      manualValidation: reconciliationManualValidation,
      unclaimedDeposits: reconciliationUnclaimed,
      usersTotal,
      usersActive,
    });
    return metrics;
  } catch (err: unknown) {
    console.error('❌ [Service] Error en getDashboardMetrics:', err);
    // Retornar valores por defecto
    return {
      vouchers: { confirmed: 0, pending: 0, total: 0 },
      transactions: { total: 0, reconciled: 0, pending: 0 },
      reconciliation: {
        manualValidationRequired: 0,
        unclaimedDeposits: 0,
      },
    };
  }
};
