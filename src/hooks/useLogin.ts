import { useState } from 'react';
import { useAuth } from './useAuth';
import { LOGIN_ERROR_MESSAGES } from '@/shared';
import { initiateOAuthLogin } from '@services/authService';

interface ErrorWithMessage {
  message: string;
}

interface UseLoginReturn {
  isLoading: boolean;
  error: string | null;
  pendingOAuthIdToken: string | null;
  handleEmailLogin: (email: string, password: string) => Promise<void>;
  handleOAuthLogin: (provider: 'google' | 'facebook') => Promise<void>;
  handleCompleteOAuthRegistration: (houseNumber?: number) => Promise<void>;
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
  const [pendingOAuthIdToken, setPendingOAuthIdToken] = useState<string | null>(null);
  const { login, completeOAuthRegistration } = useAuth();

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
      const { idToken, isNewUser } = await initiateOAuthLogin(provider);

      if (isNewUser) {
        // Pausar para mostrar formulario de número de casa
        setPendingOAuthIdToken(idToken);
        setIsLoading(false);
      } else {
        // Usuario existente: completar inmediatamente sin número de casa
        await completeOAuthRegistration(idToken);
        // Navigation handled by AuthContext
      }
    } catch (err: unknown) {
      console.error('OAuth login failed:', err);
      const errorMessage = getOAuthErrorMessage(err);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleCompleteOAuthRegistration = async (houseNumber?: number): Promise<void> => {
    if (!pendingOAuthIdToken) return;
    setError(null);
    setIsLoading(true);

    try {
      await completeOAuthRegistration(pendingOAuthIdToken, houseNumber);
      setPendingOAuthIdToken(null);
      // Navigation handled by AuthContext
    } catch (err: unknown) {
      console.error('OAuth registration completion failed:', err);
      const errorMessage = getOAuthErrorMessage(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    pendingOAuthIdToken,
    handleEmailLogin,
    handleOAuthLogin,
    handleCompleteOAuthRegistration,
    setError,
  };
}
