# Project Architecture

## Overview

This is a modern React 19 application using TypeScript, TanStack Query for server state management, and Tailwind CSS for styling. The architecture follows best practices for scalability and maintainability.

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.1 | UI framework |
| TypeScript | 5.5.3 | Type safety and developer experience |
| Vite | 5.4.0 | Build tool and dev server |
| TanStack Query | v5 | Server state management |
| Axios | 1.7.2 | HTTP client |
| Tailwind CSS | 3.4.1 | Utility-first CSS framework |

## Folder Structure

```
src/
├── components/          # React components (UI)
│   ├── BankReconciliation.tsx      # Main reconciliation interface
│   ├── VoucherList.tsx             # Voucher display and management
│   ├── TransactionUpload.tsx        # File upload and results
│   ├── ApiStatus.tsx               # API connectivity indicator
│   └── StartReconciliationModal.tsx # Modal for starting reconciliation
│
├── hooks/              # Custom React hooks
│   ├── useVouchersQuery.ts         # TanStack Query hook for vouchers
│   ├── useTransactionsBankQuery.ts # TanStack Query for transactions
│   ├── useBankReconciliationQuery.ts # TanStack Query for reconciliation
│   ├── useFormatDate.ts            # Date formatting utility
│   ├── useTransactionsBank.ts      # Legacy hook (maintained)
│   └── useBankReconciliation.ts    # Legacy hook (maintained)
│
├── services/           # API service layer
│   ├── voucherService.ts           # Voucher operations
│   ├── transactionBankService.ts   # Transaction operations
│   ├── bankReconciliationService.ts # Reconciliation operations
│   └── index.ts                    # Centralized exports
│
├── types/              # TypeScript type definitions
│   └── api.types.ts                # All API request/response types
│
├── config/             # Configuration
│   └── api.ts                      # API endpoints
│
├── utils/              # Utility functions
│   └── httpClient.ts               # Axios HTTP client
│
└── App.tsx            # Root component
```

## Design Patterns

### 1. Service Layer Pattern

All API communication goes through the `services/` folder:

```typescript
// ✅ Good: Use services
import { getVouchers } from './services/voucherService';

// ❌ Avoid: Direct API calls
const response = await fetch('/api/vouchers');
```

**Benefits:**
- Centralized API logic
- Easy to mock for testing
- Consistent error handling

### 2. Custom Hooks Pattern

TanStack Query hooks encapsulate data fetching logic:

```typescript
// Hook handles: fetching, caching, loading, error states
const { vouchers, isLoading, error } = useVouchersQuery();
```

**Benefits:**
- Reusable across components
- Automatic caching
- Simplified component logic

### 3. Type Safety with TypeScript

All data is strongly typed:

```typescript
import type { Voucher, CreateVoucherRequest } from './types/api.types';

const voucher: Voucher = {
  id: 1,
  date: '2025-01-01',
  amount: 100.50,
  // ... other required properties
};
```

## Data Flow

### Query Flow (Reading Data)

```
Component
  ↓
useVouchersQuery Hook (TanStack Query)
  ↓
Query Key → Cache Check
  ├─ Cached & Fresh? → Return cached data
  └─ Stale/Missing? → Call Query Function
  ↓
voucherService.getVouchers()
  ↓
httpClient.get('/vouchers')
  ↓
API Response
  ↓
Update Cache + State
  ↓
Component Re-renders
```

### Mutation Flow (Modifying Data)

```
User Action (click button)
  ↓
Component calls Mutation (e.g., reconcile())
  ↓
useMutation in Hook
  ├─ Call API endpoint
  ├─ On Success:
  │  ├─ Invalidate related queries
  │  ├─ Trigger automatic refetch
  │  └─ Update local cache
  └─ On Error:
     └─ Return error to component
  ↓
Component receives result
  ↓
Update UI accordingly
```

## Key Concepts

### Snake_case Convention

The API returns properties in snake_case (PostgreSQL convention):
- `authorization_number`
- `confirmation_code`
- `is_deposit`
- `bank_name`
- `created_at`

**Never rename these properties!** They must match the API exactly.

### Query Keys Pattern

TanStack Query uses a hierarchical query key pattern:

```typescript
export const voucherKeys = {
  all: ['vouchers'] as const,
  lists: () => [...voucherKeys.all, 'list'] as const,
  list: (filters) => [...voucherKeys.lists(), filters] as const,
  details: () => [...voucherKeys.all, 'detail'] as const,
  detail: (id) => [...voucherKeys.details(), id] as const,
};

// Usage:
queryKey: voucherKeys.list({ page: 1, limit: 10 })
// → ['vouchers', 'list', { page: 1, limit: 10 }]
```

