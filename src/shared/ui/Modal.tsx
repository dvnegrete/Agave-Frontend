import React from 'react';

type ModalMaxWidth = 'sm' | 'md' | 'lg';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: ModalMaxWidth;
}

const maxWidthClasses: Record<ModalMaxWidth, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({ isOpen, onClose, title, children, maxWidth = 'lg' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gradient-to-br from-black/10 via-black/50 to-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-secondary rounded-lg shadow-xl ${maxWidthClasses[maxWidth]} w-full max-h-[80vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-secondary border-b border-base p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-foreground-secondary hover:text-foreground transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-sm text-foreground-secondary space-y-3">
          {children}
        </div>
      </div>
    </div>
  );
}
