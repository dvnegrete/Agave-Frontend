/**
 * Email Confirmation Page
 * Handles email verification callback from Supabase
 * User lands here after clicking the email confirmation link
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui';
import { ROUTES } from '@/shared';

type ConfirmationStatus = 'loading' | 'success' | 'error';

export function EmailConfirmation() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<ConfirmationStatus>('loading');
  const [message, setMessage] = useState('');
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    // Only process once using ref to avoid async setState issues
    if (hasProcessedRef.current) {
      return;
    }
    hasProcessedRef.current = true;

    const handleEmailConfirmation = (): void => {
      try {
        let accessToken: string | null = null;

        // Try hash first (older format): #access_token=...
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          accessToken = hashParams.get('access_token');
          if (accessToken) {
            console.log('Token found in hash');
          }
        }

        // Try query parameters - look for 'access_token' first (OAuth)
        if (!accessToken && window.location.search) {
          const queryParams = new URLSearchParams(window.location.search);
          accessToken = queryParams.get('access_token');

          // If not found, try 'token' parameter (Email verification)
          if (!accessToken) {
            accessToken = queryParams.get('token');
            if (accessToken) {
              console.log('Token found in query parameter "token"');
            }
          } else {
            console.log('Token found in query parameter "access_token"');
          }
        }

        console.log('URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        console.log('Search:', window.location.search);
        console.log('Token found:', !!accessToken);

        if (!accessToken) {
          setStatus('error');
          setMessage('No se encontró token de confirmación. Por favor intenta el link nuevamente.');
          setTimeout(() => navigate(ROUTES.LOGIN), 5000);
          return;
        }

        // Email confirmation was successful
        setStatus('success');
        setMessage('¡Tu correo ha sido confirmado exitosamente! 🎉');

        // Redirect to login after showing success message
        setTimeout(() => {
          navigate(ROUTES.LOGIN);
        }, 2000);
      } catch (err) {
        console.error('Email confirmation error:', err);
        setStatus('error');
        setMessage('Ocurrió un error al confirmar tu correo. Por favor intenta de nuevo.');
        setTimeout(() => navigate(ROUTES.LOGIN), 5000);
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-base">
      <div className="w-full max-w-md px-4">
        <div className="bg-secondary border-2 border-primary rounded-lg p-8 shadow-xl">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary mx-auto mb-4"></div>
              <p className="text-foreground">Confirmando tu correo electrónico...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="text-6xl">✅</div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Correo Confirmado</h1>
                <p className="text-foreground-secondary mb-2">{message}</p>
                <p className="text-sm text-foreground-tertiary">
                  Te redireccionaremos al login en unos momentos...
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="text-6xl">❌</div>
              <div>
                <h1 className="text-2xl font-bold text-error mb-2">Error en la Confirmación</h1>
                <p className="text-foreground-secondary mb-4">{message}</p>
              </div>
              <Button
                onClick={() => navigate(ROUTES.LOGIN)}
                variant="primary"
                className="w-full justify-center"
              >
                Volver al Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
