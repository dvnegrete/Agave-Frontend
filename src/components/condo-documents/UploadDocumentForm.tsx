import { useState, useRef } from 'react';
import { Button } from '@shared/ui';
import type { CondoDocumentType } from '@shared/types/condo-documents.types';
import { useUploadCondoDocumentMutation } from '@hooks/useCondoDocuments';

interface UploadDocumentFormProps {
  defaultType: CondoDocumentType;
  onUploadSuccess?: () => void;
}

const MONTHS_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const dateToDdmmaaaa = (isoDate: string): string => {
  const [yyyy, mm, dd] = isoDate.split('-');
  return `${dd}${mm}${yyyy}`;
};

const buildMinuteFileName = (isoDate: string): string => {
  if (!isoDate) return '';
  const [yyyy, mm, dd] = isoDate.split('-');
  const month = MONTHS_ES[Number(mm) - 1];
  if (!month) return '';
  return `Minuta ${dd} ${month} ${yyyy}.pdf`;
};

export function UploadDocumentForm({
  defaultType,
  onUploadSuccess,
}: UploadDocumentFormProps) {
  const [type, setType] = useState<CondoDocumentType>(defaultType);
  const [file, setFile] = useState<File | null>(null);
  const [date, setDate] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { mutateAsync, isPending, error } = useUploadCondoDocumentMutation();

  const resetForm = () => {
    setFile(null);
    setDate('');
    setName('');
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

    if (type === 'document' && !name.trim()) {
      setFeedback('El nombre del documento es requerido');
      return;
    }

    try {
      await mutateAsync({
        file,
        type,
        date: type === 'minute' ? dateToDdmmaaaa(date) : undefined,
        name: type === 'document' ? name.trim() : undefined,
      });
      setFeedback('Documento subido exitosamente');
      resetForm();
      onUploadSuccess?.();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Error al subir el documento');
    }
  };

  const minuteFileNamePreview = buildMinuteFileName(date);

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

      {type === 'document' && (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="document-name"
            className="text-sm font-semibold text-foreground"
          >
            Nombre del documento
          </label>
          <input
            id="document-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Reglamento interno 2026"
            required
            className="px-4 py-3 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-foreground-secondary">
            Se guardará como <code>{name.trim() ? `${name.trim()}.pdf` : '<nombre>.pdf'}</code>
          </p>
        </div>
      )}

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
          {minuteFileNamePreview && (
            <p className="text-xs text-foreground-secondary">
              Se guardará como <code>{minuteFileNamePreview}</code>
            </p>
          )}
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
