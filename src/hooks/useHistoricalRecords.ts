import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  uploadHistoricalRecords,
  getUploadHistory,
} from '../services/historicalRecordsService';
import type { UploadHistoricalRecordsOptions } from '../types/api.types';

// Query Keys (patrón de factory)
export const historicalRecordsKeys = {
  all: ['historical-records'] as const,
  uploads: () => [...historicalRecordsKeys.all, 'uploads'] as const,
  uploadHistory: () => [...historicalRecordsKeys.uploads(), 'history'] as const,
};

/**
 * Hook para obtener historial de uploads
 */
export const useUploadHistoryQuery = () => {
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
    refetch,
  };
};

/**
 * Hook para upload mutation
 */
export const useHistoricalRecordsMutation = () => {
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
