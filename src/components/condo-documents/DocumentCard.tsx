import { useState } from 'react';
import { Button } from '@shared/ui';
import type {
  CondoDocumentItem,
  CondoDocumentType,
} from '@shared/types/condo-documents.types';
import {
  openCondoDocumentInNewTab,
  useDeleteCondoDocumentMutation,
} from '@hooks/useCondoDocuments';
import { useAuth } from '@hooks/useAuth';
import { useAlert } from '@hooks/useAlert';
import { isAdmin } from '@shared/utils/roleAndStatusHelpers';

interface DocumentCardProps {
  document: CondoDocumentItem;
  type: CondoDocumentType;
}

const formatMinuteDate = (raw: string): string | null => {
  if (!/^\d{8}$/.test(raw)) return null;
  return `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4, 8)}`;
};

const prettifyDisplayName = (name: string): string => name.trim();

export function DocumentCard({ document, type }: DocumentCardProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const alert = useAlert();
  const canDelete = isAdmin(user?.role ?? '');
  const { mutateAsync: deleteDocument, isPending: isDeleting } =
    useDeleteCondoDocumentMutation();

  const minuteDate = type === 'minute' ? formatMinuteDate(document.date) : null;
  const title = prettifyDisplayName(document.displayName) || document.displayName;

  const handleOpen = async () => {
    setIsOpening(true);
    setError(null);
    try {
      await openCondoDocumentInNewTab(document.name, type);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo abrir el documento');
    } finally {
      setIsOpening(false);
    }
  };

  const handleDelete = () => {
    alert.warning(
      'Eliminar documento',
      `¿Seguro que deseas eliminar "${title}"? Esta acción no se puede deshacer.`,
      {
        autoClose: false,
        showConfirmButton: true,
        confirmButtonText: 'Eliminar',
        onConfirm: async () => {
          try {
            await deleteDocument(document.name);
            alert.success('Documento eliminado', `Se eliminó "${title}".`);
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error desconocido';
            alert.error('Error al eliminar', msg);
          }
        },
      },
    );
  };

  return (
    <li className="bg-secondary border border-base rounded-lg shadow-sm p-4 gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-base font-semibold text-foreground truncate">
          {title}
        </p>
        {minuteDate && (
          <p className="text-sm text-foreground-secondary mt-1">📅 {minuteDate}</p>
        )}
        {error && <p className="text-xs text-error mt-1">{error}</p>}
      </div>
      <div className="flex gap-2 justify-evenly mt-3">
        <Button variant="info" onClick={handleOpen} isLoading={isOpening}>
          Ver documento
        </Button>
        {canDelete && (
          <Button
            variant="error"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            🗑️ Eliminar
          </Button>
        )}
      </div>
    </li>
  );
}
