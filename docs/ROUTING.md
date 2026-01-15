# Routing Guide

## Overview

The application uses React Router v7 for client-side routing with protected routes for authenticated pages. All route paths are centralized in constants to ensure consistency.

## Route Configuration

### Route Constants

All routes are defined in `src/shared/constants/routes.ts`:

```typescript
const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  VOUCHER_UPLOAD: '/subir-comprobante',
  VOUCHER_LIST: '/comprobantes',
  TRANSACTION_UPLOAD: '/transacciones',
  BANK_RECONCILIATION: '/conciliacion-bancaria',
  PAYMENT_MANAGEMENT: '/administracion-de-pagos',
  HISTORICAL_RECORDS_UPLOAD: '/carga-de-registros-historicos',
  USER_MANAGEMENT: '/administracion-de-usuarios',
};

export default ROUTES;
```

### Using Route Constants

**In navigation**:
```typescript
import ROUTES from '../shared/constants/routes';
import { Link } from 'react-router-dom';

<Link to={ROUTES.BANK_RECONCILIATION}>
  Conciliación Bancaria
</Link>
```

**In route definitions**:
```typescript
<Route path={ROUTES.LOGIN} element={<Login />} />
<Route path={ROUTES.HOME} element={<Home />} />
```

**In navigation programmatically**:
```typescript
const navigate = useNavigate();
navigate(ROUTES.DASHBOARD);
```

## Application Routes

### Public Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/login` | Login | Authentication (OAuth + email/password) |

### Protected Routes

All protected routes require authentication via `ProtectedRoute` wrapper.

**Regular User Routes**:
| Path | Component | Description |
|------|-----------|-------------|
| `/` | Home | Dashboard/home page |
| `/comprobantes` | VoucherList | View all vouchers |
| `/subir-comprobante` | VoucherUpload | Upload new vouchers |
| `/transacciones` | TransactionUpload | Upload bank transactions |
| `/conciliacion-bancaria` | BankReconciliation | Bank reconciliation interface |
| `/administracion-de-pagos` | PaymentManagement | Payment history by house |

**Admin-Only Routes**:
| Path | Component | Description |
|------|-----------|-------------|
| `/administracion-de-usuarios` | UserManagement | User management (admin only) |
| `/carga-de-registros-historicos` | HistoricalRecordsUpload | Historical data import (admin only) |

## Route Structure

### App Router Setup

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ROUTES from './shared/constants/routes';
import { Login } from './components/Login';
import { Home } from './components/Home';
import { ProtectedRoute } from './components/ProtectedRoute';
import { BankReconciliation } from './components/BankReconciliation';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path={ROUTES.LOGIN} element={<Login />} />

        {/* Protected routes */}
        <Route
          path={ROUTES.HOME}
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.BANK_RECONCILIATION}
          element={
            <ProtectedRoute>
              <BankReconciliation />
            </ProtectedRoute>
          }
        />

        {/* Admin-only routes */}
        <Route
          path={ROUTES.USER_MANAGEMENT}
          element={
            <ProtectedRoute requiredRole="admin">
              <UserManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

### Protected Route Component

```typescript
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import ROUTES from '../shared/constants/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user' | 'guest';
}

export function ProtectedRoute({ 
  children, 
  requiredRole 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
}
```

### BaseLayout Component

Protected routes are wrapped in `BaseLayout` for consistent header/footer:

```typescript
export function BaseLayout({ children }: BaseLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <HamburgerMenu />
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
      <Footer />
      <ApiStatus />
    </div>
  );
}
```

## Navigation

### Using the Navigation Hook

```typescript
import { useNavigate } from 'react-router-dom';
import ROUTES from '../shared/constants/routes';

function MyComponent() {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate(ROUTES.HOME);
  };

  const handleGoBack = () => {
    navigate(-1);  // Go back one page
  };

  return (
    <div>
      <button onClick={handleGoToDashboard}>
        Go to Home
      </button>
      <button onClick={handleGoBack}>
        Go Back
      </button>
    </div>
  );
}
```

### Using Link Component

```typescript
import { Link } from 'react-router-dom';
import ROUTES from '../shared/constants/routes';

export function Navigation() {
  return (
    <nav>
      <Link to={ROUTES.HOME}>Home</Link>
      <Link to={ROUTES.BANK_RECONCILIATION}>Reconciliation</Link>
      <Link to={ROUTES.USER_MANAGEMENT}>Users</Link>
    </nav>
  );
}
```

## OAuth Callback Route

OAuth providers redirect to:
`/oauth/callback?code=AUTH_CODE&state=STATE`

This is handled automatically by the authentication flow without explicit route definition.

## Route Parameters

Currently no routes use dynamic parameters. Routes are static strings.

**Future expansion** (if needed):
```typescript
// Example for house-specific payments:
const ROUTES = {
  PAYMENT_MANAGEMENT: '/administracion-de-pagos',
  PAYMENT_MANAGEMENT_HOUSE: '/administracion-de-pagos/:houseId',
};

// Usage:
<Route 
  path={ROUTES.PAYMENT_MANAGEMENT_HOUSE} 
  element={<PaymentDetail />} 
/>

// Access in component:
const { houseId } = useParams<{ houseId: string }>();
```

## Query Parameters

Route filtering/pagination can use query parameters:

```typescript
import { useSearchParams } from 'react-router-dom';

function VoucherList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status');
  const page = searchParams.get('page');

  // Update query params
  const handleFilterChange = (newStatus: string) => {
    setSearchParams({ status: newStatus, page: '1' });
  };

  return <div>{/* ... */}</div>;
}
```

## Best Practices

### 1. Always Use Route Constants

```typescript
// Good
import ROUTES from '../shared/constants/routes';
navigate(ROUTES.HOME);

// Avoid
navigate('/');
```

### 2. Wrap Protected Routes Properly

```typescript
// Good
<ProtectedRoute requiredRole="admin">
  <UserManagement />
</ProtectedRoute>

// Avoid
{isAdmin && <UserManagement />}
```

### 3. Use useNavigate for Programmatic Navigation

```typescript
// Good
const navigate = useNavigate();
navigate(ROUTES.HOME);

// Avoid with direct imports
window.location.href = '/home';
```

### 4. Load BaseLayout for Protected Pages

```typescript
// All protected pages should use BaseLayout
<ProtectedRoute>
  <BaseLayout>
    <BankReconciliation />
  </BaseLayout>
</ProtectedRoute>
```

## Route Transitions

To show loading state during route transitions:

```typescript
import { useNavigation } from 'react-router-dom';

function App() {
  const { state } = useNavigation();
  
  return (
    <div>
      {state === 'loading' && <LoadingBar />}
      <Routes>
        {/* ... */}
      </Routes>
    </div>
  );
}
```

---

See [Components Guide](./COMPONENTS.md) for component documentation.
See [Authentication Guide](./AUTHENTICATION.md) for auth flow details.
