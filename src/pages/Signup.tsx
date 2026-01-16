import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '@services/authService';
import { tokenManager } from '@utils/tokenManager';
import { Button, FormInput } from '@/shared/ui';
import { HOUSE_NUMBER_RANGE, ROUTES, VALIDATION_MESSAGES } from '@/shared';

export function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      setError('Por favor ingresa tu nombre y apellido');
      return;
    }

    // Validate house number if provided
    if (houseNumber && (parseInt(houseNumber) < HOUSE_NUMBER_RANGE.MIN || parseInt(houseNumber) > HOUSE_NUMBER_RANGE.MAX)) {
      setError(VALIDATION_MESSAGES.HOUSE_NUMBER_INVALID);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const signUpData: any = {
        email,
        password,
        firstName,
        lastName,
      };

      // Only include houseNumber if provided
      if (houseNumber) {
        signUpData.houseNumber = parseInt(houseNumber);
      }

      const response = await authService.signUp(signUpData);

      // Check if email confirmation is required
      if (response.requiresEmailConfirmation) {
        setError(null);
        // Show success message
        alert(`¡Cuenta creada exitosamente! 🎉\n\nPor favor verifica tu correo electrónico (${email}) para confirmar tu cuenta.\n\nUna vez confirmado, podrás iniciar sesión.`);
        // Redirect to login page
        navigate(ROUTES.LOGIN);
        return;
      }

      // Store tokens and user data only if we have valid tokens
      if (response.refreshToken) {
        tokenManager.setRefreshToken(response.refreshToken);
        tokenManager.setUser(response.user);
        // Navigate to home
        navigate(ROUTES.HOME);
      } else {
        // This shouldn't happen, but handle gracefully
        setError('Error al procesar el registro. Por favor intenta de nuevo.');
      }
    } catch (err) {
      console.error('Signup failed:', err);
      setError(err instanceof Error ? err.message : 'Error en el registro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-full flex-col items-center justify-center bg-base min-h-screen">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">✍️ Crear Cuenta</h1>
        </div>

        <div className="bg-secondary border-2 border-primary/20 rounded-lg p-8 shadow-xl">
          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-error/10 border-l-4 border-error rounded-lg shadow-sm mb-6">
              <svg className="w-6 h-6 text-error flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-error mb-1">Error en el registro</h3>
                <p className="text-sm text-error">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-error hover:text-error/80 transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormInput
              id="firstName"
              label="Nombre"
              type="text"
              value={firstName}
              onChange={setFirstName}
              placeholder="Tu nombre"
              required
              disabled={isLoading}
            />

            <FormInput
              id="lastName"
              label="Apellido"
              type="text"
              value={lastName}
              onChange={setLastName}
              placeholder="Tu apellido"
              required
              disabled={isLoading}
            />

            <FormInput
              id="houseNumber"
              label="🏠 Número de Casa"
              type="number"
              value={houseNumber}
              onChange={setHouseNumber}
              placeholder="Ej: 5, 12, 45"
              required={false}
              optional
              min={HOUSE_NUMBER_RANGE.MIN}
              max={HOUSE_NUMBER_RANGE.MAX}
              disabled={isLoading}
            />

            <FormInput
              id="email"
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="ejemplo@correo.com"
              required
              disabled={isLoading}
            />

            <FormInput
              id="password"
              label="Contraseña"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Mínimo 6 caracteres"
              required
              disabled={isLoading}
            />

            <FormInput
              id="confirmPassword"
              label="Confirmar Contraseña"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Repite tu contraseña"
              required
              disabled={isLoading}
            />

            <Button
              type="submit"
              disabled={isLoading}
              isLoading={isLoading}
              variant="primary"
              className="w-full justify-center"
            >
              📝 Crear Cuenta
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-foreground-secondary mb-3">
              ¿Ya tienes cuenta?
            </p>
            <a
              href={ROUTES.LOGIN}
              className="block text-center text-foreground hover:text-primary hover:font-semibold rounded-lg py-3 transition-colors hover:bg-primary/5"
            >
              Inicia sesión aquí
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
