import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  uploadHistoricalRecords,
  getUploadHistory,
} from '../services/historicalRecordsService';
import type {
  UploadHistoricalRecordsOptions,
  HistoricalRecordsUploadHistory,
} from '../shared';

// Query Keys (patrón de factory)
export const historicalRecordsKeys = {
  all: ['historical-records'] as const,
  uploads: () => [...historicalRecordsKeys.all, 'uploads'] as const,
  uploadHistory: () => [...historicalRecordsKeys.uploads(), 'history'] as const,
};

interface UseUploadHistoryQueryReturn {
  uploadHistory: HistoricalRecordsUploadHistory[];
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseHistoricalRecordsMutationReturn {
  upload: (payload: { file: File; options?: UploadHistoricalRecordsOptions }) => Promise<unknown>;
  isUploading: boolean;
  error: string | null;
  reset: () => void;
}

/**
 * Hook para obtener historial de uploads
 */
export const useUploadHistoryQuery = (): UseUploadHistoryQueryReturn => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: historicalRecordsKeys.uploadHistory(),
    queryFn: async ({ signal }) => await getUploadHistory(signal),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  return {
    uploadHistory: data || [],
    isLoading,
    isFetching,
    error: error?.message || null,
    refetch: async () => {
      await refetch();
    },
  };
};

/**
 * Hook para upload mutation
 */
export const useHistoricalRecordsMutation = (): UseHistoricalRecordsMutationReturn => {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: ({
      file,
      options,
    }: {
      file: File;
      options?: UploadHistoricalRecordsOptions;
    }) => uploadHistoricalRecords(file, options),
    onSuccess: () => {
      // Invalidar historial de uploads para refetch automático
      queryClient.invalidateQueries({
        queryKey: historicalRecordsKeys.uploadHistory(),
      });
    },
  });

  return {
    upload: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    error: uploadMutation.error?.message || null,
    reset: uploadMutation.reset,
  };
};
