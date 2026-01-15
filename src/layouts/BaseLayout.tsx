import { HamburgerMenu, Footer } from '@components/index'
import type { BaseLayoutProps } from '@/shared';

export function BaseLayout({ children, showMenu = true }: BaseLayoutProps): React.ReactNode {
  const imgAlt = "El Agave logo";

  return (
    <div className="min-h-screen flex flex-col">
      {showMenu && <HamburgerMenu />}
      <div className='text-center'>
        <div className="flex flex-col justify-center items-center md:flex-row md:justify-evenly p-8 bg-base">
          <h1 className='mt-6 text-3xl font-bold md:text-4xl md:order-1'>
            <a href="/" className='flex items-center'>
              <span>Condominio El Agave</span>
              <img
                className="md:mt-0 mx-2"
                src="/logo_el_agave.png"
                alt={imgAlt}
                width={60}
                height={60}
              />
            </a>
          </h1>
          <img
            className="rounded-full mt-3 md:mt-0"
            src="/el-agave-1.png"
            alt={imgAlt}
            width={250}
            height={250}
          />
        </div>
      </div>
      {children}
      <Footer />
    </div>
  );
}
