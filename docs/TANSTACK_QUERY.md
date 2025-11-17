# TanStack Query Implementation Guide

## Overview

TanStack Query (React Query) is a powerful library for managing server state. It handles data fetching, caching, synchronization, and updates automatically.

## Why TanStack Query?

### Before (Manual State Management)

```typescript
function Component() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const response = await getVouchers();
        setData(response);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // No caching, no refetch, manual refresh needed
  return <div>{loading ? 'Loading...' : data.length}</div>;
}
```

### After (TanStack Query)

```typescript
function Component() {
  const { data: vouchers, isLoading, error } = useQuery({
    queryKey: ['vouchers'],
    queryFn: getVouchers
  });

  // Automatic caching, background refetch, synchronization
  return <div>{isLoading ? 'Loading...' : vouchers?.length}</div>;
}
```

### Benefits

- ✅ **No boilerplate** - 90% less code
- ✅ **Automatic caching** - Avoid redundant requests
- ✅ **Background refetch** - Keep data fresh without blocking UI
- ✅ **Automatic deduplication** - Same query = same request
- ✅ **Smart stale time** - Only fetch when necessary
- ✅ **DevTools** - Built-in debugging

## Core Concepts

### Queries (Reading Data)

**Query**: A declarative description of what data you need.

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['vouchers'],              // Cache key
  queryFn: () => getVouchers(),        // Data source
  staleTime: 5 * 60 * 1000,           // How long is cached data fresh?
});
```

**Query Lifecycle**:

```
1. Fresh         → Data is in cache and considered fresh
                 → Return cached data immediately

2. Stale         → Cache age exceeds staleTime
                 → Still return cached data, but refetch in background

3. Inactive      → Query no longer needed (component unmounted)
                 → Keep cached for gcTime (default 5 min)

4. Garbage       → Exceeds gcTime
                 → Data removed from cache
```

### Mutations (Modifying Data)

**Mutation**: An action that modifies server data.

```typescript
const mutation = useMutation({
  mutationFn: (newVoucher) => createVoucher(newVoucher),
  onSuccess: () => {
    // Update cache or refetch after success
    queryClient.invalidateQueries({ queryKey: ['vouchers'] });
  }
});

// Use mutation
const handleCreate = async () => {
  await mutation.mutateAsync({
    authorization_number: 'AUTH-123',
    amount: 1500
  });
};
```

### Query Keys

Query keys are arrays that uniquely identify queries for caching:

```typescript
// Flat keys
['vouchers']
['users']

// Hierarchical keys (recommended)
['vouchers', 'list', { filter: 'approved' }]
['vouchers', 'detail', 123]
['transactions', 'list', { reconciled: false }]

// Why hierarchical?
// - Easy to invalidate related queries
// - Clear cache structure
// - Scalable pattern
```

**Invalidation Example**:

```typescript
// Invalidate all voucher queries
queryClient.invalidateQueries({
  queryKey: ['vouchers']
});

// Invalidate only voucher lists
queryClient.invalidateQueries({
  queryKey: ['vouchers', 'list']
});

// Invalidate specific voucher detail
queryClient.invalidateQueries({
  queryKey: ['vouchers', 'detail', 123]
});
```

## Implementation in This Project

### Query Keys Pattern

```typescript
// Example: voucherKeys in useVouchersQuery.ts
export const voucherKeys = {
  all: ['vouchers'] as const,
  lists: () => [...voucherKeys.all, 'list'] as const,
  list: (filters: VoucherQuery) => [...voucherKeys.lists(), filters] as const,
  details: () => [...voucherKeys.all, 'detail'] as const,
  detail: (id: number) => [...voucherKeys.details(), id] as const,
};

// Generated keys:
voucherKeys.all              // ['vouchers']
voucherKeys.lists()          // ['vouchers', 'list']
voucherKeys.list({...})      // ['vouchers', 'list', {...}]
voucherKeys.details()        // ['vouchers', 'detail']
voucherKeys.detail(123)      // ['vouchers', 'detail', 123]
```

### Query Hook Structure

```typescript
import { useQuery } from '@tanstack/react-query';
import { getVouchers } from '../services/voucherService';
import type { Voucher, VoucherQuery } from '../types/api.types';

