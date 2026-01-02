import React from 'react';

type ButtonVariant = 'primary' | 'success' | 'error' | 'info' | 'warning' | 'sameUi';

interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600/85 hover:bg-blue-700',
  success: 'bg-green-700/80 hover:bg-green-800',
  error: 'bg-red-600/85 hover:bg-red-700',
  info: 'bg-cyan-600/85 hover:bg-cyan-700',
  warning: 'bg-yellow-600/80 hover:bg-yellow-700',
  sameUi: "bg-gray-700",
};

export function Button({
  onClick,
  disabled = false,
  isLoading = false,
  variant = 'primary',
  className = '',
  children,
}: ButtonProps) {
  const baseStyles = 'text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer flex items-center gap-2';
  const variantStyle = variantStyles[variant];
  const combinedClassName = `${baseStyles} ${variantStyle} ${className}`;

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={combinedClassName}
      style={{ opacity: isLoading || disabled ? 0.5 : 1 }}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}
