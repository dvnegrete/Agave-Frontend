import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Home from './components/Home'
import Login from './components/Login'
import Footer from './components/Footer'
import { HamburgerMenu } from './components/HamburgerMenu'
import { VoucherList } from './components/VoucherList'
import { VoucherUpload } from './components/VoucherUpload'
import { TransactionUpload } from './components/TransactionUpload'
import { BankReconciliation } from './components/BankReconciliation'
import { PaymentManagement } from './components/PaymentManagement'
import { HistoricalRecordsUpload } from './components/HistoricalRecordsUpload'
import { ApiStatus } from './components/ApiStatus'
import AuthCallback from './pages/AuthCallback'
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
        <div className="flex flex-col justify-center items-center md:flex-row md:justify-evenly p-8 bg-base">
          <h1 className='mt-6 text-3xl font-bold text-base md:text-4xl md:order-1'>
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
  // Capturar errores globales
  window.addEventListener('error', (event) => {
    console.error('🚨 [Global Error]:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 [Unhandled Promise Rejection]:', event.reason);
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ApiStatus />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Layout showMenu={true}><Home /></Layout>} />
            <Route path="/login" element={<Layout><Login /></Layout>} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected routes */}
            <Route
              path="/subir-comprobante"
              element={
                <ProtectedRoute>
                  <Layout showMenu={true}><VoucherUpload /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/vouchers"
              element={
                <ProtectedRoute>
                  <Layout showMenu={true}><VoucherList /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Layout showMenu={true}><TransactionUpload /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reconciliation"
              element={
                <ProtectedRoute>
                  <Layout showMenu={true}><BankReconciliation /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-management"
              element={
                <ProtectedRoute>
                  <Layout showMenu={true}><PaymentManagement /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/historical-records-upload"
              element={
                <ProtectedRoute>
                  <Layout showMenu={true}><HistoricalRecordsUpload /></Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
