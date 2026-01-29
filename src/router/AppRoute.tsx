import { Route } from 'react-router-dom'
import {
  Home,
  Login,
  PrivacyPolicyPage,
  Signup,
  Dashboard,
  VoucherList,
  VoucherUpload,
  TransactionUpload,
  BankReconciliation,
  PaymentManagement,
  HistoricalRecordsUpload,
  UserManagement,
  EmailConfirmation,
  EmailVerification,
  VerifyEmailPending,
} from '@pages/index'
import { ProtectedRoute } from '@components/index'
import { ROUTES } from '@/shared'
import type { BaseLayoutProps } from '@/shared'

export const createAppRoutes = (Layout: (props: BaseLayoutProps) => React.ReactNode) => (
  <>
    {/* Public routes */}
    <Route path="/" element={<Layout><Home /></Layout>} />
    <Route path={ROUTES.LOGIN} element={<Layout><Login /></Layout>} />
    <Route path={ROUTES.PRIVACY_POLICY} element={<Layout><PrivacyPolicyPage /></Layout>} />
    <Route path={ROUTES.SIGNUP} element={<Layout><Signup /></Layout>} />
    <Route path={ROUTES.EMAIL_CONFIRMATION} element={<EmailConfirmation />} />
    <Route path={ROUTES.EMAIL_VERIFICATION} element={<EmailVerification />} />
    <Route path={ROUTES.VERIFY_EMAIL_PENDING} element={<Layout><VerifyEmailPending /></Layout>} />
    <Route path={ROUTES.VOUCHER_UPLOAD} element={<Layout><VoucherUpload /></Layout>}
    />

    {/* Protected routes */}
    <Route
      path={ROUTES.DASHBOARD}
      element={
        <ProtectedRoute>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path={ROUTES.VOUCHER_LIST}
      element={
        <ProtectedRoute>
          <Layout><VoucherList /></Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path={ROUTES.TRANSACTION_UPLOAD}
      element={
        <ProtectedRoute>
          <Layout><TransactionUpload /></Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path={ROUTES.BANK_RECONCILIATION}
      element={
        <ProtectedRoute>
          <Layout><BankReconciliation /></Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path={ROUTES.PAYMENT_MANAGEMENT}
      element={
        <ProtectedRoute>
          <Layout><PaymentManagement /></Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path={ROUTES.HISTORICAL_RECORDS_UPLOAD}
      element={
        <ProtectedRoute>
          <Layout><HistoricalRecordsUpload /></Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path={ROUTES.USER_MANAGEMENT}
      element={
        <ProtectedRoute>
          <Layout><UserManagement /></Layout>
        </ProtectedRoute>
      }
    />
  </>
)
