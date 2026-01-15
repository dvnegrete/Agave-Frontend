import { useState } from 'react';
import { Button } from './Button';

interface FileUploadZoneProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  acceptedFormats: string[]; // ['.xlsx', '.csv']
  disabled?: boolean;
  dragDropEnabled?: boolean;
  showFileSize?: boolean;
  label?: string;
}

export function FileUploadZone({
  file,
  onFileSelect,
  acceptedFormats,
  disabled = false,
  dragDropEnabled = false,
  showFileSize = true,
  label = 'Selecciona el archivo:',
}: FileUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File): void => {
    const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    if (acceptedFormats.includes(fileExtension)) {
      onFileSelect(selectedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const acceptString = acceptedFormats.join(',');

  if (dragDropEnabled) {
    return (
      <div>
        <div
          className={`flex flex-col items-center justify-center px-6 py-12 border-2 border-dashed rounded-md transition-all cursor-pointer ${
            dragActive
              ? 'border-info bg-info/30'
              : 'border-base hover:border-info'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <svg
            className="w-12 h-12 text-foreground-tertiary mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <p className="text-lg font-medium text-foreground mb-2">
            📁 Arrastra tu archivo aquí
          </p>
          <p className="text-sm text-foreground-secondary mb-4">o haz click para seleccionar</p>

          <input
            type="file"
            accept={acceptString}
            onChange={handleFileChange}
            className="hidden"
            id="file-input-zone"
            disabled={disabled}
          />
          <label htmlFor="file-input-zone" className="cursor-pointer">
            <Button
              onClick={() => document.getElementById('file-input-zone')?.click()}
              disabled={disabled}
              variant="info"
            >
              Seleccionar Archivo
            </Button>
          </label>
        </div>

        {/* File name display */}
        {file && (
          <div className="mt-4 p-4 bg-info border border-info rounded-md text-foreground">
            <p>
              ✓ Archivo seleccionado: <span className="font-medium">{file.name}</span>
            </p>
            {showFileSize && (
              <p className="text-sm mt-1">
                Tamaño: {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Simple input mode (no drag-drop)
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-foreground mb-2">{label}</label>
      <input
        id="file-input-simple"
        type="file"
        accept={acceptString}
        onChange={handleFileChange}
        disabled={disabled}
        className="block w-full text-sm text-foreground border border-base rounded-lg cursor-pointer bg-tertiary focus:outline-none p-2"
      />
      {file && (
        <p className="mt-2 text-sm text-foreground-secondary">
          Archivo seleccionado: <span className="font-semibold">{file.name}</span>
        </p>
      )}
    </div>
  );
}
