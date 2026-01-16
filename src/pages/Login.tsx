import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@/shared';

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
      setError(err instanceof Error ? err.message : 'Login failed');
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
            <div className="flex items-start gap-3 p-4 bg-error/10 border-l-4 border-error rounded-lg shadow-sm mb-6">
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
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 text-base bg-base border-2 border-base text-foreground rounded-lg hover:bg-secondary transition-all duration-200 font-semibold cursor-pointer shadow-sm hover:shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuar con Google
            </button>

            {/* <button
              onClick={handleFacebookLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 text-base bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-all duration-200 font-semibold cursor-pointer shadow-sm hover:shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continuar con Facebook
            </button> */}
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
