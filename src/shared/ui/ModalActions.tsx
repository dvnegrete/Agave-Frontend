import { Button } from './Button';

interface ModalActionsProps {
  onCancel: () => void;
  onConfirm: () => void;
  cancelText?: string;
  confirmText?: string;
  confirmDisabled?: boolean;
  isLoading?: boolean;
  cancelDisabled?: boolean;
}

export function ModalActions({
  onCancel,
  onConfirm,
  cancelText = 'Cancelar',
  confirmText = 'Confirmar',
  confirmDisabled = false,
  isLoading = false,
  cancelDisabled = false,
}: ModalActionsProps) {
  return (
    <div className="flex gap-3">
      <Button
        variant="sameUi"
        onClick={onCancel}
        disabled={cancelDisabled || isLoading}
        className="flex-1"
      >
        {cancelText}
      </Button>
      <Button
        variant="primary"
        onClick={onConfirm}
        isLoading={isLoading}
        disabled={confirmDisabled || isLoading}
        className="flex-1"
      >
        {confirmText}
      </Button>
    </div>
  );
}
