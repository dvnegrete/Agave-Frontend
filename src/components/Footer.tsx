export default function Footer() {
  return (
    <footer className="w-full bg-gray-800 text-white py-4 mt-4">
      <div className="max-w-6xl mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Dirección */}
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 mt-1 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <div>
              <h3 className="font-semibold mb-1">Dirección</h3>
              <p className="text-gray-300">Condominio El Agave</p>
              <p className="text-gray-300">Calle Principal #123</p>
              <p className="text-gray-300">Ciudad, Estado, CP</p>
            </div>
          </div>

          {/* Teléfono */}
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 mt-1 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <div>
              <h3 className="font-semibold mb-1">Teléfono</h3>
              <a
                href="tel:+525512345678"
                className="text-gray-300 hover:text-blue-400 transition-colors"
              >
                +52 55 1234 5678
              </a>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 mt-1 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <div>
              <h3 className="font-semibold mb-1">Email</h3>
              <a
                href="mailto:contacto@elagave.com"
                className="text-gray-300 hover:text-blue-400 transition-colors"
              >
                contacto@elagave.com
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-3 pt-2 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Condominio El Agave. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
