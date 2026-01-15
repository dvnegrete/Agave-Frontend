# Agave Frontend Documentation

Welcome to the Agave Frontend documentation. This guide will help you understand the project structure, architecture, and key concepts.

## Quick Navigation

- **[Getting Started](./SETUP.md)** - Development environment setup and how to run the project
- **[Architecture](./ARCHITECTURE.md)** - Project structure, key technologies, and design patterns
- **[API Integration](./API_INTEGRATION.md)** - REST API endpoints, request/response formats, and integration details
- **[Components](./COMPONENTS.md)** - Overview of React components and their responsibilities
- **[Hooks](./HOOKS.md)** - Custom hooks and TanStack Query patterns
- **[TanStack Query](./TANSTACK_QUERY.md)** - Server state management implementation
- **[Authentication](./AUTHENTICATION.md)** - OAuth and session management
- **[Routing](./ROUTING.md)** - React Router configuration and protected routes

## Project Overview

This is a React 19 + TypeScript + Vite frontend application for the Agave Bank Reconciliation system. The application provides comprehensive tools for managing vouchers, bank transactions, automated/manual bank reconciliation, and user administration.

### Key Features

- **Authentication & Authorization**:
  - OAuth 2.0 integration (Google, Facebook)
  - Email/password authentication
  - Role-based access control (Admin, User, Guest)
  - Protected routes with session management
  - JWT with httpOnly cookies for security

- **Voucher Management**:
  - Create, view, approve, and delete financial vouchers
  - Upload vouchers with file attachments
  - Expandable details view
  - Confirmation status tracking

- **Bank Transaction Management**:
  - Import bank statements in CSV/Excel format
  - Multi-bank support with custom parsers
  - Transaction validation and deduplication
  - Upload history tracking

- **Bank Reconciliation**:
  - Automated matching of vouchers with bank transactions
  - Multi-confidence level system (high, medium, low, manual)
  - Manual reconciliation workflow
  - Bulk reconciliation operations
  - Undo reconciliation capability

- **Payment Management**:
  - View payment history organized by house
  - Combined bank transactions and unreconciled vouchers
  - Payment statistics and summaries
  - House-specific payment tracking

- **Unclaimed Deposits Management**:
  - View surplus transactions without matching vouchers
  - Assign transactions to houses with modal workflow
  - Track reconciliation status

- **User Management** (Admin only):
  - Create, edit, and manage user accounts
  - Role assignment (Admin, User, Guest)
  - User status management (Active, Inactive)
  - User-house association management

- **Historical Records**:
  - Upload historical transaction records
  - Bulk import with validation
  - Import status tracking

- **Advanced UI**:
  - Flexible expandable table component with multiple layout modes
  - Reusable UI components (Button, StatusBadge, StatsCard, Tabs, DateTimeCell)
  - Responsive interface with tabbed sections
  - Real-time API status indicator
  - Statistics cards and summary views
  - Loading and error states
  - Dark mode support (planned)

### Tech Stack

- **React 19.1.1** - UI framework with latest features
- **TypeScript 5.9.3** - Type safety with strict mode
- **Vite 7.1.7** - Build tool and dev server
- **TanStack Query v5** - Server state management and caching
- **React Router v7.9.4** - Client-side routing with nested routes
- **Tailwind CSS 4.1.14** - Utility-first CSS framework
- **Vitest 2.1.9** - Unit and integration testing
- **MSW 2.12.7** - API mocking for tests
- **Testing Library** - Component testing utilities

## Development Workflow

1. Ensure the backend API is running on `http://localhost:3000`
2. Run `npm install` to install dependencies
3. Create `.env` file with `VITE_API_BASE_URL=http://localhost:3000`
4. Run `npm run dev` to start the development server
5. Open `http://localhost:5173` in your browser
6. Login with valid credentials or OAuth provider

## File Structure

