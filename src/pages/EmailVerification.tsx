import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as authService from '@/services/authService';
import { ROUTES } from '@/shared';
import styles from './EmailVerification.module.css';

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
    <div className={styles.container}>
      <div className={styles.card}>
        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Verificando tu correo electrónico...</p>
          </div>
        )}

        {success && !loading && (
          <div className={styles.success}>
            <div className={styles.successIcon}>✓</div>
            <h2>Correo electrónico verificado</h2>
            <p>Tu cuenta está lista. Serás redirigido al inicio en breve.</p>
          </div>
        )}

        {error && !loading && (
          <div className={styles.error}>
            <div className={styles.errorIcon}>✕</div>
            <h2>Error en la verificación</h2>
            <p>{error}</p>
            <button onClick={() => navigate(ROUTES.LOGIN)} className={styles.button}>
              Volver al inicio de sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
