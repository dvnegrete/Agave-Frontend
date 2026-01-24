# Project Architecture

## Overview

This is a modern React 19 application using TypeScript, TanStack Query for server state management, and Tailwind CSS for styling. The architecture follows best practices for scalability and maintainability.

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.1 | UI framework with latest features |
| TypeScript | 5.9.3 | Type safety with strict mode |
| Vite | 7.1.7 | Build tool and dev server |
| TanStack Query | v5.90.8 | Server state management and caching |
| React Router | 7.9.4 | Client-side routing |
| Tailwind CSS | 4.1.14 | Utility-first CSS framework |
| Vitest | 2.1.9 | Unit and integration testing |
| MSW | 2.12.7 | API mocking for tests |
| Testing Library | 16.3.1 | Component testing utilities |

## Folder Structure

```
src/
├── components/          # Business logic components
│   ├── Login.tsx                    # Authentication page
│   ├── Home.tsx                     # Landing page
│   ├── VoucherList.tsx              # Voucher display with expandable table
│   ├── VoucherUpload.tsx            # Upload vouchers with files
│   ├── TransactionUpload.tsx        # Bank statement upload
│   ├── BankReconciliation.tsx       # Main reconciliation interface
│   ├── PaymentManagement.tsx        # Payment history by house
│   ├── UnclaimedDepositsSection.tsx # Surplus transactions management
│   ├── UserManagement.tsx           # User administration (Admin only)
│   ├── HistoricalRecordsUpload.tsx  # Historical data import
│   ├── ProtectedRoute.tsx           # Route guard component
│   ├── ApiStatus.tsx                # API connectivity indicator
│   ├── HamburgerMenu.tsx            # Mobile navigation menu
│   ├── Footer.tsx                   # Page footer
│   ├── Modal components:
│   │   ├── Modal.tsx                # Generic modal wrapper
│   │   ├── StartReconciliationModal.tsx
│   │   ├── ModalAssignHouse.tsx
│   │   ├── ModalEditUserRole.tsx
│   │   ├── ModalEditUserStatus.tsx
│   │   └── ModalRemoveHouse.tsx
│   └── index.ts                     # Component exports
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
│   │   ├── voucher-upload.types.ts
│   │   ├── historical-records.types.ts
│   │   ├── common.types.ts
│   │   └── index.ts
│   │
│   ├── ui/             # Reusable UI components
│   │   ├── ExpandableTable.tsx      # Flexible expandable table
│   │   ├── Table.tsx                # Standard table component
│   │   ├── Button.tsx               # Reusable button component
│   │   ├── StatusBadge.tsx          # Status indicator badges
│   │   ├── RoleBadge.tsx            # User role badges
│   │   ├── StatsCard.tsx            # Statistics display card
│   │   ├── Tabs.tsx                 # Tab navigation component
│   │   ├── ReconciliationCard.tsx   # Reconciliation status card
│   │   ├── DateTimeCell.tsx         # Formatted date/time cell
│   │   ├── FileUploadZone.tsx       # Drag-and-drop file upload
│   │   ├── BankSelector.tsx         # Bank selection component
│   │   └── index.ts
│   │
│   └── constants/      # Application constants
│       ├── routes.ts   # Route path constants
│       ├── labels.ts   # UI label constants
│       ├── icons.ts    # Icon/emoji constants
│       └── index.ts
│
├── hooks/              # Custom React hooks
│   ├── useAuth.ts                   # Authentication hook
│   ├── useVouchersQuery.ts          # TanStack Query hook for vouchers
│   ├── useVouchers.ts               # Voucher operations hook
│   ├── useTransactionsBankQuery.ts  # TanStack Query for transactions
│   ├── useTransactionsBank.ts       # Transaction operations hook
│   ├── useBankReconciliationQuery.ts # TanStack Query for reconciliation
│   ├── useBankReconciliation.ts     # Reconciliation operations hook
│   ├── usePaymentManagement.ts      # Payment management hook
│   ├── useUserManagement.ts         # User management hook
│   ├── useHistoricalRecords.ts      # Historical records hook
│   ├── useFormatDate.ts             # Date formatting utility
│   └── useSortBy.ts                 # Sorting utility hook
│
├── services/           # API service layer
│   ├── authService.ts               # Authentication operations
│   ├── voucherService.ts            # Voucher operations
│   ├── voucherUploadService.ts      # Voucher upload operations
│   ├── transactionBankService.ts    # Transaction operations
│   ├── bankReconciliationService.ts # Reconciliation operations
│   ├── paymentManagementService.ts  # Payment management operations
│   ├── unclaimedDepositsService.ts  # Unclaimed deposits operations
│   ├── userManagementService.ts     # User management operations
│   ├── historicalRecordsService.ts  # Historical records operations
│   └── index.ts                     # Centralized exports
│
├── context/            # React Context providers
│   ├── AuthContext.tsx              # Auth state provider
│   └── AuthContextStore.ts          # Auth context store
│
├── router/             # Routing configuration
│   └── AppRoute.tsx                 # Route definitions
│
├── layouts/            # Layout components
│   └── BaseLayout.tsx               # Main layout wrapper
│
├── pages/              # Page-level components
│   └── AuthCallback.tsx             # OAuth callback handler
│
├── config/             # Configuration files
│   └── api.ts                       # API base URL and config
│
├── utils/              # Utility functions
│   ├── httpClient.ts                # Fetch-based HTTP client
│   └── tokenManager.ts              # Token storage manager
│
├── assets/             # Static assets
├── index.css           # Global styles with Tailwind
├── App.css             # App-specific styles
├── App.tsx             # Root component
└── main.tsx            # Application entry point
```

