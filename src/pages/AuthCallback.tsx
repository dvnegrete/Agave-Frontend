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

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔐 [AuthCallback] useEffect triggered');
      console.log('🔐 [AuthCallback] Current window.location.href:', window.location.href);
      console.log('🔐 [AuthCallback] Current window.location.search:', window.location.search);
      console.log('🔐 [AuthCallback] Current window.location.hash:', window.location.hash);

      // Check for Authorization Code Flow (query parameters)
      let code = searchParams.get('code');
      console.log('🔐 [AuthCallback] Code from query params:', code);

      // Check for Implicit Flow (hash/fragment - Supabase default)
      let accessToken = null;
      let refreshToken = null;
      let provider = null;

      if (window.location.hash) {
        console.log('🔐 [AuthCallback] Found hash fragment, parsing tokens');
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        accessToken = hashParams.get('access_token');
        refreshToken = hashParams.get('refresh_token');
        provider = hashParams.get('provider');

        console.log('🔐 [AuthCallback] Tokens from hash fragment:', {
          hasAccessToken: !!accessToken,
          accessTokenLength: accessToken?.length,
          hasRefreshToken: !!refreshToken,
          refreshTokenLength: refreshToken?.length,
          provider,
        });
      }

      // Determine which flow we're using
      if (code) {
        console.log('🔐 [AuthCallback] Using Authorization Code Flow');
        try {
          console.log('🔐 [AuthCallback] Calling authService.handleOAuthCallback with code:', code);
          const response = await authService.handleOAuthCallback(code);

          console.log('🔐 [AuthCallback] Response received from backend:', {
            hasAccessToken: !!response.accessToken,
            accessTokenLength: response.accessToken?.length,
            hasRefreshToken: !!response.refreshToken,
            refreshTokenLength: response.refreshToken?.length,
            user: response.user,
          });

          if (!response.accessToken || !response.refreshToken) {
            console.error('❌ [AuthCallback] Response missing tokens:', response);
            throw new Error('Backend did not return access token or refresh token');
          }

          tokenManager.setAccessToken(response.accessToken);
          tokenManager.setRefreshToken(response.refreshToken);
          tokenManager.setUser(response.user);

          updateUser(response.user);
          console.log('✅ [AuthCallback] OAuth authentication successful');
          setTimeout(() => navigate('/'), 500);
        } catch (err) {
          console.error('❌ [AuthCallback] OAuth callback error:', err);
          setError(err instanceof Error ? err.message : 'Authentication failed');
          setTimeout(() => navigate('/login'), 3000);
        }
      } else if (accessToken) {
        console.log('🔐 [AuthCallback] Using Implicit Flow (tokens from hash)');
        try {
          // In Implicit Flow, Supabase gives us the tokens directly
          // We need to extract the user info from the JWT
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          console.log('🔐 [AuthCallback] JWT payload:', payload);

          const user = {
            id: payload.sub,
            email: payload.email,
            firstName: payload.user_metadata?.name?.split(' ')[0],
            lastName: payload.user_metadata?.name?.split(' ')[1],
          };

          console.log('🔐 [AuthCallback] Extracted user from JWT:', user);

          tokenManager.setAccessToken(accessToken);
          if (refreshToken) {
            tokenManager.setRefreshToken(refreshToken);
          }
          tokenManager.setUser(user);

          updateUser(user);
          console.log('✅ [AuthCallback] OAuth authentication successful (Implicit Flow)');
          setTimeout(() => navigate('/'), 500);
        } catch (err) {
          console.error('❌ [AuthCallback] Error processing OAuth tokens:', err);
          setError(err instanceof Error ? err.message : 'Authentication failed');
          setTimeout(() => navigate('/login'), 3000);
        }
      } else {
        console.error('❌ [AuthCallback] No authorization code or access token found');
        console.log('🔐 [AuthCallback] Query params:', Object.fromEntries(searchParams));
        setError('No authorization code or tokens received');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, updateUser]);

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
