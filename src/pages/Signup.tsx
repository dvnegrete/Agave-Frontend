import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '@services/authService';
import { tokenManager } from '@utils/tokenManager';
import { ROUTES } from '@/shared';

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

    if (!houseNumber || parseInt(houseNumber) <= 0) {
      setError('Por favor ingresa un número de casa válido');
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
      const response = await authService.signUp({
        email,
        password,
        firstName,
        lastName,
        houseNumber: parseInt(houseNumber),
      });

      // Store tokens and user data
      tokenManager.setRefreshToken(response.refreshToken);
      tokenManager.setUser(response.user);

      // Navigate to home
      navigate(ROUTES.HOME);
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
                <p className="text-sm text-foreground-secondary">{error}</p>
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
            {/* First Name */}
            <div className="flex flex-col gap-2">
              <label htmlFor="firstName" className="text-sm font-semibold text-foreground">
                Nombre
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Tu nombre"
                className="px-4 py-3 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder-foreground-tertiary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={isLoading}
              />
            </div>

            {/* Last Name */}
            <div className="flex flex-col gap-2">
              <label htmlFor="lastName" className="text-sm font-semibold text-foreground">
                Apellido
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Tu apellido"
                className="px-4 py-3 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder-foreground-tertiary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={isLoading}
              />
            </div>

            {/* House Number */}
            <div className="flex flex-col gap-2">
              <label htmlFor="houseNumber" className="text-sm font-semibold text-foreground">
                🏠 Número de Casa
              </label>
              <input
                type="number"
                id="houseNumber"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder="Ej: 5, 12, 45"
                min="1"
                className="px-4 py-3 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder-foreground-tertiary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={isLoading}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-semibold text-foreground">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="px-4 py-3 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder-foreground-tertiary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-semibold text-foreground">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="px-4 py-3 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder-foreground-tertiary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={isLoading}
              />
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                className="px-4 py-3 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder-foreground-tertiary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Registrando...' : '📝 Crear Cuenta'}
            </button>
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
