import { useState } from 'react';
import Modal from './Modal';
import { Button } from '@shared/ui';

export default function Home() {
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

        <p className="text-sm text-foreground-secondary mt-4">
          Acceso rápido:
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            onClick={() => window.location.href = '/vouchers'}
            variant="success"
            className="sm:text-sm sm:py-2 sm:px-3"
          >
            📝 Vouchers
          </Button>
          <Button
            onClick={() => window.location.href = '/transactions'}
            variant="info"
            className="sm:text-sm sm:py-2 sm:px-3"
          >
            💰 Transacciones
          </Button>
          <Button
            onClick={() => window.location.href = '/reconciliation'}
            variant="warning"
            className="sm:text-sm sm:py-2 sm:px-3"
          >
            🔄 Conciliación
          </Button>
        </div>
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
        <p>
          El Comité de vigilancia del Condominio El Agave esta conformada por algunos de los residentes del fraccionamiento con el propósito de administrar y coordinar los servicios comunes, el mantenimiento de las áreas compartidas y la comunicación entre los habitantes.
        </p>
        <p>
          Nuestro objetivo principal es atender las necesidades del condominio, fomentar la convivencia responsable, la transparencia en el manejo de recursos y el bienestar general de todos los residentes del condominio.
        </p>
        <p>
          A través de este sitio web se facilita la comunicación, la gestión de pagos de mantenimiento y el acceso a información relevante para la comunidad.
        </p>
      </Modal>

      {/* Modal Aviso de Privacidad */}
      <Modal
        isOpen={showAvisoPrivacidad}
        onClose={() => setShowAvisoPrivacidad(false)}
        title="🔒 Aviso de Privacidad"
      >
        <p>
          En el Condominio El Agave, a través de su sitio web y canales de comunicación oficiales, respetamos y protegemos la información personal de nuestros residentes y usuarios.
        </p>

        <p>
          Los datos personales que se recaben (como nombre, dirección, correo electrónico o número telefónico) serán utilizados exclusivamente para fines relacionados con la administración, comunicación, avisos y gestión de mantenimiento del condominio.
        </p>

        <p>
          No compartimos, transferimos ni vendemos datos personales a terceros.
          El tratamiento de la información se realiza conforme a los principios de licitud, consentimiento, información, calidad, finalidad, lealtad, proporcionalidad y responsabilidad establecidos en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (México).
        </p>

        <p>
          Los titulares de los datos pueden ejercer sus derechos de acceso, rectificación, cancelación u oposición (derechos ARCO) enviando una solicitud al correo electrónico: <i>contacto@condominioelagave.com.mx</i>
        </p>

        <p className="text-xs italic mt-4 text-gray-500 dark:text-gray-500">
          Este aviso puede actualizarse en cualquier momento; cualquier modificación será publicada en este mismo sitio web.
        </p>
      </Modal>
    </main>
  );
}
