import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as authService from '@/services/authService';
import { ROUTES } from '@/shared';
import { Button } from '@/shared/ui';

export function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Obtener el firebaseUid de los parámetros de URL
        // En Firebase, el token está en la URL como "oobCode"
        // Para esta implementación, asumimos que el frontend pasará el firebaseUid
        const firebaseUid = searchParams.get('uid');

        if (!firebaseUid) {
          setError('Token de verificación inválido o expirado');
          setLoading(false);
          return;
        }

        // Llamar al backend para verificar el email
        const response = await authService.verifyEmail(firebaseUid);

        // Si la verificación fue exitosa
        if (response.user.emailVerified) {
          setSuccess(true);

          // Guardar tokens y usuario
          if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
          }

          localStorage.setItem('user', JSON.stringify(response.user));

          // Redirigir a home después de 2 segundos
          setTimeout(() => {
            navigate(ROUTES.HOME);
          }, 2000);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error verificando correo electrónico';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-base px-4">
      <div className="w-full max-w-md">
        <div className="bg-secondary border-2 border-primary rounded-lg p-8 shadow-xl">
          {loading && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary"></div>
              </div>
              <p className="text-foreground">Verificando tu correo electrónico...</p>
            </div>
          )}

          {success && !loading && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-success/20">
                  <span className="text-3xl text-success">✓</span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Correo electrónico verificado</h2>
                <p className="text-foreground-secondary">Tu cuenta está lista. Serás redirigido al inicio en breve.</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-error/20">
                  <span className="text-3xl text-error">✕</span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-error mb-2">Error en la verificación</h2>
                <p className="text-foreground-secondary mb-6">{error}</p>
              </div>
              <Button
                onClick={() => navigate(ROUTES.LOGIN)}
                variant="primary"
                className="w-full justify-center"
              >
                Volver al inicio de sesión
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
