import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import * as authService from '@/services/authService';
import { ROUTES } from '@/shared';
import styles from './VerifyEmailPending.module.css';

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
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.errorIcon}>✕</div>
          <h2>Email no especificado</h2>
          <p>No se encontró el correo electrónico. Por favor, intenta registrarte nuevamente.</p>
          <button onClick={() => navigate(ROUTES.SIGNUP)} className={styles.primaryButton}>
            Volver al registro
          </button>
        </div>
      </div>
    );
  }

  const handleResendEmail = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await authService.resendVerificationEmail(email);
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
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>✉️</div>

        <h2>Verifica tu correo electrónico</h2>

        <p className={styles.description}>
          Te hemos enviado un correo electrónico a <strong>{email}</strong> con un link de
          verificación.
        </p>

        <div className={styles.steps}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <p>Revisa tu bandeja de entrada</p>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <p>Haz clic en el link de verificación</p>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <p>Tu cuenta estará lista para usar</p>
          </div>
        </div>

        {message && <div className={styles.successMessage}>{message}</div>}

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.actions}>
          <button
            onClick={handleResendEmail}
            disabled={loading}
            className={styles.primaryButton}
          >
            {loading ? 'Reenviando...' : '¿No recibiste el email? Reenviar'}
          </button>

          <button onClick={() => navigate(ROUTES.LOGIN)} className={styles.secondaryButton}>
            Volver al inicio de sesión
          </button>
        </div>

        <p className={styles.spam}>
          Si no encuentras el email, revisa la carpeta de spam o correo no deseado.
        </p>
      </div>
    </div>
  );
}
