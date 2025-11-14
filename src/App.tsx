import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Home from './components/Home'
import Login from './components/Login'
import Footer from './components/Footer'
import { HamburgerMenu } from './components/HamburgerMenu'
import { VoucherList } from './components/VoucherList'
import { TransactionUpload } from './components/TransactionUpload'
import { BankReconciliation } from './components/BankReconciliation'
import { ApiStatus } from './components/ApiStatus'
import './App.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
})

const imgAlt = "El Agave logo";

function Layout({ children, showMenu = false }: { children: React.ReactNode; showMenu?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col">
      {showMenu && <HamburgerMenu />}
      <div className='text-center'>
        <div className="flex flex-col justify-center items-center md:flex-row md:justify-evenly p-8">
          <h1 className='mt-6 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white md:order-1'>
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ApiStatus />
        <Routes>
          <Route path="/" element={<Layout showMenu={true}><Home /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/vouchers" element={<Layout showMenu={true}><VoucherList /></Layout>} />
          <Route path="/transactions" element={<Layout showMenu={true}><TransactionUpload /></Layout>} />
          <Route path="/reconciliation" element={<Layout showMenu={true}><BankReconciliation /></Layout>} />
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
