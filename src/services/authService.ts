/**
 * Auth Service - Frontend
 * Maneja autenticación con Firebase y sincronización con backend
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut as firebaseSignOut,
  sendEmailVerification,
} from 'firebase/auth';
import { firebaseAuth } from '@config/firebase';
import { httpClient } from '@utils/httpClient';
import { API_ENDPOINTS } from '@config/api';
import type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  User,
} from '@/shared/types/auth.types';

/**
 * Sign up new user with email and password
 * Envía email de verificación usando plantillas de Firebase
 */
export const signUp = async (
  data: SignupRequest,
  signal?: AbortSignal,
): Promise<AuthResponse> => {
  try {
    // 1. Crear usuario en Firebase
    const userCredential = await createUserWithEmailAndPassword(
      firebaseAuth,
      data.email,
      data.password,
    );

    // 2. Enviar email de verificación con plantilla de Firebase
    // (Se envía automáticamente usando la plantilla configurada en Firebase Console)
    try {
      await sendEmailVerification(userCredential.user);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // No fallar el signup si el email no se envía, pero loguear el error
    }

    // 3. Obtener ID Token
    const idToken = await userCredential.user.getIdToken();

    // 4. Enviar al backend para crear en PostgreSQL y generar JWTs propios
    return httpClient.post<AuthResponse>(
      API_ENDPOINTS.authSignUp,
      {
        idToken,
        firstName: data.firstName,
        lastName: data.lastName,
        houseNumber: data.houseNumber,
      },
      { signal },
    );
  } catch (err: unknown) {
    console.error('Sign up failed:', err);
    throw err;
  }
};

/**
 * Sign in with email and password
 */
export const signIn = async (
  credentials: LoginRequest,
  signal?: AbortSignal,
): Promise<AuthResponse> => {
  try {
    // 1. Autenticar con Firebase
    const userCredential = await signInWithEmailAndPassword(
      firebaseAuth,
      credentials.email,
      credentials.password,
    );

    // 2. Obtener ID Token
    const idToken = await userCredential.user.getIdToken();

    // 3. Enviar al backend para generar JWTs propios
    const response = await httpClient.post<AuthResponse>(
      API_ENDPOINTS.authSignIn,
      { idToken },
      { signal },
    );

    return response;
  } catch (err: unknown) {
    console.error('Sign in failed:', err);
    throw err;
  }
};

/**
 * OAuth login (Google, Facebook)
 * Firebase Client SDK maneja popup y callback automáticamente
 */
export const loginWithOAuth = async (
  provider: 'google' | 'facebook',
  signal?: AbortSignal,
): Promise<AuthResponse> => {
  try {
    // 1. Configurar provider
    const authProvider =
      provider === 'google' ? new GoogleAuthProvider() : new FacebookAuthProvider();

    // 2. Popup de autenticación (Firebase maneja todo)
    const userCredential = await signInWithPopup(firebaseAuth, authProvider);

    // 3. Obtener ID Token
    const idToken = await userCredential.user.getIdToken();

    // 4. Enviar al backend
    const response = await httpClient.post<{ refreshToken: string }>(
      API_ENDPOINTS.authOAuthCallback,
      { idToken },
      { signal },
    );

    // 5. Extraer user info del refresh token JWT
    const tokenParts = response.refreshToken.split('.');
    const payload = JSON.parse(atob(tokenParts[1]));

    return {
      refreshToken: response.refreshToken,
      user: {
        id: payload.sub,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: payload.role,
      },
    };
  } catch (err: unknown) {
    console.error('OAuth login failed:', err);
    throw err;
  }
};

/**
 * Refresh access token using refresh token
 * Backend sets new access_token cookie automatically
 */
export const refreshToken = async (
  refreshTokenValue: string,
  signal?: AbortSignal,
): Promise<{ success: boolean }> => {
  try {
    return httpClient.post<{ success: boolean }>(
      API_ENDPOINTS.authRefresh,
      { refreshToken: refreshTokenValue },
      { signal },
    );
  } catch (err: unknown) {
    console.error('Token refresh failed:', err);
    throw err;
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (
  signal?: AbortSignal,
): Promise<User> => {
  try {
    return httpClient.get<User>(API_ENDPOINTS.authMe, {
      signal,
    });
  } catch (err: unknown) {
    console.error('Failed to get current user:', err);
    throw err;
  }
};

/**
 * Sign out current user
 */
export const signOut = async (signal?: AbortSignal): Promise<void> => {
  try {
    // 1. Sign out de Firebase
    await firebaseSignOut(firebaseAuth);

    // 2. Llamar al backend para limpiar cookie
    await httpClient.post<void>(
      API_ENDPOINTS.authSignOut,
      {},
      { signal },
    );
  } catch (err: unknown) {
    console.error('Sign out failed:', err);
    throw err;
  }
};

/**
 * Verifica el email del usuario después del registro
 * Se llama después de que el usuario hace click en el link del email
 */
export const verifyEmail = async (
  firebaseUid: string,
  signal?: AbortSignal,
): Promise<AuthResponse> => {
  try {
    return httpClient.post<AuthResponse>(
      API_ENDPOINTS.authVerifyEmail,
      { firebaseUid },
      { signal },
    );
  } catch (err: unknown) {
    console.error('Email verification failed:', err);
    throw err;
  }
};

/**
 * Reenvía el email de verificación a un usuario
 * Usa Firebase Client SDK para enviar el email automáticamente
 */
export const resendVerificationEmail = async (
  signal?: AbortSignal,
): Promise<{ message: string }> => {
  try {
    const user = firebaseAuth.currentUser;

    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    if (!user.email) {
      throw new Error('Usuario sin email');
    }

    // Firebase envía el email de verificación automáticamente
    await sendEmailVerification(user);

    // Notificar al backend (opcional, solo para auditoría)
    try {
      await httpClient.post<{ message: string }>(
        API_ENDPOINTS.authResendVerificationEmail,
        { email: user.email },
        { signal },
      );
    } catch (err) {
      // No fallar si el backend tiene problemas
      console.error('Backend notification failed:', err);
    }

    return {
      message: 'Email de verificación reenviado. Por favor, revisa tu bandeja de entrada.',
    };
  } catch (err: unknown) {
    console.error('Resend verification email failed:', err);
    throw err;
  }
};
