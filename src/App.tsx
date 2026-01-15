import { BrowserRouter, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from './context/AuthContext'
import { ApiStatus } from './components/ApiStatus'
import { createAppRoutes } from './router/AppRoute'
import { BaseLayout } from './layouts/BaseLayout'
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

function App(): React.ReactNode {
  window.addEventListener('error', (event: ErrorEvent): void => {
    console.error('🚨 [Global Error]:', event.error);
  });

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent): void => {
    console.error('🚨 [Unhandled Promise Rejection]:', event.reason);
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ApiStatus />
          <Routes>
            {createAppRoutes(BaseLayout)}
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
