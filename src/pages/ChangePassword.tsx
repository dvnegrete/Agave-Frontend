import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, ErrorAlert, FormInput } from '@/shared/ui';
import { ROUTES, CHANGE_PASSWORD_UI_TEXTS } from '@/shared';
import { useChangePassword } from '@hooks/useChangePassword';

export function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const { isLoading, error, isSuccess, handleChangePassword } =
    useChangePassword();

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate(ROUTES.DASHBOARD);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    await handleChangePassword(currentPassword, newPassword, confirmPassword);
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-base">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {CHANGE_PASSWORD_UI_TEXTS.PAGE_TITLE}
          </h1>
        </div>

        <div className="bg-secondary border-2 border-primary rounded-lg p-8 shadow-xl">
          <ErrorAlert message={error} />

          {isSuccess ? (
            <div className="text-center py-4">
              <p className="text-4xl mb-4">✅</p>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {CHANGE_PASSWORD_UI_TEXTS.SUCCESS_TITLE}
              </h2>
              <p className="text-sm text-foreground-tertiary">
                {CHANGE_PASSWORD_UI_TEXTS.SUCCESS_DESCRIPTION}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FormInput
                id="currentPassword"
                label={CHANGE_PASSWORD_UI_TEXTS.CURRENT_PASSWORD_LABEL}
                type="password"
                value={currentPassword}
                onChange={setCurrentPassword}
                placeholder={CHANGE_PASSWORD_UI_TEXTS.CURRENT_PASSWORD_PLACEHOLDER}
                required
                disabled={isLoading}
              />

              <FormInput
                id="newPassword"
                label={CHANGE_PASSWORD_UI_TEXTS.NEW_PASSWORD_LABEL}
                type="password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder={CHANGE_PASSWORD_UI_TEXTS.NEW_PASSWORD_PLACEHOLDER}
                required
                disabled={isLoading}
              />

              <FormInput
                id="confirmPassword"
                label={CHANGE_PASSWORD_UI_TEXTS.CONFIRM_PASSWORD_LABEL}
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder={CHANGE_PASSWORD_UI_TEXTS.CONFIRM_PASSWORD_PLACEHOLDER}
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
                  ? CHANGE_PASSWORD_UI_TEXTS.SUBMIT_BUTTON_LOADING
                  : CHANGE_PASSWORD_UI_TEXTS.SUBMIT_BUTTON_IDLE}
              </Button>

              <Link
                to={ROUTES.DASHBOARD}
                className="block text-center text-foreground hover:text-primary transition-colors rounded-lg py-3"
              >
                {CHANGE_PASSWORD_UI_TEXTS.BACK_TO_DASHBOARD}
              </Link>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
