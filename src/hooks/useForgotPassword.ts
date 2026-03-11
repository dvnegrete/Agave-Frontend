import { useState } from 'react';
import { forgotPassword } from '@services/authService';
import { FORGOT_PASSWORD_ERROR_MESSAGES } from '@/shared';

interface UseForgotPasswordReturn {
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  handleSendResetEmail: (email: string) => Promise<void>;
  setError: (error: string | null) => void;
}

function getForgotPasswordErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('auth/invalid-email')) {
      return FORGOT_PASSWORD_ERROR_MESSAGES.INVALID_EMAIL;
    }
    if (error.message.includes('auth/too-many-requests')) {
      return FORGOT_PASSWORD_ERROR_MESSAGES.TOO_MANY_REQUESTS;
    }
    return error.message;
  }
  return FORGOT_PASSWORD_ERROR_MESSAGES.GENERAL;
}

export function useForgotPassword(): UseForgotPasswordReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSendResetEmail = async (email: string): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setIsSuccess(true);
    } catch (err: unknown) {
      console.error('Forgot password failed:', err);
      setError(getForgotPasswordErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    isSuccess,
    handleSendResetEmail,
    setError,
  };
}