export const useVouchersQuery = (initialQuery?: VoucherQuery) => {
  const [query, setQuery] = useState<VoucherQuery>(initialQuery || {});

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: voucherKeys.list(query),        // Cache key
    queryFn: async ({ signal }) => {
      const response = await getVouchers(query, signal);
      // Handle both array and object responses
      return Array.isArray(response) ? response : response?.vouchers || [];
    },
    staleTime: 5 * 60 * 1000,                // 5 minutes
  });

  const vouchers = Array.isArray(data) ? data : data?.vouchers || [];
  const total = Array.isArray(data) ? data.length : data?.total || 0;

  return {
    vouchers,
    total,
    isLoading,
    isFetching,
    error: error?.message || null,
    refetch,
    setFilters: (filters: VoucherQuery) => setQuery(filters),
  };
};
```

### Mutation Hook Structure

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { startReconciliation, reconcileTransaction } from '../services/bankReconciliationService';

export const useBankReconciliationMutations = () => {
  const queryClient = useQueryClient();

  const startMutation = useMutation({
    mutationFn: (data?: StartReconciliationRequest) =>
      startReconciliation(data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['transactions-bank'] });
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
    },
  });

  const reconcileMutation = useMutation({
    mutationFn: (data: ReconcileRequest) =>
      reconcileTransaction(data),
    onSuccess: () => {
      // Same invalidation
      queryClient.invalidateQueries({ queryKey: ['transactions-bank'] });
    },
  });

  return {
    start: startMutation.mutateAsync,
    reconcile: reconcileMutation.mutateAsync,
    reconciling: startMutation.isPending || reconcileMutation.isPending,
    error: startMutation.error?.message || reconcileMutation.error?.message || null,
  };
};
```

## Using Hooks in Components

### Basic Usage

