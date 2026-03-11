import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, ErrorAlert, FormInput } from '@/shared/ui';
import { ROUTES, FORGOT_PASSWORD_UI_TEXTS } from '@/shared';
import { useForgotPassword } from '@hooks/useForgotPassword';

export function ForgotPassword() {
  const [email, setEmail] = useState('');

  const { isLoading, error, isSuccess, handleSendResetEmail } =
    useForgotPassword();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    await handleSendResetEmail(email);
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-base">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {FORGOT_PASSWORD_UI_TEXTS.PAGE_TITLE}
          </h1>
        </div>

        <div className="bg-secondary border-2 border-primary rounded-lg p-8 shadow-xl">
          <ErrorAlert message={error} />

          {isSuccess ? (
            <div className="text-center py-4">
              <p className="text-4xl mb-4">✅</p>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {FORGOT_PASSWORD_UI_TEXTS.SUCCESS_TITLE}
              </h2>
              <p className="text-sm text-foreground-tertiary mb-6">
                {FORGOT_PASSWORD_UI_TEXTS.SUCCESS_DESCRIPTION}
              </p>
              <Link
                to={ROUTES.LOGIN}
                className="text-sm text-foreground-tertiary hover:text-primary transition-colors"
              >
                {FORGOT_PASSWORD_UI_TEXTS.BACK_TO_LOGIN}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FormInput
                id="email"
                label={FORGOT_PASSWORD_UI_TEXTS.EMAIL_LABEL}
                type="email"
                value={email}
                onChange={setEmail}
                placeholder={FORGOT_PASSWORD_UI_TEXTS.EMAIL_PLACEHOLDER}
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
                {isLoading
                  ? FORGOT_PASSWORD_UI_TEXTS.SUBMIT_BUTTON_LOADING
                  : FORGOT_PASSWORD_UI_TEXTS.SUBMIT_BUTTON_IDLE}
              </Button>

              <Link
                to={ROUTES.LOGIN}
                className="block text-center text-foreground hover:text-primary transition-colors rounded-lg py-3"
              >
                {FORGOT_PASSWORD_UI_TEXTS.BACK_TO_LOGIN}
              </Link>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
