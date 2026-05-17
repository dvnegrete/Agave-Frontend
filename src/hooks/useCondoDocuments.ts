import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listCondoDocuments,
  uploadCondoDocument,
  getCondoDocumentSignedUrl,
  deleteCondoDocument,
} from '@services/condoDocumentsService';
import type {
  CondoDocumentItem,
  CondoDocumentType,
  UploadCondoDocumentRequest,
  UploadCondoDocumentResponse,
} from '@shared/types/condo-documents.types';

export const condoDocumentsKeys = {
  all: ['condo-documents'] as const,
  list: (type: CondoDocumentType) => [...condoDocumentsKeys.all, type] as const,
};

export const useCondoDocumentsQuery = (
  type: CondoDocumentType,
  enabled: boolean = true,
) => {
  return useQuery<CondoDocumentItem[], Error>({
    queryKey: condoDocumentsKeys.list(type),
    queryFn: ({ signal }) => listCondoDocuments(type, signal),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUploadCondoDocumentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    UploadCondoDocumentResponse,
    Error,
    UploadCondoDocumentRequest
  >({
    mutationFn: (payload) => uploadCondoDocument(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: condoDocumentsKeys.list(variables.type),
      });
    },
  });
};

export const useDeleteCondoDocumentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{ deleted: true; name: string }, Error, string>({
    mutationFn: (name) => deleteCondoDocument(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: condoDocumentsKeys.all });
    },
  });
};

export const openCondoDocumentInNewTab = async (
  name: string,
  type: CondoDocumentType,
): Promise<void> => {
  const { url } = await getCondoDocumentSignedUrl(name, type);
  window.open(url, '_blank', 'noopener,noreferrer');
};