```typescript
import { useVouchersQuery } from '../hooks/useVouchersQuery';

function VoucherList() {
  const { vouchers, isLoading, error, refetch } = useVouchersQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {vouchers.map(v => (
        <div key={v.id}>{v.date} - ${v.amount}</div>
      ))}
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

### With Filters

```typescript
function FilteredVouchers() {
  const { vouchers, setFilters } = useVouchersQuery();

  const handleFilterApproved = () => {
    setFilters({ confirmation_status: true });
    // Automatically fetches new data with new cache key
  };

  return (
    <div>
      <button onClick={handleFilterApproved}>Show Approved</button>
      {vouchers.map(v => <div key={v.id}>{v.date}</div>)}
    </div>
  );
}
```

### With Mutations

```typescript
function ReconciliationForm() {
  const { vouchers } = useVouchersQuery();
  const { start, reconciling, error } = useBankReconciliationMutations();

  const handleStart = async () => {
    try {
      const result = await start({
        startDate: '2025-01-01',
        endDate: '2025-12-31'
      });
      console.log('Success!', result);
      // Cache is automatically invalidated
      // Related queries refetch automatically
    } catch (err) {
      console.error('Error:', err);
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

### Combining Multiple Hooks

```typescript
function ReconciliationPage() {
  const { vouchers, isLoading: loadingVouchers } = useVouchersQuery({
    confirmation_status: true
  });

  const { transactions, isLoading: loadingTransactions } = useTransactionsBankQuery({
    reconciled: false
  });

  const { start, reconciling } = useBankReconciliationMutations();

  const isLoading = loadingVouchers || loadingTransactions;

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Reconciliation</h2>
      <p>Vouchers: {vouchers.length}</p>
      <p>Unreconciled: {transactions.length}</p>
      <button onClick={() => start()} disabled={reconciling}>
        Start Reconciliation
      </button>
    </div>
  );
}
```

## Advanced Patterns

### Optimistic Updates

Update UI before API response for better UX:

```typescript
const mutation = useMutation({
  mutationFn: (newData) => updateVoucher(newData),

  onMutate: async (newData) => {
    // Cancel pending refetches
    await queryClient.cancelQueries({ queryKey: voucherKeys.lists() });

    // Save old data
    const oldData = queryClient.getQueryData(voucherKeys.lists());

    // Optimistically update
    queryClient.setQueryData(voucherKeys.lists(), (old) =>
      old?.map(v => v.id === newData.id ? newData : v)
    );

    return { oldData };  // Return for rollback
  },

  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(voucherKeys.lists(), context?.oldData);
  },

  onSuccess: () => {
    // Confirm with server data
    queryClient.invalidateQueries({ queryKey: voucherKeys.lists() });
  }
});
```

### Prefetching

Load data before user navigates:

```typescript
function VoucherList() {
  const queryClient = useQueryClient();

  const handleMouseEnter = (id: number) => {
    // Prefetch detail when user hovers
    queryClient.prefetchQuery({
      queryKey: voucherKeys.detail(id),
      queryFn: () => getVoucherById(id)
    });
  };

  return (
    <div
      onMouseEnter={() => handleMouseEnter(123)}
    >
      Hover me to prefetch
    </div>
  );
}
```

### Infinite Queries

For pagination/infinite scroll:

```typescript
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['vouchers'],
  queryFn: ({ pageParam }) => getVouchers({ page: pageParam }),
  initialPageParam: 1,
  getNextPageParam: (lastPage) => lastPage.nextPage,
});
```

## DevTools

### Enable Debugging

TanStack Query DevTools are already configured for development:

```typescript
// In your main app
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Using DevTools

1. Look for floating "TanStack Query" button in dev mode
2. Click to open DevTools panel
3. See all queries, their cache status, and data
4. Test mutations
5. View cache structure

**Benefits**:
- Visualize cache keys
- See staleness status
- Monitor refetch behavior
- Debug data flow
- Test mutations

## Cache Configuration

### Global Config

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 minutes
      gcTime: 10 * 60 * 1000,          // 10 minutes (formerly cacheTime)
      retry: 1,                        // Retry failed requests once
      refetchOnWindowFocus: true,      // Refetch when tab regains focus
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### Per-Query Config

```typescript
useQuery({
  queryKey: ['expensive-data'],
  queryFn: fetchExpensiveData,
  staleTime: 30 * 60 * 1000,    // 30 minutes for this query
  gcTime: 60 * 60 * 1000,       // 1 hour
});
```

## Best Practices

1. **Use the pattern** - Follow the query keys hierarchy
2. **Invalidate strategically** - Only invalidate what changed
3. **Set proper staleTime** - Balance freshness and performance
4. **Use mutations for changes** - All state changes via mutations
5. **Handle loading states** - Differentiate isLoading vs isFetching
6. **Test with DevTools** - Verify cache behavior
7. **Avoid overrides** - Let TanStack Query manage cache

## Common Mistakes

### ❌ Missing Error Handling

```typescript
// Wrong: No error handling
const { data } = useQuery({ queryKey: ['data'], queryFn: fetch });

// Correct:
const { data, error, isLoading } = useQuery({...});
if (error) return <div>Error: {error.message}</div>;
```

### ❌ Wrong Cache Keys

```typescript
// Wrong: Not hierarchical
useQuery({ queryKey: ['vouchers'] })
useQuery({ queryKey: ['vouchers', 'approved'] })

// Correct: Hierarchical
useQuery({ queryKey: voucherKeys.list({}) })
useQuery({ queryKey: voucherKeys.list({ status: 'approved' }) })
```

### ❌ Manual Refetch

```typescript
// Wrong: Manual state management
const [data, setData] = useState([]);
const refetch = () => setData(await getData());

// Correct: Let React Query handle it
const { data, refetch } = useQuery({...});
refetch();  // Only when truly needed
```

### ❌ Not Invalidating After Mutations

```typescript
// Wrong: Cache becomes stale
const createVoucher = async (data) => {
  await mutationFn(data);
  // Data isn't updated!
};

// Correct:
const mutation = useMutation({
  mutationFn: createVoucher,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: voucherKeys.lists() });
  }
});
```

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Data not updating | Cache is stale | Invalidate queries on mutation |
| Queries running repeatedly | Cache key changes | Use stable cache keys |
| Memory leak | Unused queries not cleaned | Check gcTime |
| Old data shown | Cache too long | Reduce staleTime |

---

## Resources

- [Official Docs](https://tanstack.com/query/latest)
- [API Reference](https://tanstack.com/query/latest/docs/react/reference)
- [Examples](https://tanstack.com/query/latest/docs/react/examples/basic)

---

## Summary

TanStack Query handles all the complexity of server state management:

✅ Data fetching
✅ Caching
✅ Synchronization
✅ Background updates
✅ Error handling
✅ Loading states

Let TanStack Query do its job so you can focus on UI and user experience.
