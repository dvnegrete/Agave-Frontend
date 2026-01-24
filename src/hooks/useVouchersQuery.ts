import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  type VoucherQuery,
  type CreateVoucherRequest,
  type UpdateVoucherRequest,
  type Voucher,
} from '@shared/types/vouchers.types'
import {
  getVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} from '@services/voucherService';

// Query Keys
export const voucherKeys = {
  all: ['vouchers'] as const,
  lists: () => [...voucherKeys.all, 'list'] as const,
  list: (filters: VoucherQuery) => [...voucherKeys.lists(), filters] as const,
  details: () => [...voucherKeys.all, 'detail'] as const,
  detail: (id: string) => [...voucherKeys.details(), id] as const,
};

interface UseVouchersQueryReturn {
  vouchers: Voucher[];
  total: number;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  setFilters: (filters: Partial<VoucherQuery>) => void;
  refetch: () => Promise<void>;
}

interface UseVoucherQueryReturn {
  data?: Voucher;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface UseVoucherMutationsQueryReturn {
  create: (data: CreateVoucherRequest) => Promise<unknown>;
  update: (payload: { id: string; data: UpdateVoucherRequest }) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
  isLoading: boolean;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
}

/**
 * Hook para obtener lista de vouchers con filtros opcionales
 */
export const useVouchersQuery = (initialQuery?: VoucherQuery): UseVouchersQueryReturn => {
  const [query, setQuery] = useState<VoucherQuery>(initialQuery || {});

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: voucherKeys.list(query),
    queryFn: async ({ signal }) => {
      const response = await getVouchers(query, signal);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const setFilters = (filters: Partial<VoucherQuery>) => {
    setQuery((prev) => ({ ...prev, ...filters }));
  };

  // Manejar tanto array directo como objeto con vouchers
  const vouchers = Array.isArray(data) ? data : (data?.vouchers || []);
  const total = Array.isArray(data) ? data.length : (data?.total || 0);

  return {
    vouchers,
    total,
    isLoading,
    isFetching,
    error: error?.message || null,
    setFilters,
    refetch: async () => {
      await refetch();
    },
  };
};

/**
 * Hook para obtener un voucher por ID
 */
export const useVoucherQuery = (id: string): UseVoucherQueryReturn => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: voucherKeys.detail(id),
    queryFn: async ({ signal }) => {
      if (!id) throw new Error('ID is required');
      return await getVoucherById(id, signal);
    },
    enabled: !!id,
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch: async () => {
      await refetch();
    },
  };
};

/**
 * Hook para mutaciones de vouchers (create, update, delete)
 */
export const useVoucherMutations = (): UseVoucherMutationsQueryReturn => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateVoucherRequest) => createVoucher(data),
    onSuccess: () => {
      // Invalidar todas las queries de listas de vouchers
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVoucherRequest }) =>
      updateVoucher(id, data),
    onSuccess: (_, variables) => {
      // Invalidar la query específica del voucher y todas las listas
      queryClient.invalidateQueries({ queryKey: voucherKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVoucher(id),
    onSuccess: () => {
      // Invalidar todas las queries de vouchers
      queryClient.invalidateQueries({ queryKey: voucherKeys.all });
    },
  });

  return {
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    createError: createMutation.error?.message || null,
    updateError: updateMutation.error?.message || null,
    deleteError: deleteMutation.error?.message || null,
  };
};
