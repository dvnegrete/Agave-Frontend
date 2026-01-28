import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import * as authService from '@/services/authService';
import { tokenManager } from '@utils/tokenManager';
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
        const auth = getAuth();

        // Estrategia 1: Obtener uid del parámetro de URL (si existe)
        let firebaseUid = searchParams.get('uid');

        // Estrategia 2: Obtener uid del usuario autenticado actualmente en Firebase
        // (Esto es más confiable porque significa que el usuario acaba de verificar el email)
        if (!firebaseUid && auth.currentUser) {
          firebaseUid = auth.currentUser.uid;
          console.log('Email verificado por Firebase, uid del usuario autenticado:', firebaseUid);
        }

        if (!firebaseUid) {
          setError('No se pudo obtener la información del usuario. Por favor, intenta nuevamente.');
          setLoading(false);
          return;
        }

        // Verificar si el email ya está verificado en Firebase
        // (Refrescar claims para obtener el estado más actualizado)
        await auth.currentUser?.getIdTokenResult(true);

        // Llamar al backend para sincronizar la verificación en PostgreSQL
        const response = await authService.verifyEmail(firebaseUid);

        // Si la verificación fue exitosa
        if (response.user.emailVerified) {
          setSuccess(true);

          // Guardar tokens y usuario
          if (response.refreshToken) {
            tokenManager.setRefreshToken(response.refreshToken);
          }

          tokenManager.setUser(response.user);

          // Redirigir a home después de 2 segundos
          setTimeout(() => {
            navigate(ROUTES.HOME);
          }, 2000);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error verificando correo electrónico';
        console.error('Email verification error:', err);
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
