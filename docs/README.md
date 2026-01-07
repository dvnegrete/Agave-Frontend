# Agave Frontend Documentation

Welcome to the Agave Frontend documentation. This guide will help you understand the project structure, architecture, and key concepts.

## Quick Navigation

- **[Getting Started](./SETUP.md)** - Development environment setup and how to run the project
- **[Architecture](./ARCHITECTURE.md)** - Project structure, key technologies, and design patterns
- **[API Integration](./API_INTEGRATION.md)** - REST API endpoints, request/response formats, and integration details
- **[Components](./COMPONENTS.md)** - Overview of React components and their responsibilities
- **[Hooks](./HOOKS.md)** - Custom hooks and TanStack Query patterns
- **[TanStack Query](./TANSTACK_QUERY.md)** - Server state management implementation

## Project Overview

This is a React 19 + TypeScript + Vite frontend application for the Agave Bank Reconciliation system. The application provides comprehensive tools for managing vouchers, bank transactions, and automated/manual bank reconciliation.

### Key Features

- **Voucher Management**: Create, view, approve, and delete financial vouchers with expandable details
- **Payment Management**: View payment history organized by house with combined bank transactions and unreconciled vouchers
- **Bank Transaction Upload**: Import bank statements in CSV/Excel format with validation
- **Bank Reconciliation**: Automated and manual matching of vouchers with bank transactions
- **Unclaimed Deposits Management**: Assign surplus transactions to houses with modal workflow
- **Advanced UI**:
  - Flexible expandable table component supporting multiple layout modes
  - Reusable UI components (Button, StatusBadge, StatsCard, Tabs, DateTimeCell)
  - Responsive interface with tabbed sections
  - Real-time API status indicator
  - Statistics cards and summary views

### Tech Stack

- **React 19.1.1** - UI framework
- **TypeScript** - Type safety
- **TanStack Query v5** - Server state management
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

## Development Workflow

1. Ensure the backend API is running on `http://localhost:3000`
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Open `http://localhost:5173` in your browser

## File Structure

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── services/           # API service layer
├── types/              # TypeScript interfaces
├── config/             # Configuration files
└── utils/              # Utility functions
```

## Database Property Conventions

Important: The API uses **snake_case** property names (PostgreSQL convention):
- `authorization_number` (not authorizationNumber)
- `confirmation_code` (not confirmationCode)
- `confirmation_status` (not confirmationStatus)
- `is_deposit` (not isDeposit)
- `bank_name` (not bankName)
- `created_at` (not createdAt)

## Next Steps

Start with [Getting Started](./SETUP.md) to set up your development environment, then explore the other documentation files based on your needs.

---

For questions or issues, check the troubleshooting sections in the relevant documentation files.
