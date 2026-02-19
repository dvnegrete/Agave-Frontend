/**
 * Auth Service - Frontend
 * Maneja autenticación con Firebase y sincronización con backend
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut as firebaseSignOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
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
 * Inicia el flujo OAuth con Firebase (solo popup).
 * Devuelve el idToken y si el usuario es nuevo para decidir si mostrar formulario.
 */
export const initiateOAuthLogin = async (
  provider: 'google' | 'facebook',
): Promise<{ idToken: string; isNewUser: boolean }> => {
  try {
    const authProvider =
      provider === 'google' ? new GoogleAuthProvider() : new FacebookAuthProvider();

    const userCredential = await signInWithPopup(firebaseAuth, authProvider);
    const additionalInfo = getAdditionalUserInfo(userCredential);
    const idToken = await userCredential.user.getIdToken();

    return {
      idToken,
      isNewUser: additionalInfo?.isNewUser ?? false,
    };
  } catch (err: unknown) {
    console.error('OAuth initiation failed:', err);
    throw err;
  }
};

/**
 * Completa el registro/login OAuth enviando idToken al backend.
 * Acepta houseNumber opcional para usuarios nuevos.
 */
export const completeOAuthLogin = async (
  idToken: string,
  houseNumber?: number,
  signal?: AbortSignal,
): Promise<AuthResponse> => {
  try {
    return httpClient.post<AuthResponse>(
      API_ENDPOINTS.authOAuthCallback,
      {
        idToken,
        ...(houseNumber !== undefined && { houseNumber }),
      },
      { signal },
    );
  } catch (err: unknown) {
    console.error('OAuth completion failed:', err);
    throw err;
  }
};

/**
 * OAuth login (Google, Facebook) — flujo completo sin pausa para formulario.
 * Usado por AuthContext para usuarios existentes.
 */
export const loginWithOAuth = async (
  provider: 'google' | 'facebook',
  signal?: AbortSignal,
): Promise<AuthResponse> => {
  try {
    const { idToken } = await initiateOAuthLogin(provider);
    return completeOAuthLogin(idToken, undefined, signal);
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
 * Solicita recuperación de contraseña.
 * Firebase Client SDK envía el email; el backend registra la solicitud.
 */
export const forgotPassword = async (
  email: string,
  signal?: AbortSignal,
): Promise<{ message: string }> => {
  try {
    // 1. Firebase envía el email de recuperación
    await sendPasswordResetEmail(firebaseAuth, email);

    // 2. Notificar al backend (auditoría / anti-enumeración)
    try {
      await httpClient.post<{ message: string }>(
        API_ENDPOINTS.authForgotPassword,
        { email },
        { signal },
      );
    } catch (err) {
      // No fallar si el backend tiene problemas
      console.error('Backend forgot-password notification failed:', err);
    }

    return {
      message: 'Si el correo está registrado, recibirás un enlace de recuperación.',
    };
  } catch (err: unknown) {
    console.error('Forgot password failed:', err);
    throw err;
  }
};

/**
 * Cambia la contraseña del usuario autenticado.
 * Verifica la contraseña actual, luego actualiza en Firebase y sincroniza con el backend.
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  signal?: AbortSignal,
): Promise<{ message: string }> => {
  try {
    const user = firebaseAuth.currentUser;

    if (!user || !user.email) {
      throw new Error('Usuario no autenticado');
    }

    // 1. Reautenticar para verificar contraseña actual
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // 2. Actualizar contraseña en Firebase Client SDK
    await updatePassword(user, newPassword);

    // 3. Sincronizar con el backend vía Admin SDK
    return httpClient.patch<{ message: string }>(
      API_ENDPOINTS.authChangePassword,
      { newPassword },
      { signal },
    );
  } catch (err: unknown) {
    console.error('Change password failed:', err);
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
