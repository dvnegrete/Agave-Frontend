interface FacebookLoginButtonProps {
  onClick: () => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export function FacebookLoginButton({
  onClick,
  isLoading = false,
  className = '',
}: FacebookLoginButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-3 px-6 py-3 text-base bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-all duration-200 font-semibold cursor-pointer shadow-sm hover:shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
      Continuar con Facebook
    </button>
  );
}
