/**
 * Auth Callback Page
 * Handles OAuth callback from providers (Google, Facebook, etc.)
 * Extracts authorization code from URL and completes the authentication flow
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tokenManager } from '../utils/tokenManager';
import * as authService from '../services/authService';
import { useAuth } from '../hooks/useAuth';

interface JWTPayload {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  iat?: number;
  exp?: number;
}

export default function AuthCallback(): JSX.Element {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async (): Promise<void> => {
      console.log('🔐 [AuthCallback] useEffect triggered');
      console.log('🔐 [AuthCallback] Current window.location.href:', window.location.href);
      console.log('🔐 [AuthCallback] Current window.location.hash:', window.location.hash);

      // Implicit Flow - Supabase redirects with tokens in hash fragment
      let accessToken = null;

      if (window.location.hash) {
        console.log('🔐 [AuthCallback] Found hash fragment, parsing Supabase access token');
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        accessToken = hashParams.get('access_token');

        console.log('🔐 [AuthCallback] Supabase access token:', {
          hasAccessToken: !!accessToken,
          accessTokenLength: accessToken?.length,
        });
      }

      if (!accessToken) {
        console.error('❌ [AuthCallback] No access token found in hash');
        setError('No access token received from OAuth provider');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        console.log('🔐 [AuthCallback] Sending access token to backend...');
        // Send Supabase access token to backend for exchange
        const response = await authService.handleOAuthCallback(accessToken);

        console.log('🔐 [AuthCallback] Response received from backend:', {
          hasRefreshToken: !!response.refreshToken,
          refreshTokenLength: response.refreshToken?.length,
        });

        if (!response.refreshToken) {
          console.error('❌ [AuthCallback] Response missing refresh token:', response);
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
          console.log('🔐 [AuthCallback] Extracted JWT payload:', validatedPayload);

          const user = {
            id: validatedPayload.sub,
            email: validatedPayload.email,
            firstName: validatedPayload.firstName,
            lastName: validatedPayload.lastName,
          };

          console.log('🔐 [AuthCallback] Extracted user info:', user);

          tokenManager.setRefreshToken(response.refreshToken);
          tokenManager.setUser(user);
          updateUser(user);

          console.log('✅ [AuthCallback] OAuth authentication successful');
          setTimeout(() => navigate('/'), 500);
        } catch (parseErr: unknown) {
          console.error('❌ [AuthCallback] Error parsing JWT payload:', parseErr);
          throw new Error('Failed to parse authentication token');
        }
      } catch (err: unknown) {
        console.error('❌ [AuthCallback] OAuth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [navigate, updateUser]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-error mb-4">Authentication Error</h1>
          <p className="text-foreground-secondary">{error}</p>
          <p className="text-sm text-foreground-tertiary mt-2">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}
