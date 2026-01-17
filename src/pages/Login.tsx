import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@/shared';
import { GoogleLoginButton, FacebookLoginButton } from '@/shared/ui';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { login, loginWithOAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      // Navigation is handled by AuthContext
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : 'No se pudo completar el inicio de sesión. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
      await loginWithOAuth('google');
      // Redirect is handled by initOAuthFlow
    } catch (err) {
      console.error('OAuth login failed:', err);
      setError(err instanceof Error ? err.message : 'OAuth initialization failed');
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async (): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
      await loginWithOAuth('facebook');
      // Redirect is handled by initOAuthFlow
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OAuth initialization failed');
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-full flex-col items-center justify-center bg-base min-h-screen">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">🔐 Iniciar Sesión</h1>
        </div>

        <div className="bg-secondary border-2 border-primary/20 rounded-lg p-8 shadow-xl">
          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-3 p-4 border-l-4 border-error rounded-lg shadow-sm mb-6">
              <svg className="w-6 h-6 text-error flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-error mb-1">Error de autenticación</h3>
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

          {/* Social Login Buttons */}
          <div className="flex flex-col gap-3 mb-6">
            <GoogleLoginButton onClick={handleGoogleLogin} isLoading={isLoading} />
            <FacebookLoginButton onClick={handleFacebookLogin} isLoading={isLoading} />
          </div>

          <div className="py-6">
            <hr className="border-foreground-tertiary/30" />
            <div className="mt-2 mb-4 flex justify-center text-sm">
              <span className="px-2 bg-secondary text-foreground-tertiary">O continúa con email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
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

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-semibold text-foreground">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="px-4 py-3 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder-foreground-tertiary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Entrando...' : '🔓 Entrar'}
            </button>
          </form>

          <a
            href="/"
            className="block text-center text-foreground hover:text-primary hover:font-semibold rounded-lg py-3 transition-colors hover:bg-primary/5 mt-4"
          >
            Volver al inicio
          </a>

          <button
            onClick={() => navigate(ROUTES.SIGNUP)}
            className="block w-full text-center text-foreground hover:text-primary hover:font-semibold rounded-lg py-3 transition-colors hover:bg-primary/5 mt-2 border-2 border-primary border-opacity-20 hover:border-opacity-50"
          >
            ✍️ Crear una cuenta
          </button>
        </div>
      </div>
    </main>
  );
}
