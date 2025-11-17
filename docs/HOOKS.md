# Custom Hooks Guide

## Overview

Custom hooks encapsulate React logic for data fetching, state management, and side effects. This application uses TanStack Query for server state management via custom hooks.

## TanStack Query Hooks

### useVouchersQuery

**Location**: `src/hooks/useVouchersQuery.ts`

**Purpose**: Fetch and manage voucher data with caching and automatic updates.

**Parameters**:
```typescript
interface VoucherQuery {
  confirmation_status?: boolean;
  startDate?: string;
  endDate?: string;
}
```

**Returns**:
```typescript
{
  vouchers: Voucher[];        // Array of vouchers
  total: number;              // Total count
  isLoading: boolean;         // Initial loading state
  isFetching: boolean;        // Background refetch state
  error: string | null;       // Error message if failed
  refetch: () => void;        // Manual refetch function
  setFilters: (filters) => void; // Update filters
}
```

**Usage**:
```typescript
import { useVouchersQuery } from '../hooks/useVouchersQuery';

function VoucherComponent() {
  const { vouchers, isLoading, error, refetch } = useVouchersQuery({
    confirmation_status: true
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {vouchers.map(v => (
        <div key={v.id}>{v.date} - ${v.amount}</div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

**Features**:
- ✅ Automatic caching (5 minute staleTime)
- ✅ Flexible filter support
- ✅ Handles both array and object API responses
- ✅ Separate loading and fetching states
- ✅ Manual refetch capability

---

### useTransactionsBankQuery

**Location**: `src/hooks/useTransactionsBankQuery.ts`

**Purpose**: Fetch and manage bank transaction data.

**Parameters**:
```typescript
interface TransactionsBankQuery {
  reconciled?: boolean;
  startDate?: string;
  endDate?: string;
}
```

**Returns**:
```typescript
{
  transactions: BankTransaction[];
  total: number;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  refetch: () => void;
  setFilters: (filters) => void;
}
```

**Usage**:
```typescript
import { useTransactionsBankQuery } from '../hooks/useTransactionsBankQuery';

