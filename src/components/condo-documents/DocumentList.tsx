import type {
  CondoDocumentItem,
  CondoDocumentType,
} from '@shared/types/condo-documents.types';
import { DocumentCard } from './DocumentCard';

interface DocumentListProps {
  documents: CondoDocumentItem[];
  type: CondoDocumentType;
  isLoading: boolean;
  error: string | null;
}

export function DocumentList({
  documents,
  type,
  isLoading,
  error,
}: DocumentListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-error text-error px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <p className="text-foreground-secondary text-center py-10">
        No hay {type === 'minute' ? 'minutas' : 'documentos'} disponibles todavía.
      </p>
    );
  }

  return (
    <ol className="space-y-3 list-none">
      {documents.map((doc) => (
        <DocumentCard key={doc.name} document={doc} type={type} />
      ))}
    </ol>
  );
}
