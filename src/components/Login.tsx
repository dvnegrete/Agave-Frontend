import { useState } from 'react';
import { Button } from '../ui/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showAlert, setShowAlert] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const handleGoogleLogin = () => {
    console.log('Login with Google');
    // Parámetros para la autenticación de Google OAuth 2.0
    const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = new URLSearchParams({
      client_id: 'YOUR_GOOGLE_CLIENT_ID', // Reemplazar con tu Client ID real
      redirect_uri: `${window.location.origin}/auth/google/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent'
    });

    // Abrir popup de autenticación de Google
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      `${googleAuthUrl}?${params.toString()}`,
      'Google Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const handleFacebookLogin = () => {
    console.log('Login with Facebook');
    // Parámetros para la autenticación de Facebook OAuth
    const facebookAuthUrl = 'https://www.facebook.com/v18.0/dialog/oauth';
    const params = new URLSearchParams({
      client_id: 'YOUR_FACEBOOK_APP_ID', // Reemplazar con tu App ID real
      redirect_uri: `${window.location.origin}/auth/facebook/callback`,
      response_type: 'code',
      scope: 'email,public_profile',
      state: Math.random().toString(36).substring(7) // Token aleatorio para seguridad
    });

    // Abrir popup de autenticación de Facebook
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      `${facebookAuthUrl}?${params.toString()}`,
      'Facebook Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  return (
    <main className="flex min-h-full flex-col items-center justify-center bg-base min-h-screen">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">🔐 Iniciar Sesión</h1>
        </div>

        <div className="bg-secondary border-2 border-primary/20 rounded-lg p-8 shadow-xl">
          {/* Social Login Buttons */}
          <div className="flex flex-col gap-3 mb-6">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 text-base bg-base border-2 border-base text-foreground rounded-lg hover:bg-secondary transition-all duration-200 font-semibold cursor-pointer shadow-sm hover:shadow-md transform hover:scale-105"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuar con Google
            </button>

            <button
              onClick={handleFacebookLogin}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 text-base bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-all duration-200 font-semibold cursor-pointer shadow-sm hover:shadow-md transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continuar con Facebook
            </button>
          </div>

          <div className="py-6">
            <hr className="border-foreground-tertiary/30" />
            <div className="mt-2 mb-4 flex justify-center text-sm">
              <span className="px-2 bg-secondary text-foreground-tertiary">O continúa con email</span>
            </div>
          </div>

          {/* Alert de desarrollo */}
          {showAlert && (
            <div className="flex items-start gap-3 p-4 bg-warning/10 border-l-4 border-warning rounded-lg shadow-sm mb-6 animate-fade-in">
              <svg
                className="w-6 h-6 text-warning flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-warning mb-1">
                  Funcionalidad en desarrollo
                </h3>
                <p className="text-sm text-foreground-secondary">
                  El inicio de sesión NO está disponible. Actualmente se encuentra en desarrollo.
                </p>
              </div>
              <button
                onClick={() => setShowAlert(false)}
                className="text-warning hover:text-warning/80 transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                className="px-4 py-3 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder-foreground-tertiary transition-all duration-200"
                required
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
                className="px-4 py-3 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder-foreground-tertiary transition-all duration-200"
                required
              />
            </div>

            <Button
              variant="primary"
              className="w-full justify-center"
            >
              🔓 Entrar
            </Button>
          </form>

          <a
            href="/"
            className="block text-center text-foreground hover:text-primary hover:font-semibold rounded-lg py-3 transition-colors hover:bg-primary/5 mt-4"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </main >
  );
}
