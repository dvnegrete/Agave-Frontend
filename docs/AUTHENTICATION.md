# Authentication Guide

## Overview

The application implements a comprehensive authentication system supporting both OAuth 2.0 (social login) and traditional email/password authentication. All authenticated users are managed with role-based access control (RBAC) and per-user house assignments.

## Authentication Methods

### 1. OAuth 2.0 (Social Login)

Users can sign in using:
- **Google OAuth**
- **Facebook OAuth**

**Flow**:
1. User clicks OAuth provider button on Login page
2. Redirected to provider's authentication page
3. User authorizes the application
4. Provider redirects back to app callback URL with authorization code
5. Backend exchanges code for access/refresh tokens
6. User is redirected to dashboard

### 2. Email/Password (Manual Login)

Traditional username/password authentication.

**Flow**:
1. User enters email and password on Login page
2. Submit form to backend
3. Backend validates credentials
4. Tokens issued and stored
5. User redirected to dashboard

## Token Management

### Token Types

**Access Token**:
- Storage: httpOnly cookie (secure)
- Lifetime: Short (15 minutes)
- Auto-refresh: Yes

**Refresh Token**:
- Storage: localStorage
- Lifetime: Long (7 days)
- Usage: Generate new access tokens

## Using Authentication in Components

### Access Auth State

```typescript
import { useAuth } from '../hooks/useAuth';

function UserProfile() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Not logged in</div>;
  }

  return (
    <div>
      <h1>Hello, {user?.name}</h1>
      <p>Role: {user?.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protect Routes

```typescript
<ProtectedRoute requiredRole="admin">
  <UserManagement />
</ProtectedRoute>
```

## Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **admin** | All features, user management |
| **user** | View and manage assigned data |
| **guest** | Read-only access |

## House Assignment

Users can be assigned to one or more houses.

```typescript
const { user } = useAuth();
const assignedHouses = user?.houses;  // [1, 2, 3]
```

## Best Practices

1. Never expose tokens in code
2. Always validate auth state before rendering
3. Handle token expiration gracefully
4. Use httpOnly cookies for tokens (handled by server)

---

See [API Integration Guide](./API_INTEGRATION.md) for authentication endpoints.
See [Hooks Guide](./HOOKS.md) for useAuth hook documentation.
