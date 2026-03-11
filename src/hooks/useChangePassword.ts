import { useState } from 'react';
import { changePassword } from '@services/authService';
import {
  CHANGE_PASSWORD_VALIDATION_MESSAGES,
  CHANGE_PASSWORD_ERROR_MESSAGES,
} from '@/shared';

interface UseChangePasswordReturn {
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  handleChangePassword: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) => Promise<void>;
  setError: (error: string | null) => void;
}

function getChangePasswordErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (
      error.message.includes('auth/wrong-password') ||
      error.message.includes('auth/invalid-credential')
    ) {
      return CHANGE_PASSWORD_ERROR_MESSAGES.WRONG_PASSWORD;
    }
    if (error.message.includes('auth/requires-recent-login')) {
      return CHANGE_PASSWORD_ERROR_MESSAGES.REQUIRES_RECENT_LOGIN;
    }
    if (error.message.includes('auth/too-many-requests')) {
      return CHANGE_PASSWORD_ERROR_MESSAGES.TOO_MANY_REQUESTS;
    }
    return error.message;
  }
  return CHANGE_PASSWORD_ERROR_MESSAGES.GENERAL;
}

export function useChangePassword(): UseChangePasswordReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChangePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<void> => {
    setError(null);

    if (newPassword.length < 6) {
      setError(CHANGE_PASSWORD_VALIDATION_MESSAGES.PASSWORD_TOO_SHORT);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(CHANGE_PASSWORD_VALIDATION_MESSAGES.PASSWORDS_DO_NOT_MATCH);
      return;
    }

    setIsLoading(true);

    try {
      await changePassword(currentPassword, newPassword);
      setIsSuccess(true);
    } catch (err: unknown) {
      console.error('Change password failed:', err);
      setError(getChangePasswordErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    isSuccess,
    handleChangePassword,
    setError,
  };
}
