import { Button } from './Button';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export function PaginationControls({ page, totalPages, onPrev, onNext }: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-4">
      <Button
        onClick={onPrev}
        disabled={page === 1}
        variant="info"
        className="text-xs py-1 px-3"
      >
        Anterior
      </Button>
      <span className="px-3 py-2 text-sm">
        Página {page} de {totalPages}
      </span>
      <Button
        onClick={onNext}
        disabled={page === totalPages}
        variant="info"
        className="text-xs py-1 px-3"
      >
        Siguiente
      </Button>
    </div>
  );
}
