/**
 * Auth Callback Page
 * Handles OAuth callback from providers (Google, Facebook, etc.)
 * Extracts authorization code from URL and completes the authentication flow
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenManager } from '@utils/tokenManager';
import * as authService from '@services/authService';
import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@/shared';

interface JWTPayload {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async (): Promise<void> => {
      // Implicit Flow - Supabase redirects with tokens in hash fragment
      let accessToken = null;

      if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        accessToken = hashParams.get('access_token');
      }

      if (!accessToken) {
        console.error('No access token received from OAuth provider');
        setError('No access token received from OAuth provider');
        setTimeout(() => navigate(ROUTES.HOME), 3000);
        return;
      }

      try {
        // Send Supabase access token to backend for exchange
        const response = await authService.handleOAuthCallback(accessToken);

        if (!response.refreshToken) {
          console.error('Backend did not return refresh token');
          throw new Error('Backend did not return refresh token');
        }

        // Backend automatically set access_token cookie
        // Extract user info from refresh token JWT
        try {
          const tokenParts = response.refreshToken.split('.');
          if (tokenParts.length !== 3) {
            throw new Error('Invalid JWT token format');
          }

          const payload = JSON.parse(atob(tokenParts[1])) as unknown;

          // Validate JWT payload structure
          if (
            typeof payload !== 'object' ||
            payload === null ||
            !('sub' in payload) ||
            !('email' in payload) ||
            !('firstName' in payload) ||
            !('lastName' in payload)
          ) {
            throw new Error('JWT payload missing required fields');
          }

          const validatedPayload = payload as JWTPayload;

          const user = {
            id: validatedPayload.sub,
            email: validatedPayload.email,
            firstName: validatedPayload.firstName,
            lastName: validatedPayload.lastName,
            role: validatedPayload.role,
          };

          tokenManager.setRefreshToken(response.refreshToken);
          tokenManager.setUser(user);
          updateUser(user);

          setTimeout(() => navigate(ROUTES.HOME), 500);
        } catch (parseErr: unknown) {
          console.error('Error parsing JWT payload:', parseErr);
          throw new Error('Failed to parse authentication token');
        }
      } catch (err: unknown) {
        console.error('OAuth callback failed:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setTimeout(() => navigate(ROUTES.LOGIN), 3000);
      }
    };

    handleCallback();
  }, [navigate, updateUser]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-error mb-4">Error al Autenticar usuario</h1>
          <p className="text-foreground-secondary">{error}</p>
          <p className="text-sm text-foreground-tertiary mt-2">Redireccionado a Iniciar sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-foreground">Autenticación completada...</p>
      </div>
    </div>
  );
}
