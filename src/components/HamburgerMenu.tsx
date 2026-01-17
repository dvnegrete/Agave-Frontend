import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import type { MenuItem } from '@/shared';
import { ICONS, LABELS, ROUTES } from '@/shared';

const menuItems: MenuItem[] = [
  { path: '/', label: LABELS.HOME, icon: ICONS.HOME },
  {
    path: ROUTES.VOUCHER_UPLOAD,
    label: LABELS.VOUCHER_UPLOAD,
    icon: ICONS.VOUCHER_UPLOAD
  },
];

const adminMenuItems: MenuItem[] = [
  {
    path: ROUTES.TRANSACTION_UPLOAD,
    label: LABELS.TRANSACTION_UPLOAD,
    icon: ICONS.TRANSACTION_UPLOAD
  },
  {
    path: ROUTES.VOUCHER_LIST,
    label: LABELS.VOUCHER_LIST,
    icon: ICONS.VOUCHER_LIST
  },
  {
    path: ROUTES.BANK_RECONCILIATION,
    label: LABELS.BANK_RECONCILIATION,
    icon: ICONS.BANK_RECONCILIATION
  },
  {
    path: ROUTES.PAYMENT_MANAGEMENT,
    label: LABELS.PAYMENT_MANAGEMENT,
    icon: ICONS.PAYMENT_MANAGEMENT
  },
  {
    path: ROUTES.USER_MANAGEMENT,
    label: LABELS.USER_MANAGEMENT,
    icon: ICONS.USER_MANAGEMENT
  },
];

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = (): void => {
    setIsOpen(!isOpen);
  };

  const closeMenu = (): void => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="fixed top-4 left-4 z-50 p-2 bg-primary bg-blue-600 rounded-lg shadow-md hover:bg-primary-light transition-colors cursor-pointer"
        aria-label="Toggle menu"
      >
        <div className="w-6 h-5 flex flex-col justify-between">
          <span
            className={`block h-0.5 w-full bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''
              }`}
          ></span>
          <span
            className={`block h-0.5 w-full bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : ''
              }`}
          ></span>
          <span
            className={`block h-0.5 w-full bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
          ></span>
        </div>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-200/90 dark:bg-gray-800/90 transition-opacity"
          onClick={closeMenu}
        ></div>
      )}

      {/* Sidebar Menu */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-200/100 dark:bg-gray-800/100 shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">El Agave</h2>
          <p className="text-sm text-foreground-secondary mb-8">Sistema de Gestión</p>

          <nav>
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={closeMenu}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                        ? 'bg-primary font-bold shadow-sm'
                        : 'text-foreground'
                        }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}

              {/* Admin Menu Items */}
              {user?.role === 'admin' && (
                <>
                  <li className="pt-2 mt-2 border-t border-base">
                    <p className="px-4 py-2 text-xs font-bold text-foreground-secondary uppercase tracking-wide">
                      Administración
                    </p>
                  </li>
                  {adminMenuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          onClick={closeMenu}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                            ? 'bg-primary font-bold shadow-sm text-gray-900'
                            : 'text-foreground'
                            }`}
                        >
                          <span className="text-xl">{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </>
              )}
            </ul>
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="border-t border-base pt-4">
              {user && (
                <>
                  <p className="text-xs text-foreground-secondary text-center mb-2">
                    {user.email}
                  </p>

                  {/* Show pending message only for tenant role without houses */}
                  {user.role === 'tenant' && (!user.houses || user.houses.length === 0) && (
                    <div className="w-full px-4 py-2 text-sm text-center bg-yellow-500/20 border border-yellow-500/50 text-yellow-600 dark:text-yellow-400 rounded-lg font-semibold mb-3">
                      ⏳ En espera de confirmación por parte de un administrador
                    </div>
                  )}

                  {/* Show logout button for all authenticated users */}
                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="w-full px-4 py-2 text-sm text-center bg-error hover:bg-error/90 text-white rounded-lg transition-colors font-semibold"
                  >
                    {LABELS.LOGOUT}
                  </button>
                </>
              )}
              {!user && (
                <>
                  <button
                    className='cursor-pointer'
                    onClick={() => {
                      navigate(ROUTES.LOGIN)
                      closeMenu()
                    }}>
                    {ICONS.LOGIN} {LABELS.LOGIN}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