**Benefits:**
- Predictable cache invalidation
- Easy to invalidate related queries
- Clear cache structure

### Automatic Cache Invalidation

After mutations, related queries are automatically invalidated and refetched:

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({
    queryKey: voucherKeys.lists()
  });
  // All voucher list queries will be refetched
}
```

## State Management

### Server State (TanStack Query)
- API data (vouchers, transactions)
- Caching and synchronization
- Background updates

### Client State (React useState)
- UI state (open modals, expanded rows)
- Form inputs
- Tab selections

**Example:**

```typescript
export function BankReconciliation() {
  // Server state - managed by TanStack Query
  const { transactions } = useTransactionsBankQuery();

  // Client state - managed by React
  const [activeTab, setActiveTab] = useState<'summary' | 'conciliados'>();

  return (
    <div>
      {/* Tab selection is client state */}
      <div onClick={() => setActiveTab('conciliados')}>Conciliados</div>

      {/* Transactions are server state */}
      {transactions.map(t => <div key={t.id}>{t.date}</div>)}
    </div>
  );
}
```

## API Integration Details

### Base URL
```env
VITE_API_BASE_URL=http://localhost:3000
```

### Endpoints

| Resource | Method | Endpoint |
|----------|--------|----------|
| Vouchers | GET | `/api/vouchers` |
| Vouchers | POST | `/api/vouchers` |
| Voucher | GET | `/api/vouchers/{id}` |
| Voucher | PUT | `/api/vouchers/{id}` |
| Voucher | DELETE | `/api/vouchers/{id}` |
| Transactions | GET | `/api/transactions-bank` |
| Transactions | POST | `/api/transactions-bank/upload?bank={bank}` |
| Reconciliation | POST | `/api/bank-reconciliation/start` |
| Reconciliation | POST | `/api/bank-reconciliation/reconcile` |

### No Pagination

The API does not support pagination (`page` and `limit` parameters). All endpoints return complete datasets.

## Performance Optimizations

### 1. Query Caching

Queries are cached for 5 minutes by default:

```typescript
staleTime: 5 * 60 * 1000
```

### 2. Request Deduplication

If the same query is requested multiple times within staleTime, the cached result is returned without making new API calls.

### 3. Background Refetching

When a query becomes stale, it's refetched in the background without blocking the UI.

### 4. Automatic Cleanup

Unused queries are garbage collected after 5 minutes.

## Component Communication

### Props Down, Events Up

```typescript
// Parent passes data and callbacks via props
<VoucherList
  vouchers={vouchers}
  onDelete={handleDelete}
/>

// Child sends events up
const handleDelete = (id: number) => {
  // Parent handles the action
}
```

### Using Context (When Needed)

For deeply nested components, context avoids prop drilling:

```typescript
const VoucherContext = createContext<VoucherContextType | null>(null);

// Provider wraps tree
<VoucherContext.Provider value={{ ... }}>
  <App />
</VoucherContext.Provider>

// Deep component uses hook
const { vouchers } = useContext(VoucherContext);
```

## Error Handling

### API Errors

```typescript
try {
  const vouchers = await getVouchers();
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
  }
}
```

### Component Error Boundaries

Wrap main components with error boundaries for production:

```typescript
<ErrorBoundary fallback={<div>Error loading</div>}>
  <BankReconciliation />
</ErrorBoundary>
```

## Testing Considerations

### Unit Testing
- Test services with mocked HTTP client
- Test hooks with mock query client
- Test components with mocked hooks

### Integration Testing
- Use msw (Mock Service Worker) for API mocking
- Test complete user flows
- Verify cache invalidation

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Data not updating | Query cache is stale | Manually call `refetch()` or wait for automatic refresh |
| Infinite loading | API endpoint unreachable | Check API is running, verify `.env` |
| TypeScript errors | Type mismatch | Check `api.types.ts` matches API response |
| 404 errors | Wrong endpoint path | Review `config/api.ts` |

## Best Practices

1. **Always use the service layer** - Don't make direct fetch calls
2. **Use TypeScript types** - Never use `any`
3. **Follow snake_case for API props** - Match the database convention
4. **Use Query Keys pattern** - For consistent cache management
5. **Avoid useEffect for fetching** - Let TanStack Query handle it
6. **Keep components focused** - One responsibility per component
7. **Use custom hooks for logic** - Keep components thin and testable

## Future Improvements

- [ ] Add error boundaries for production
- [ ] Implement pagination if API supports it
- [ ] Add prefetching for better UX
- [ ] Implement optimistic updates
- [ ] Add unit and integration tests
- [ ] Add performance monitoring
