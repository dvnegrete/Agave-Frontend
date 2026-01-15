import { useState } from 'react';
import { Modal, Button } from '@shared/ui';
import { LEGAL_TEXT } from '@shared/constants';

export function Home() {
  const [showQuienesSomos, setShowQuienesSomos] = useState(false);
  const [showAvisoPrivacidad, setShowAvisoPrivacidad] = useState(false);

  return (
    <main className="flex min-h-full flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Bienvenido</h1>

      <img
        className="rounded-md mt-3 md:mt-0"
        width={300}
        height={300}
        src="/el-agave-2.png"
        alt="El Agave"
      />

      <div className="flex flex-col my-6 gap-3 items-center w-full md:w-auto">
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
          onClick={() => setShowAvisoPrivacidad(true)}
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

      {/* Modal Aviso de Privacidad */}
      <Modal
        isOpen={showAvisoPrivacidad}
        onClose={() => setShowAvisoPrivacidad(false)}
        title="🔒 Aviso de Privacidad"
      >
        {LEGAL_TEXT.PRIVACY_POLICY.split('\n\n').map((paragraph, index) => (
          <p key={index} className={index === LEGAL_TEXT.PRIVACY_POLICY.split('\n\n').length - 1 ? 'text-xs italic mt-4 text-gray-500 dark:text-gray-500' : ''}>
            {paragraph}
          </p>
        ))}
      </Modal>
    </main>
  );
}
