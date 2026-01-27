import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import * as authService from '@/services/authService';
import { ROUTES } from '@/shared';
import { Button } from '@/shared/ui';

interface LocationState {
  email?: string;
  message?: string;
}

export function VerifyEmailPending() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const email = state?.email || '';

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(state?.message || null);
  const [error, setError] = useState<string | null>(null);

  if (!email) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base px-4">
        <div className="w-full max-w-md">
          <div className="bg-secondary border-2 border-primary rounded-lg p-8 shadow-xl text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-error/20">
                <span className="text-3xl text-error">✕</span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Email no especificado</h2>
              <p className="text-foreground-secondary mb-6">No se encontró el correo electrónico. Por favor, intenta registrarte nuevamente.</p>
            </div>
            <Button
              onClick={() => navigate(ROUTES.SIGNUP)}
              variant="primary"
              className="w-full justify-center"
            >
              Volver al registro
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const handleResendEmail = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Firebase envía el email automáticamente
      const response = await authService.resendVerificationEmail();
      setMessage(response.message);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error reenviando correo de verificación';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-base px-4">
      <div className="w-full max-w-md">
        <div className="bg-secondary border-2 border-primary rounded-lg p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">✉️</div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Verifica tu correo electrónico</h2>
            <p className="text-foreground-secondary mb-6">
              Te hemos enviado un correo electrónico a <strong className="text-foreground">{email}</strong> con un link de verificación.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex gap-4 items-start">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-info font-bold flex-shrink-0 text-sm">
                1
              </div>
              <p className="text-foreground-secondary pt-1">Revisa tu bandeja de entrada</p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-info font-bold flex-shrink-0 text-sm">
                2
              </div>
              <p className="text-foreground-secondary pt-1">Haz clic en el link de verificación</p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-info font-bold flex-shrink-0 text-sm">
                3
              </div>
              <p className="text-foreground-secondary pt-1">Tu cuenta estará lista para usar</p>
            </div>
          </div>

          {message && (
            <div className="border-l-4 border-success rounded px-4 py-3 mb-6">
              <p className="text-success text-sm">{message}</p>
            </div>
          )}

          {error && (
            <div className="border-l-4 border-error rounded px-4 py-3 mb-6">
              <p className="text-error text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-3 mb-6">
            <Button
              onClick={handleResendEmail}
              disabled={loading}
              variant="primary"
              className="w-full justify-center"
            >
              {loading ? 'Reenviando...' : '¿No recibiste el email? Reenviar'}
            </Button>

            <Button
              onClick={() => navigate(ROUTES.LOGIN)}
              variant="sameUi"
              className="w-full justify-center border-2 border-primary"
            >
              Volver al inicio de sesión
            </Button>
          </div>

          <p className="text-xs text-foreground-tertiary text-center">
            Si no encuentras el email, revisa la carpeta de spam o correo no deseado.
          </p>
        </div>
      </div>
    </main>
  );
}
