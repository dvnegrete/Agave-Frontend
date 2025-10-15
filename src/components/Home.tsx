import { useState } from 'react';
import Modal from './Modal';

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

      <a
        href="/login"
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg mb-4 my-5 py-2 px-4 rounded"
      >
        Iniciar Sesión
      </a>

      {/* Sección de Información */}
      <div className="w-full max-w-xl mt-8 flex gap-4 justify-center">
        <button
          onClick={() => setShowQuienesSomos(true)}
          className="text-xs text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 underline transition-colors cursor-pointer"
        >
          Quiénes Somos
        </button>

        <span className="text-xs text-gray-400 dark:text-gray-600">|</span>

        <button
          onClick={() => setShowAvisoPrivacidad(true)}
          className="text-xs text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 underline transition-colors cursor-pointer"
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
