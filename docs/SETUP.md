# Development Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Backend API running on `http://localhost:3000`

## Installation

1. **Clone the repository** (if you haven't already)
   ```bash
   git clone <repository-url>
   cd agave-front
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure API endpoint**
   Edit `.env` and ensure:
   ```
   VITE_API_BASE_URL=http://localhost:3000
   ```

## Running the Project

### Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

Features:
- Hot Module Replacement (HMR) - changes reflect instantly
- Open the DevTools (F12) to see React Query DevTools and console logs

### Building for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Type Checking

```bash
npm run type-check
```

## First Run Checklist

- [ ] Backend API is running on `http://localhost:3000`
- [ ] `.env` file is configured with correct API URL
- [ ] Dependencies are installed (`npm install`)
- [ ] Development server is running (`npm run dev`)
- [ ] Browser shows `http://localhost:5173`
- [ ] API Status indicator (bottom-right) shows green "API: Conectada"

## Project Structure

```
agave-front/
├── @docs/                    # Documentation (this folder)
├── src/
│   ├── components/           # React components
│   │   ├── BankReconciliation.tsx
│   │   ├── VoucherList.tsx
│   │   ├── TransactionUpload.tsx
│   │   ├── ApiStatus.tsx
│   │   └── StartReconciliationModal.tsx
│   ├── hooks/               # Custom hooks
│   │   ├── useVouchersQuery.ts
│   │   ├── useTransactionsBankQuery.ts
│   │   ├── useBankReconciliationQuery.ts
│   │   └── useFormatDate.ts
│   ├── services/            # API services
│   │   ├── voucherService.ts
│   │   ├── transactionBankService.ts
│   │   ├── bankReconciliationService.ts
│   │   └── index.ts
│   ├── types/              # TypeScript types
│   │   └── api.types.ts
│   ├── config/             # Configuration
│   │   └── api.ts
│   ├── utils/              # Utilities
│   │   └── httpClient.ts
│   └── App.tsx
├── public/                 # Static assets
├── .env.example           # Environment example
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Project dependencies
```

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run type-check` | Check TypeScript types |
| `npm install` | Install dependencies |

## Troubleshooting

### "API: Desconectada" (Red indicator)

1. Verify backend is running: `http://localhost:3000`
2. Check `.env` has correct `VITE_API_BASE_URL`
3. Restart dev server: `Ctrl+C` then `npm run dev`

### Module not found errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port 5173 already in use

```bash
# The dev server will prompt to use a different port
# Or manually stop the process using port 5173
```

### TypeScript errors

```bash
# Check for type issues
npm run type-check

# View errors in detail
npm run build
```

## Environment Variables

Create `.env` file with:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000

# Optional: Add other environment-specific variables
# VITE_APP_NAME=Agave Frontend
```

## Next Steps

After setup is complete:

1. Explore [Architecture](./ARCHITECTURE.md) to understand the project structure
2. Read [Components](./COMPONENTS.md) to see what's available
3. Check [API Integration](./API_INTEGRATION.md) to understand data flow
4. Review [TanStack Query](./TANSTACK_QUERY.md) for state management patterns

## Getting Help

- Check the [Architecture](./ARCHITECTURE.md) guide for project overview
- Review [Troubleshooting](./ARCHITECTURE.md#troubleshooting) section
- Check component-specific documentation in [Components](./COMPONENTS.md)
- Review API details in [API Integration](./API_INTEGRATION.md)