```
src/
├── components/          # Business logic components
│   ├── Login.tsx
│   ├── Home.tsx
│   ├── VoucherList.tsx
│   ├── VoucherUpload.tsx
│   ├── TransactionUpload.tsx
│   ├── BankReconciliation.tsx
│   ├── PaymentManagement.tsx
│   ├── UnclaimedDepositsSection.tsx
│   ├── UserManagement.tsx
│   ├── HistoricalRecordsUpload.tsx
│   ├── Modal components (ModalAssignHouse, etc.)
│   └── index.ts
│
├── shared/              # Shared resources across the app
│   ├── types/          # TypeScript type definitions
│   │   ├── auth.types.ts
│   │   ├── vouchers.types.ts
│   │   ├── bank-transactions.types.ts
│   │   ├── bank-reconciliation.types.ts
│   │   ├── payment-management.types.ts
│   │   ├── user-management.types.ts
│   │   ├── unclaimed-deposits.types.ts
│   │   ├── historical-records.types.ts
│   │   └── common.types.ts
│   │
│   ├── ui/             # Reusable UI components
│   │   ├── ExpandableTable.tsx
│   │   ├── Table.tsx
│   │   ├── Button.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── RoleBadge.tsx
│   │   ├── StatsCard.tsx
│   │   ├── Tabs.tsx
│   │   ├── DateTimeCell.tsx
│   │   ├── FileUploadZone.tsx
│   │   ├── BankSelector.tsx
│   │   └── index.ts
│   │
│   └── constants/      # Application constants
│       ├── routes.ts
│       ├── labels.ts
│       ├── icons.ts
│       └── index.ts
│
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   ├── useVouchersQuery.ts
│   ├── useVouchers.ts
│   ├── useTransactionsBankQuery.ts
│   ├── useTransactionsBank.ts
│   ├── useBankReconciliationQuery.ts
│   ├── useBankReconciliation.ts
│   ├── usePaymentManagement.ts
│   ├── useUserManagement.ts
│   ├── useHistoricalRecords.ts
│   ├── useFormatDate.ts
│   └── useSortBy.ts
│
├── services/           # API service layer
│   ├── authService.ts
│   ├── voucherService.ts
│   ├── voucherUploadService.ts
│   ├── transactionBankService.ts
│   ├── bankReconciliationService.ts
│   ├── paymentManagementService.ts
│   ├── unclaimedDepositsService.ts
│   ├── userManagementService.ts
│   ├── historicalRecordsService.ts
│   └── index.ts
│
├── context/            # React Context providers
│   ├── AuthContext.tsx
│   └── AuthContextStore.ts
│
├── router/             # Routing configuration
│   └── AppRoute.tsx
│
├── layouts/            # Layout components
│   └── BaseLayout.tsx
│
├── pages/              # Page-level components
│   └── AuthCallback.tsx
│
├── config/             # Configuration files
│   └── api.ts
│
├── utils/              # Utility functions
│   ├── httpClient.ts
│   └── tokenManager.ts
│
├── assets/             # Static assets
├── index.css           # Global styles with Tailwind
├── App.tsx             # Root component
└── main.tsx            # Application entry point
```

## Database Property Conventions

Important: The API uses **snake_case** property names (PostgreSQL convention):
- `authorization_number` (not authorizationNumber)
- `confirmation_code` (not confirmationCode)
- `confirmation_status` (not confirmationStatus)
- `is_deposit` (not isDeposit)
- `bank_name` (not bankName)
- `created_at` (not createdAt)

**Never rename these properties!** They must match the API exactly.

## Architecture Principles

1. **Separation of Concerns**: Business logic in components, data fetching in hooks, API calls in services
2. **Type Safety**: Strict TypeScript configuration with no implicit any
3. **Reusability**: Shared UI components and utilities in `shared/` folder
4. **Consistency**: Snake_case for API data, camelCase for internal React state
5. **Security**: httpOnly cookies for tokens, CSRF protection, role-based access control
6. **Performance**: TanStack Query for caching, lazy loading, code splitting
7. **Testing**: Unit tests for services, integration tests for user flows

## Next Steps

Start with [Getting Started](./SETUP.md) to set up your development environment, then explore the other documentation files based on your needs.

---

For questions or issues, check the troubleshooting sections in the relevant documentation files.
