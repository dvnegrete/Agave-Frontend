import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, FormInput, GoogleLoginButton } from '@/shared/ui';
import { ROUTES, LOGIN_UI_TEXTS, HOUSE_NUMBER_RANGE, SIGNUP_UI_TEXTS, VALIDATION_MESSAGES } from '@/shared';
import { useLogin } from '@hooks/useLogin';
import { warmupBackend } from '@services/warmupService';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [oauthHouseNumber, setOauthHouseNumber] = useState('');
  const navigate = useNavigate();

  const {
    isLoading,
    error,
    pendingOAuthIdToken,
    handleEmailLogin,
    handleOAuthLogin,
    handleCompleteOAuthRegistration,
    setError,
  } = useLogin();

  // Warmup del backend cuando se carga la página de login
  useEffect(() => {
    warmupBackend().catch(() => {
      // Ignorar errores silenciosamente
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    await handleEmailLogin(email, password);
  };

  const handleGoogleLogin = async (): Promise<void> => {
    await handleOAuthLogin('google');
  };

  const handleOAuthHouseNumberSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (oauthHouseNumber) {
      const num = parseInt(oauthHouseNumber);
      if (num < HOUSE_NUMBER_RANGE.MIN || num > HOUSE_NUMBER_RANGE.MAX) {
        setError(VALIDATION_MESSAGES.HOUSE_NUMBER_INVALID);
        return;
      }
      await handleCompleteOAuthRegistration(num);
    } else {
      await handleCompleteOAuthRegistration(undefined);
    }
  };

  // const handleFacebookLogin = async (): Promise<void> => {
  //   await handleOAuthLogin('facebook');
  // };

  // Paso intermedio: usuario nuevo de OAuth necesita indicar su número de casa
  if (pendingOAuthIdToken) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center bg-base">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {LOGIN_UI_TEXTS.OAUTH_HOUSE_NUMBER_TITLE}
            </h1>
            <p className="text-sm text-foreground-tertiary">
              {LOGIN_UI_TEXTS.OAUTH_HOUSE_NUMBER_SUBTITLE}
            </p>
          </div>

          <div className="bg-secondary border-2 border-primary rounded-lg p-8 shadow-xl">
            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-3 p-4 border-l-4 border-error rounded-lg shadow-sm mb-6">
                <svg className="w-6 h-6 text-error flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-error mb-1">{LOGIN_UI_TEXTS.ERROR_TITLE}</h3>
                  <p className="text-sm text-error">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-error hover:text-error/80 transition-colors flex-shrink-0"
                  type="button"
                  aria-label="Cerrar alerta"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <form onSubmit={handleOAuthHouseNumberSubmit} className="flex flex-col gap-4">
              <FormInput
                id="oauthHouseNumber"
                label={SIGNUP_UI_TEXTS.HOUSE_NUMBER_LABEL}
                type="number"
                value={oauthHouseNumber}
                onChange={setOauthHouseNumber}
                placeholder={SIGNUP_UI_TEXTS.HOUSE_NUMBER_PLACEHOLDER}
                required={false}
                optional
                min={HOUSE_NUMBER_RANGE.MIN}
                max={HOUSE_NUMBER_RANGE.MAX}
                disabled={isLoading}
              />

              <Button
                type="submit"
                disabled={isLoading}
                isLoading={isLoading}
                variant="primary"
                className="w-full justify-center"
              >
                {isLoading
                  ? LOGIN_UI_TEXTS.OAUTH_HOUSE_NUMBER_SUBMIT_LOADING
                  : LOGIN_UI_TEXTS.OAUTH_HOUSE_NUMBER_SUBMIT_IDLE}
              </Button>

              <Button
                type="button"
                onClick={() => handleCompleteOAuthRegistration(undefined)}
                disabled={isLoading}
                variant="sameUi"
                className="w-full justify-center"
              >
                {LOGIN_UI_TEXTS.OAUTH_HOUSE_NUMBER_SKIP}
              </Button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-base">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">{LOGIN_UI_TEXTS.PAGE_TITLE}</h1>
        </div>

        <div className="bg-secondary border-2 border-primary rounded-lg p-8 shadow-xl">
          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-3 p-4 border-l-4 border-error rounded-lg shadow-sm mb-6">
              <svg className="w-6 h-6 text-error flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-error mb-1">{LOGIN_UI_TEXTS.ERROR_TITLE}</h3>
                <p className="text-sm text-error">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-error hover:text-error/80 transition-colors flex-shrink-0"
                type="button"
                aria-label="Cerrar alerta"
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
            {/* <FacebookLoginButton onClick={handleFacebookLogin} isLoading={isLoading} /> */}
          </div>

          <div className="py-6">
            <hr className="border-base" />
            <div className="mt-2 mb-4 flex justify-center text-sm">
              <span className="px-2 bg-secondary text-foreground-tertiary">{LOGIN_UI_TEXTS.OAUTH_DIVIDER}</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormInput
              id="email"
              label={LOGIN_UI_TEXTS.EMAIL_LABEL}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder={LOGIN_UI_TEXTS.EMAIL_PLACEHOLDER}
              required
              disabled={isLoading}
            />

            <FormInput
              id="password"
              label={LOGIN_UI_TEXTS.PASSWORD_LABEL}
              type="password"
              value={password}
              onChange={setPassword}
              placeholder={LOGIN_UI_TEXTS.PASSWORD_PLACEHOLDER}
              required
              disabled={isLoading}
            />

            <div className="text-right">
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-sm text-foreground-tertiary hover:text-primary transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              isLoading={isLoading}
              variant="primary"
              className="w-full justify-center"
            >
              {isLoading ? LOGIN_UI_TEXTS.SUBMIT_BUTTON_LOADING : LOGIN_UI_TEXTS.SUBMIT_BUTTON_IDLE}
            </Button>
          </form>

          <a
            href="/"
            className="block text-center text-foreground hover:text-primary transition-colors rounded-lg py-3 mt-4"
          >
            {LOGIN_UI_TEXTS.HOME_LINK}
          </a>

          <Button
            onClick={() => navigate(ROUTES.SIGNUP)}
            variant="sameUi"
            className="w-3/4 mt-2 border-2 border-primary"
          >
            {LOGIN_UI_TEXTS.SIGNUP_LINK}
          </Button>
        </div>
      </div>
    </main>
  );
}
