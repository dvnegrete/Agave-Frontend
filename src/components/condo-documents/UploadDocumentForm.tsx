import { useState, useRef } from 'react';
import { Button } from '@shared/ui';
import type { CondoDocumentType } from '@shared/types/condo-documents.types';
import { useUploadCondoDocumentMutation } from '@hooks/useCondoDocuments';

interface UploadDocumentFormProps {
  defaultType: CondoDocumentType;
  onUploadSuccess?: () => void;
}

const dateToDdmmaaaa = (isoDate: string): string => {
  const [yyyy, mm, dd] = isoDate.split('-');
  return `${dd}${mm}${yyyy}`;
};

export function UploadDocumentForm({
  defaultType,
  onUploadSuccess,
}: UploadDocumentFormProps) {
  const [type, setType] = useState<CondoDocumentType>(defaultType);
  const [file, setFile] = useState<File | null>(null);
  const [date, setDate] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { mutateAsync, isPending, error } = useUploadCondoDocumentMutation();

  const resetForm = () => {
    setFile(null);
    setDate('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!file) {
      setFeedback('Selecciona un archivo PDF');
      return;
    }

    if (file.type !== 'application/pdf') {
      setFeedback('El archivo debe ser un PDF');
      return;
    }

    if (type === 'minute' && !date) {
      setFeedback('La fecha es requerida para minutas');
      return;
    }

    try {
      await mutateAsync({
        file,
        type,
        date: type === 'minute' ? dateToDdmmaaaa(date) : undefined,
      });
      setFeedback('Documento subido exitosamente');
      resetForm();
      onUploadSuccess?.();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Error al subir el documento');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-foreground">Tipo</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as CondoDocumentType)}
          className="px-4 py-3 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="document">Documento general</option>
          <option value="minute">Minuta</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-foreground">Archivo PDF</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="px-4 py-3 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {type === 'minute' && (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="minute-date"
            className="text-sm font-semibold text-foreground"
          >
            Fecha de la minuta
          </label>
          <input
            id="minute-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="px-4 py-3 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      {feedback && (
        <p
          className={
            feedback.startsWith('Documento subido')
              ? 'text-sm text-success'
              : 'text-sm text-error'
          }
        >
          {feedback}
        </p>
      )}

      {error && !feedback && (
        <p className="text-sm text-error">{error.message}</p>
      )}

      <Button type="submit" variant="success" isLoading={isPending}>
        Subir documento
      </Button>
    </form>
  );
}
