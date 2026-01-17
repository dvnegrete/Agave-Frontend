import { useState } from 'react';
import { useAuth } from './useAuth';
import { LOGIN_ERROR_MESSAGES } from '@/shared';

interface ErrorWithMessage {
  message: string;
}

interface UseLoginReturn {
  isLoading: boolean;
  error: string | null;
  handleEmailLogin: (email: string, password: string) => Promise<void>;
  handleOAuthLogin: (provider: 'google' | 'facebook') => Promise<void>;
  setError: (error: string | null) => void;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ErrorWithMessage).message === 'string'
  );
}

function getLoginErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (isErrorWithMessage(error)) {
    return error.message;
  }

  return LOGIN_ERROR_MESSAGES.GENERAL;
}

function getOAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (isErrorWithMessage(error)) {
    return error.message;
  }

  return LOGIN_ERROR_MESSAGES.OAUTH_INIT_FAILED;
}

export function useLogin(): UseLoginReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, loginWithOAuth } = useAuth();

  const handleEmailLogin = async (email: string, password: string): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      // Navigation is handled by AuthContext
    } catch (err: unknown) {
      console.error('Login failed:', err);
      const errorMessage = getLoginErrorMessage(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook'): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
      await loginWithOAuth(provider);
      // Redirect is handled by loginWithOAuth
    } catch (err: unknown) {
      console.error('OAuth login failed:', err);
      const errorMessage = getOAuthErrorMessage(err);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    handleEmailLogin,
    handleOAuthLogin,
    setError,
  };
}
