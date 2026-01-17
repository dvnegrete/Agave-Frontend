/**
 * Email Confirmation Page
 * Handles email verification callback from Supabase
 * User lands here after clicking the email confirmation link
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui';
import { ROUTES } from '@/shared';

type ConfirmationStatus = 'loading' | 'success' | 'error';

export function EmailConfirmation() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<ConfirmationStatus>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async (): Promise<void> => {
      try {
        let accessToken = null;
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          accessToken = hashParams.get('access_token');
        }

        // If not in hash, try query parameters - look for 'access_token' first (OAuth)
        if (!accessToken && window.location.search) {
          const queryParams = new URLSearchParams(window.location.search);
          accessToken = queryParams.get('access_token');

          // If still not found, try 'token' parameter (Email verification from Supabase verify endpoint)
          if (!accessToken) {
            accessToken = queryParams.get('token');
          }
        }

        if (!accessToken) {
          setStatus('error');
          setMessage('No se encontró token de confirmación. Por favor intenta el link nuevamente.');
          setTimeout(() => navigate(ROUTES.LOGIN), 5000);
          return;
        }

        // Email confirmation was successful (Supabase redirected here)
        setStatus('success');
        setMessage('¡Tu correo ha sido confirmado exitosamente! 🎉');

        window.history.replaceState(null, '', window.location.pathname);

        // Redirect to login after a short delay
        setTimeout(() => {
          navigate(ROUTES.LOGIN, {
            state: {
              message: 'Email confirmado. Ahora puedes iniciar sesión con tu correo y contraseña.',
            },
          });
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
    <div className="flex min-h-screen items-center justify-center bg-base">
      <div className="w-full max-w-md">
        <div className="bg-secondary border-2 border-primary/20 rounded-lg p-8 shadow-xl">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-foreground">Confirmando tu correo electrónico...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-foreground mb-3">Correo Confirmado</h1>
              <p className="text-foreground-secondary mb-2">{message}</p>
              <p className="text-sm text-foreground-tertiary">
                Te redireccionaremos al login en unos momentos...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-error mb-3">Error en la Confirmación</h1>
              <p className="text-foreground-secondary mb-4">{message}</p>
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
    </div>
  );
}
