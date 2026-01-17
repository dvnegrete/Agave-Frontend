import { useState } from 'react';
import { Button, FormInput } from '@/shared/ui';
import { HOUSE_NUMBER_RANGE, ROUTES, SIGNUP_UI_TEXTS } from '@/shared';
import { useSignup } from '@hooks/useSignup';
import type { SignupFormData } from '@hooks/useSignup';

export function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { isLoading, error, handleSignup, setError } = useSignup();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    const formData: SignupFormData = {
      firstName,
      lastName,
      email,
      houseNumber,
      password,
      confirmPassword,
    };

    await handleSignup(formData);
  };

  return (
    <main className="flex min-h-full flex-col items-center justify-center bg-base min-h-screen">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">{SIGNUP_UI_TEXTS.PAGE_TITLE}</h1>
        </div>

        <div className="bg-secondary border-2 border-primary/20 rounded-lg p-8 shadow-xl">
          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-3 p-4 border-l-4 border-error rounded-lg shadow-sm mb-6">
              <svg className="w-6 h-6 text-error flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-error mb-1">{SIGNUP_UI_TEXTS.ERROR_TITLE}</h3>
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
              label={SIGNUP_UI_TEXTS.FIRST_NAME_LABEL}
              type="text"
              value={firstName}
              onChange={setFirstName}
              placeholder={SIGNUP_UI_TEXTS.FIRST_NAME_PLACEHOLDER}
              required
              disabled={isLoading}
            />

            <FormInput
              id="lastName"
              label={SIGNUP_UI_TEXTS.LAST_NAME_LABEL}
              type="text"
              value={lastName}
              onChange={setLastName}
              placeholder={SIGNUP_UI_TEXTS.LAST_NAME_PLACEHOLDER}
              required
              disabled={isLoading}
            />

            <FormInput
              id="houseNumber"
              label={SIGNUP_UI_TEXTS.HOUSE_NUMBER_LABEL}
              type="number"
              value={houseNumber}
              onChange={setHouseNumber}
              placeholder={SIGNUP_UI_TEXTS.HOUSE_NUMBER_PLACEHOLDER}
              required={false}
              optional
              min={HOUSE_NUMBER_RANGE.MIN}
              max={HOUSE_NUMBER_RANGE.MAX}
              disabled={isLoading}
            />

            <FormInput
              id="email"
              label={SIGNUP_UI_TEXTS.EMAIL_LABEL}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder={SIGNUP_UI_TEXTS.EMAIL_PLACEHOLDER}
              required
              disabled={isLoading}
            />

            <FormInput
              id="password"
              label={SIGNUP_UI_TEXTS.PASSWORD_LABEL}
              type="password"
              value={password}
              onChange={setPassword}
              placeholder={SIGNUP_UI_TEXTS.PASSWORD_PLACEHOLDER}
              required
              disabled={isLoading}
            />

            <FormInput
              id="confirmPassword"
              label={SIGNUP_UI_TEXTS.CONFIRM_PASSWORD_LABEL}
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder={SIGNUP_UI_TEXTS.CONFIRM_PASSWORD_PLACEHOLDER}
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
              {SIGNUP_UI_TEXTS.SUBMIT_BUTTON}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-foreground-secondary mb-3">
              {SIGNUP_UI_TEXTS.ALREADY_HAVE_ACCOUNT}
            </p>
            <a
              href={ROUTES.LOGIN}
              className="block text-center text-foreground hover:text-primary hover:font-semibold rounded-lg py-3 transition-colors hover:bg-primary/5"
            >
              {SIGNUP_UI_TEXTS.LOGIN_LINK}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
