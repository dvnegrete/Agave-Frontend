import { useState } from 'react';
import { Modal, Button } from '@shared/ui';
import { useAuth } from '@hooks/useAuth';
import { LEGAL_TEXT, ROUTES } from '@shared/constants';

export function Home() {
  const [showQuienesSomos, setShowQuienesSomos] = useState(false);
  const { user } = useAuth();

  // Check if user is authenticated but has no access (no houses assigned)
  // Only show for tenant role - admin/owner don't need approval
  const isPendingApproval = user && user.role === 'tenant' && (!user.houses || user.houses.length === 0);
  // Check if user is authenticated and has access
  const hasAccess = user && user.houses && user.houses.length > 0;

  return (
    <main className="flex flex-1 min-h-full flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">
        {isPendingApproval ? '👋 Bienvenido, ' + (user?.firstName || user?.email) : 'Bienvenido'}
      </h1>

      <img
        className="rounded-md mt-3 md:mt-0"
        width={300}
        height={300}
        src="/el-agave-2.png"
        alt="El Agave"
      />

      {/* Pending Approval Message */}
      {isPendingApproval && (
        <div className="flex flex-col my-6 gap-4 items-center w-full max-w-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="text-5xl">⏳</div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground mb-2">En espera de confirmación</h2>
            <p className="text-sm text-foreground-secondary mb-4">
              Tu cuenta ha sido creada exitosamente. Un administrador revisará tu información y te asignará acceso a tu propiedad.
            </p>
            <p className="text-xs text-foreground-tertiary">
              Avisa a un Administrador para completar este proceso más rapido.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col my-6 gap-3 items-center w-full md:w-auto">
        {!user && (
          <>
            <Button
              onClick={() => window.location.href = '/login'}
              variant="primary"
            >
              Iniciar Sesión
            </Button>

            <Button
              onClick={() => window.location.href = '/subir-comprobante'}
              variant="sameUi"
              className="w-full md:w-auto"
            >
              Subir comprobante de mantenimiento
            </Button>
          </>
        )}

        {hasAccess && (
          <Button
            onClick={() => window.location.href = '/comprobantes'}
            variant="primary"
          >
            Ir al Dashboard
          </Button>
        )}
      </div>

      {/* Sección de Información */}
      <div className="w-full max-w-xl mt-8 flex gap-4 justify-center">
        <button
          onClick={() => setShowQuienesSomos(true)}
          className="text-xs text-foreground-secondary hover:text-primary underline transition-colors cursor-pointer"
        >
          Quiénes Somos
        </button>

        <span className="text-xs text-foreground-tertiary">|</span>

        <button
          onClick={() => window.location.href = ROUTES.PRIVACY_POLICY}
          className="text-xs text-foreground-secondary hover:text-primary underline transition-colors cursor-pointer"
        >
          Aviso de Privacidad
        </button>
      </div>

      {/* Modal Quiénes Somos */}
      <Modal
        isOpen={showQuienesSomos}
        onClose={() => setShowQuienesSomos(false)}
        title="Quiénes Somos"
      >
        {LEGAL_TEXT.WHO_WE_ARE.split('\n\n').map((paragraph, index) => (
          <p key={index}>
            {paragraph}
          </p>
        ))}
      </Modal>

    </main>
  );
}
