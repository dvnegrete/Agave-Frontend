import { useState } from 'react';
import { Button } from '@shared/ui';
import type {
  CondoDocumentItem,
  CondoDocumentType,
} from '@shared/types/condo-documents.types';
import { openCondoDocumentInNewTab } from '@hooks/useCondoDocuments';

interface DocumentCardProps {
  document: CondoDocumentItem;
  type: CondoDocumentType;
}

const formatMinuteDate = (raw: string): string | null => {
  if (!/^\d{8}$/.test(raw)) return null;
  return `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4, 8)}`;
};

const prettifyDisplayName = (name: string): string => {
  return name
    .replace(/^p-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}-/, '')
    .replace(/-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim();
};

export function DocumentCard({ document, type }: DocumentCardProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <li className="bg-secondary border border-base rounded-lg shadow-sm p-4 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-base font-semibold text-foreground capitalize truncate">
          {title}
        </p>
        {minuteDate && (
          <p className="text-sm text-foreground-secondary mt-1">📅 {minuteDate}</p>
        )}
        {error && <p className="text-xs text-error mt-1">{error}</p>}
      </div>
      <Button variant="info" onClick={handleOpen} isLoading={isOpening}>
        Ver documento
      </Button>
    </li>
  );
}
