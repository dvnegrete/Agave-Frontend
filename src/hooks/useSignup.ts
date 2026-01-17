import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from './useAlert';
import * as authService from '@services/authService';
import { tokenManager } from '@utils/tokenManager';
import {
  HOUSE_NUMBER_RANGE,
  ROUTES,
  VALIDATION_MESSAGES,
  SIGNUP_VALIDATION_MESSAGES,
  SIGNUP_ERROR_MESSAGES,
  SIGNUP_SUCCESS_MESSAGES,
} from '@/shared';
import type { SignupRequest } from '@/shared/types/auth.types';

interface ErrorWithMessage {
  message: string;
}

interface UseSignupReturn {
  isLoading: boolean;
  error: string | null;
  handleSignup: (formData: SignupFormData) => Promise<void>;
  setError: (error: string | null) => void;
}

export interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  houseNumber: string;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ErrorWithMessage).message === 'string'
  );
}

function getSignupErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    // Check for email already registered/exists (English and Spanish)
    if (
      message.includes('duplicate') ||
      message.includes('already exists') ||
      message.includes('already registered') ||
      message.includes('unique') ||
      message.includes('registrado') ||
      message.includes('ya existe')
    ) {
      return SIGNUP_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS;
    }
    if (message.includes('invalid')) {
      return SIGNUP_ERROR_MESSAGES.INVALID_DATA;
    }
    return error.message;
  }

  if (isErrorWithMessage(error)) {
    const message = error.message.toLowerCase();
    // Check for email already registered/exists (English and Spanish)
    if (
      message.includes('duplicate') ||
      message.includes('already exists') ||
      message.includes('already registered') ||
      message.includes('unique') ||
      message.includes('registrado') ||
      message.includes('ya existe')
    ) {
      return SIGNUP_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS;
    }
    return error.message;
  }

  return SIGNUP_ERROR_MESSAGES.REGISTRATION_FAILED;
}

function validateSignupForm(data: SignupFormData): string | null {
  if (!data.firstName.trim() || !data.lastName.trim()) {
    return SIGNUP_VALIDATION_MESSAGES.NAME_AND_LAST_NAME_REQUIRED;
  }

  if (data.houseNumber && (parseInt(data.houseNumber) < HOUSE_NUMBER_RANGE.MIN || parseInt(data.houseNumber) > HOUSE_NUMBER_RANGE.MAX)) {
    return VALIDATION_MESSAGES.HOUSE_NUMBER_INVALID;
  }

  if (data.password !== data.confirmPassword) {
    return SIGNUP_VALIDATION_MESSAGES.PASSWORDS_DO_NOT_MATCH;
  }

  if (data.password.length < SIGNUP_VALIDATION_MESSAGES.MIN_PASSWORD_LENGTH) {
    return SIGNUP_VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH;
  }

  return null;
}

export function useSignup(): UseSignupReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const alert = useAlert();

  const handleSignup = async (formData: SignupFormData): Promise<void> => {
    setError(null);

    // Validate form
    const validationError = validateSignupForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const signUpData: SignupRequest = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      };

      if (formData.houseNumber) {
        signUpData.houseNumber = parseInt(formData.houseNumber);
      }

      const response = await authService.signUp(signUpData);

      if (response.requiresEmailConfirmation) {
        alert.success('Registro completado', SIGNUP_SUCCESS_MESSAGES.EMAIL_CONFIRMATION_FULL(formData.email));
        navigate(ROUTES.LOGIN);
        return;
      }

      if (response.refreshToken) {
        tokenManager.setRefreshToken(response.refreshToken);
        tokenManager.setUser(response.user);
        navigate(ROUTES.HOME);
      } else {
        setError(SIGNUP_ERROR_MESSAGES.REGISTRATION_PROCESS_ERROR);
      }
    } catch (err: unknown) {
      console.error('Signup failed:', err);
      const errorMessage = getSignupErrorMessage(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    handleSignup,
    setError,
  };
}
