import { useQuery } from '@tanstack/react-query';
import { getDashboardMetrics, type DashboardMetrics } from '@services/dashboardService';
import { useAuth } from './useAuth';

interface UseDashboardMetricsReturn {
  metrics: DashboardMetrics | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Query Keys para dashboard
export const dashboardKeys = {
  all: ['dashboard'] as const,
  metrics: () => [...dashboardKeys.all, 'metrics'] as const,
};

/**
 * Hook para obtener métricas del dashboard con React Query
 * - Cache: 2 minutos
 * - Solo se ejecuta si hay usuario autenticado
 * - Usa el rol del usuario para filtrar métricas
 */
export const useDashboardMetrics = (): UseDashboardMetricsReturn => {
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: dashboardKeys.metrics(),
    queryFn: async ({ signal }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      return await getDashboardMetrics(user.role, signal);
    },
    staleTime: 2 * 60 * 1000, // 2 minutos de cache
    enabled: !!user, // Solo se ejecuta si hay usuario
  });

  return {
    metrics: data || null,
    isLoading,
    error: error?.message || null,
    refetch: async () => {
      await refetch();
    },
  };
};