function TransactionsComponent() {
  const {
    transactions,
    isLoading,
    refetch
  } = useTransactionsBankQuery({
    reconciled: false
  });

  return (
    <table>
      <tbody>
        {transactions.map(t => (
          <tr key={t.id}>
            <td>{t.date}</td>
            <td>${t.debit || t.credit}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**Features**:
- ✅ Filter by reconciliation status
- ✅ Date range filtering
- ✅ Automatic cache management
- ✅ Background refetching

---

### useBankReconciliationMutations

**Location**: `src/hooks/useBankReconciliationQuery.ts`

**Purpose**: Handle reconciliation operations (start, reconcile, bulk, undo).

**Returns**:
```typescript
{
  start: (data?: StartReconciliationRequest) => Promise<StartReconciliationResponse>;
  reconcile: (data: ReconcileRequest) => Promise<ReconcileResponse>;
  reconcileBulk: (data: BulkReconcileRequest) => Promise<BulkReconcileResponse>;
  undo: (transactionId: string) => Promise<void>;
  reconciling: boolean;       // Any mutation in progress
  error: string | null;       // Last error message
}
```

**Usage**:
```typescript
import { useBankReconciliationMutations } from '../hooks/useBankReconciliationQuery';

function ReconciliationComponent() {
  const {
    start,
    reconcile,
    reconcileBulk,
    undo,
    reconciling,
    error
  } = useBankReconciliationMutations();

  const handleStart = async () => {
    const result = await start({
      startDate: '2025-01-01',
      endDate: '2025-12-31'
    });

    if (result) {
      console.log('Reconciliation started');
      // React Query automatically invalidates related queries
    }
  };

  return (
    <div>
      <button onClick={handleStart} disabled={reconciling}>
        {reconciling ? 'Processing...' : 'Start'}
      </button>
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
}
```

**Features**:
- ✅ Automatic cache invalidation on success
- ✅ Unified loading state
- ✅ Consolidated error handling
- ✅ Multiple operation support

**Automatic Cache Invalidation**:

After any mutation succeeds, these queries are automatically invalidated:
- `['transactions-bank']` - All transaction queries refetch
- `['vouchers']` - All voucher queries refetch

This ensures UI always shows latest data without manual refetch calls.

---

### useTransactionBankMutations

**Location**: `src/hooks/useTransactionsBankQuery.ts`

**Purpose**: Handle transaction file uploads and deletions.

**Returns**:
```typescript
{
  upload: (file: File, bank: string) => Promise<UploadTransactionsResponse>;
  deleteTransaction: (id: string) => Promise<void>;
  uploading: boolean;
  deleteLoading: boolean;
  error: string | null;
}
```

**Usage**:
```typescript
import { useTransactionBankMutations } from '../hooks/useTransactionsBankQuery';

function UploadComponent() {
  const { upload, uploading, error } = useTransactionBankMutations();

  const handleUpload = async (file: File) => {
    try {
      const result = await upload(file, 'Santander');
      console.log(`Uploaded: ${result.totalTransactions} transactions`);
      // Queries are automatically invalidated
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        disabled={uploading}
      />
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
}
```

**Parameters for upload**:
- `file: File` - The file to upload
- `bank: string` - Bank name (sent as query parameter)

**Features**:
- ✅ FormData handling for file uploads
- ✅ Bank parameter in query string
- ✅ Automatic cache invalidation
- ✅ Detailed response with transaction data

---

## Utility Hooks

### useFormatDate

**Location**: `src/hooks/useFormatDate.ts`

**Purpose**: Format dates for display.

**Usage**:
```typescript
import { useFormatDate } from '../hooks/useFormatDate';

function DateDisplay() {
  const formatted = useFormatDate('2025-01-15');
  return <div>{formatted}</div>; // Output: 15 de Enero de 2025
}
```

---

## Query Keys Pattern

TanStack Query uses hierarchical query keys for cache management:

```typescript
// Definition in hook
export const voucherKeys = {
  all: ['vouchers'] as const,
  lists: () => [...voucherKeys.all, 'list'] as const,
  list: (filters) => [...voucherKeys.lists(), filters] as const,
  details: () => [...voucherKeys.all, 'detail'] as const,
  detail: (id) => [...voucherKeys.details(), id] as const,
};

// Generated cache keys:
// voucherKeys.all           → ['vouchers']
// voucherKeys.lists()       → ['vouchers', 'list']
// voucherKeys.list({...})   → ['vouchers', 'list', {...}]
// voucherKeys.detail(1)     → ['vouchers', 'detail', 1]

// Invalidation examples:
queryClient.invalidateQueries({
  queryKey: voucherKeys.all  // Invalidates ALL voucher queries
});

queryClient.invalidateQueries({
  queryKey: voucherKeys.lists()  // Invalidates only list queries
});
```

---

## State Management Comparison

### Before (Without Hooks)

```typescript
function Component() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getVouchers();
        setVouchers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  // Manual refetch
  const refetch = async () => {
    // ... repeat fetch logic
  };

  return <div>{/* render */}</div>;
}
```

### After (With Hooks)

```typescript
function Component() {
  const { vouchers, isLoading, error, refetch } = useVouchersQuery();

  return <div>{/* render */}</div>;
}
```

**Benefits**:
- ✅ 90% less boilerplate
- ✅ Automatic caching
- ✅ Automatic refetching
- ✅ Built-in deduplication
- ✅ Error handling included

---

## Common Patterns

### Fetching with Filters

```typescript
const { vouchers, setFilters } = useVouchersQuery({
  confirmation_status: true
});

// Update filters
const handleFilterChange = (newFilters) => {
  setFilters(newFilters);
  // Automatically fetches new data
};
```

### Manual Refetch

```typescript
const { refetch } = useVouchersQuery();

const handleAction = async () => {
  // ... perform action
  await refetch();  // Manually refetch data
};
```

### Handling Loading States

```typescript
const { isLoading, isFetching } = useVouchersQuery();

// isLoading: Initial load
// isFetching: Background refetch

return (
  <div>
    {isLoading && <div>Initial loading...</div>}
    {isFetching && !isLoading && <div>Updating...</div>}
    {/* content */}
  </div>
);
```

### Combining Multiple Hooks

```typescript
function ReconciliationPage() {
  const { vouchers } = useVouchersQuery({ confirmation_status: true });
  const { transactions } = useTransactionsBankQuery({ reconciled: false });
  const { start } = useBankReconciliationMutations();

  return (
    <div>
      <div>Vouchers: {vouchers.length}</div>
      <div>Unreconciled: {transactions.length}</div>
      <button onClick={() => start()}>Reconcile</button>
    </div>
  );
}
```

---

## Advanced: Mutation with Optimistic Updates

For better UX, update UI before API response:

```typescript
const reconcileMutation = useMutation({
  mutationFn: (data) => reconcileTransaction(data),
  onMutate: async (newData) => {
    // Cancel ongoing queries
    await queryClient.cancelQueries({
      queryKey: transactionBankKeys.lists()
    });

    // Get previous data
    const previous = queryClient.getQueryData(
      transactionBankKeys.lists()
    );

    // Optimistically update
    queryClient.setQueryData(
      transactionBankKeys.lists(),
      (old) => old.map(t =>
        t.id === newData.transactionId
          ? { ...t, reconciled: true }
          : t
      )
    );

    return { previous };
  },
  onError: (err, variables, context) => {
    // Revert on error
    queryClient.setQueryData(
      transactionBankKeys.lists(),
      context?.previous
    );
  },
  onSuccess: () => {
    // Confirm with server data
    queryClient.invalidateQueries({
      queryKey: transactionBankKeys.lists()
    });
  }
});
```

---

## Best Practices

1. **Always use custom hooks** - Don't write direct useEffect + fetch
2. **Let TanStack Query handle caching** - Trust the automatic cache management
3. **Use setFilters for dynamic queries** - Don't manually recreate queries
4. **Leverage automatic invalidation** - Don't manually refetch unless needed
5. **Handle loading states** - Show feedback to users
6. **Handle error states** - Display error messages
7. **Use TypeScript** - Type all hook parameters and returns

---

## Troubleshooting

### Data not updating after mutation?

Make sure the mutation's `onSuccess` invalidates the correct query keys:

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({
    queryKey: ['vouchers'] // Must match your actual key
  });
}
```

### Queries running too frequently?

Adjust the `staleTime`:

```typescript
useQuery({
  queryKey: ['vouchers'],
  queryFn: getVouchers,
  staleTime: 10 * 60 * 1000  // 10 minutes instead of 5
})
```

### "Query key must be an array"?

Query keys must always be arrays:

```typescript
// ✅ Correct
queryKey: ['vouchers', { filter: 'active' }]

// ❌ Wrong
queryKey: 'vouchers'
```

---

For more information on TanStack Query, visit: https://tanstack.com/query/latest