## Design Patterns

### 1. Flexible Table Component Pattern

The **ExpandableTable** component supports three different expansion modes to handle various UI requirements without duplication:

**Mode 1: Custom Content** (for VoucherList)
- Use `expandedContent` prop to render completely custom JSX
- Useful when expanded row needs buttons, cards, or complex layout
- Example: Voucher details with action buttons

**Mode 2: Table Layout** (for PaymentManagement)
- Use `expandableColumns` + `expandedRowLayout='table'`
- Renders additional columns as table cells in expanded row
- Minimal vertical space, aligned with main columns
- Example: Payment movement with concept, bank, status columns

**Mode 3: Grid Layout** (default fallback)
- Use `expandableColumns` + `expandedRowLayout='grid'` (optional)
- Renders additional columns as card grid in expanded row
- Great for many expandable columns or responsive design
- Example: Future use case with 4+ expandable columns

This approach prevents duplication between VoucherList and PaymentManagement while keeping both components simple and focused.

### 2. Service Layer Pattern

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

### 3. Custom Hooks Pattern

TanStack Query hooks encapsulate data fetching logic:

```typescript
// Hook handles: fetching, caching, loading, error states
const { vouchers, isLoading, error } = useVouchersQuery();
```

**Benefits:**
- Reusable across components
- Automatic caching
- Simplified component logic

### 4. Type Safety with TypeScript

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

## HTTP Client

The application uses a custom **fetch-based HTTP client** with automatic token refresh, cookie authentication, and error handling.

**Location**: `src/utils/httpClient.ts`

**Key Features**:
- httpOnly cookie authentication (access tokens never exposed to JavaScript)
- Automatic token refresh on 401 errors
- Request retry with max limit to prevent infinite loops
- Subscriber pattern to prevent duplicate refresh requests
- CORS support with credentials
- TypeScript type safety

**Methods**:
```typescript
httpClient.get<T>(endpoint: string, options?: HttpClientOptions): Promise<T>
httpClient.post<T>(endpoint: string, body?: Record<string, unknown> | FormData, options?: HttpClientOptions): Promise<T>
httpClient.put<T>(endpoint: string, body?: Record<string, unknown> | FormData, options?: HttpClientOptions): Promise<T>
httpClient.patch<T>(endpoint: string, body?: Record<string, unknown> | FormData, options?: HttpClientOptions): Promise<T>
httpClient.delete<T>(endpoint: string, options?: HttpClientOptions): Promise<T>
```

**Usage**:
```typescript
// GET request
const vouchers = await httpClient.get<Voucher[]>('/vouchers');

// POST request with JSON body
const newVoucher = await httpClient.post<Voucher>('/vouchers', {
  authorization_number: 'AUTH-123',
  amount: 1500
});

// POST request with FormData (file upload)
const formData = new FormData();
formData.append('file', file);
const result = await httpClient.post<UploadResult>('/transactions-bank/upload?bank=Santander', formData);

// Request with abort signal
const controller = new AbortController();
const data = await httpClient.get('/vouchers', { signal: controller.signal });
```

**Token Refresh Flow**:
1. Request receives 401 Unauthorized
2. httpClient checks retry count (max 3)
3. If not auth endpoint, triggers token refresh
4. Calls `/auth/refresh` with refreshToken from localStorage
5. Backend validates refreshToken and sets new access_token cookie
6. Original request is retried automatically
7. If refresh fails, clears tokens and redirects to /login

**Security**:
- Access tokens stored in httpOnly cookies (XSS protection)
- Refresh tokens stored in localStorage (acceptable for UX)
- CSRF protection via state parameter in OAuth
- Automatic logout on token refresh failure

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
