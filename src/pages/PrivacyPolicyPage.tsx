import { Button } from '@shared/ui';
import { LEGAL_TEXT } from '@shared/constants';

export function PrivacyPolicyPage() {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <main className="flex min-h-full flex-col items-center p-6 md:p-12">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleGoBack}
            className="text-sm text-primary hover:text-primary/80 transition-colors mb-6 flex items-center gap-2"
          >
            ← Volver
          </button>
          <h1 className="text-4xl font-bold text-foreground mb-2">🔒 Aviso de Privacidad</h1>
          <p className="text-foreground-secondary">Protección de datos personales</p>
        </div>

        {/* Content */}
        <div className="bg-secondary rounded-lg p-8 shadow-lg">
          <div className="space-y-6 text-foreground">
            {LEGAL_TEXT.PRIVACY_POLICY.split('\n\n').map((paragraph, index) => {
              const isLastParagraph = index === LEGAL_TEXT.PRIVACY_POLICY.split('\n\n').length - 1;
              return (
                <p
                  key={index}
                  className={`leading-relaxed ${
                    isLastParagraph ? 'text-xs italic text-foreground-tertiary mt-8 pt-6 border-t border-base' : 'text-foreground-secondary'
                  }`}
                >
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-center gap-4 mt-8">          
          <Button
            onClick={() => window.location.href = '/'}
            variant="primary"
          >
            Ir al Inicio
          </Button>
        </div>
      </div>
    </main>
  );
}
