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
  upload: (file: File, bankName: string) => Promise<UploadTransactionsResponse>;
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
      const result = await upload(file, 'Santander-2025');
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
- `bankName: string` - Bank name (sent as query parameter)

**Features**:
- ✅ FormData handling for file uploads
- ✅ Bank parameter in query string
- ✅ Automatic cache invalidation
- ✅ Detailed response with transaction data

---

### useVoucherMutations

**Location**: `src/hooks/useVouchersQuery.ts`

**Purpose**: Handle voucher mutations (create, update, delete operations).

**Returns**:
```typescript
{
  create: (data: CreateVoucherRequest) => Promise<Voucher>;
  update: (id: string, data: UpdateVoucherRequest) => Promise<Voucher>;
  remove: (id: string) => Promise<void>;
  isLoading: boolean;  // Any mutation in progress
  error: string | null;
}
```

**Usage**:
```typescript
import { useVoucherMutations } from '../hooks/useVouchersQuery';

function VoucherActions() {
  const { create, update, remove, isLoading } = useVoucherMutations();

  const handleCreate = async () => {
    try {
      const newVoucher = await create({
        authorization_number: 'AUTH-123',
        date: new Date().toISOString(),
        confirmation_code: 'CONF-123',
        amount: 1000,
        confirmation_status: false,
        url: ''
      });
      console.log('Created:', newVoucher);
    } catch (err) {
      console.error('Error creating voucher:', err);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await update(id, { confirmation_status: true });
    } catch (err) {
      console.error('Error updating voucher:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
    } catch (err) {
      console.error('Error deleting voucher:', err);
    }
  };

  return (
    <div>
      <button onClick={handleCreate} disabled={isLoading}>Create</button>
      <button onClick={() => handleUpdate('1')} disabled={isLoading}>Update</button>
      <button onClick={() => handleDelete('1')} disabled={isLoading}>Delete</button>
    </div>
  );
}
```

**Features**:
- ✅ Type-safe mutations
- ✅ Automatic cache invalidation after success
- ✅ Unified loading state
- ✅ Error handling

---

### usePaymentHistoryQuery

**Location**: `src/hooks/usePaymentHistoryQuery.ts` (or similar)

**Purpose**: Fetch payment history and transactions for a specific house.

**Parameters**:
```typescript
interface PaymentHistoryQueryParams {
  houseId?: number;  // House ID to fetch payments for
  year?: number;
  month?: number;
}
```

**Returns**:
```typescript
{
  paymentHistory: HousePayments | null;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  refetch: () => void;
}
```

**Data Structure**:
```typescript
interface HousePayments {
  house_id: number;
  house_number: number;
  total_transactions: number;
  total_amount: number;
  confirmed_transactions: number;
  pending_transactions: number;
  transactions: HousePaymentTransaction[];        // Bank transactions
  unreconciled_vouchers?: {                        // Unreconciled vouchers
    total_count: number;
    vouchers: UnreconciledVoucher[];
  };
}

interface HousePaymentTransaction {
  date: string;              // ISO datetime
  time: string;              // HH:MM:SS
  concept: string;           // Transaction description
  amount: number;
  currency: string;          // "USD", etc
  bank_name: string;
  confirmation_status: boolean;
}

interface UnreconciledVoucher {
  date: string;
  amount: number;
  confirmation_status: boolean;
  created_at: string;
  confirmation_code: string;  // Code for voucher identification
}
```

**Usage**:
```typescript
import { usePaymentHistoryQuery } from '../hooks/usePaymentHistoryQuery';

function PaymentDetail() {
  const { paymentHistory, isLoading, error } = usePaymentHistoryQuery({
    houseId: 123
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Casa {paymentHistory?.house_number}</h2>
      <p>Total: ${paymentHistory?.total_amount}</p>
      <p>Transacciones: {paymentHistory?.total_transactions}</p>
      <p>Confirmadas: {paymentHistory?.confirmed_transactions}</p>
    </div>
  );
}
```

**Features**:
- ✅ Combined bank transactions and vouchers data
- ✅ Separated transaction and voucher arrays
- ✅ Confirmation codes included for vouchers
- ✅ Date and time formatting info

---

## Authentication Hooks

### useAuth

**Location**: `src/hooks/useAuth.ts`

**Purpose**: Access authentication state and methods globally.

**Returns**:
```typescript
{
  user: AuthUser | null;              // Current authenticated user
  isAuthenticated: boolean;           // Is user logged in
  isLoading: boolean;                 // Auth check in progress
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;        // Sign out user
  signInWithOAuth: (provider: 'google' | 'facebook') => void;  // OAuth login
  refreshToken: () => Promise<void>;  // Refresh access token
  error: string | null;               // Last auth error
}
```

**Data Structure**:
```typescript
interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
  houses?: number[];        // Assigned house numbers
  avatar?: string;          // User avatar URL
  createdAt: string;        // Account creation date
}
```

**Usage**:
```typescript
import { useAuth } from '../hooks/useAuth';

function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Not logged in</div>;
  }

  return (
    <div>
      <span>Welcome, {user?.name}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

**Features**:
- ✅ OAuth 2.0 integration (Google, Facebook)
- ✅ Email/password authentication
- ✅ Automatic token refresh
- ✅ Role-based access control
- ✅ Persistent login across sessions
- ✅ Error handling

**Token Management**:
- Access token: Stored in httpOnly cookie (secure)
- Refresh token: Stored in localStorage
- Automatic refresh when token expires
- Logout clears all tokens

---

## User Management Hooks

### useUserManagement

**Location**: `src/hooks/useUserManagement.ts`

**Purpose**: Handle user creation, updating, and deletion operations.

**Returns**:
```typescript
{
  users: User[];                      // List of all users
  isLoading: boolean;                 // Data loading state
  isCreating: boolean;                // Create operation in progress
  isUpdating: boolean;                // Update operation in progress
  isDeleting: boolean;                // Delete operation in progress
  error: string | null;               // Last error message

  createUser: (data: CreateUserRequest) => Promise<User>;
  updateUser: (id: string, data: UpdateUserRequest) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  fetchUsers: () => Promise<void>;    // Manual refetch
}
```

**Data Structures**:
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
  houses: number[];                   // Assigned house IDs
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'user' | 'guest';
  houseIds?: number[];
}

interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'admin' | 'user' | 'guest';
  houseIds?: number[];
  status?: 'active' | 'inactive';
}
```

**Usage**:
```typescript
import { useUserManagement } from '../hooks/useUserManagement';

function UserManagement() {
  const {
    users,
    isLoading,
    createUser,
    updateUser,
    deleteUser,
    error
  } = useUserManagement();

  const handleCreate = async () => {
    try {
      await createUser({
        email: 'user@example.com',
        name: 'John Doe',
        password: 'secure-password',
        role: 'user',
        houseIds: [1, 2, 3]
      });
      console.log('User created');
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleUpdate = async (userId: string) => {
    try {
      await updateUser(userId, {
        role: 'admin',
        houseIds: [1, 2, 3, 4]
      });
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Delete user?')) {
      try {
        await deleteUser(userId);
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <button onClick={handleCreate}>Add User</button>
      <table>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => handleUpdate(u.id)}>Edit</button>
                <button onClick={() => handleDelete(u.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Features**:
- ✅ CRUD operations for users
- ✅ Role assignment
- ✅ House assignment (multi-select)
- ✅ Status management
- ✅ Separate loading states
- ✅ Error handling with messages
- ✅ Automatic cache invalidation after mutations

---

## Historical Records Hooks

### useHistoricalRecords

**Location**: `src/hooks/useHistoricalRecords.ts`

**Purpose**: Handle historical record uploads and management.

**Returns**:
```typescript
{
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;

  uploadHistoricalRecords: (file: File) => Promise<UploadHistoricalResponse>;
  getUploadHistory: () => Promise<HistoricalUpload[]>;
}
```

**Data Structures**:
```typescript
interface UploadHistoricalResponse {
  success: boolean;
  message: string;
  totalRecords: number;
  importedRecords: number;
  failedRecords: number;
  errors: {
    rowNumber: number;
    error: string;
  }[];
  dateRange: {
    start: string;
    end: string;
  };
}

interface HistoricalUpload {
  id: string;
  fileName: string;
  uploadedAt: string;
  totalRecords: number;
  successCount: number;
  failureCount: number;
  uploadedBy: string;  // User ID
}
```

**Usage**:
```typescript
import { useHistoricalRecords } from '../hooks/useHistoricalRecords';

function HistoricalUpload() {
  const { uploadHistoricalRecords, isUploading, error } = useHistoricalRecords();

  const handleUpload = async (file: File) => {
    try {
      const result = await uploadHistoricalRecords(file);
      console.log(`Imported ${result.importedRecords} records`);
      if (result.failedRecords > 0) {
        console.warn(`${result.failedRecords} records failed`);
        result.errors.forEach(e => {
          console.error(`Row ${e.rowNumber}: ${e.error}`);
        });
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        disabled={isUploading}
      />
      {error && <div className="text-red-600">{error}</div>}
      {isUploading && <div>Uploading...</div>}
    </div>
  );
}
```

**Features**:
- ✅ File upload with validation
- ✅ Batch processing
- ✅ Error reporting per record
- ✅ Upload history tracking
- ✅ Progress feedback

---

## Utility Hooks

### useFormatDate

**Location**: `src/hooks/useFormatDate.ts`

**Purpose**: Format dates for display in Spanish locale.

**Usage**:
```typescript
import { useFormatDate } from '../hooks/useFormatDate';

function DateDisplay() {
  const formatted = useFormatDate('2025-01-15');
  return <div>{formatted}</div>; // Output: 15 de Enero de 2025
}
```

---

### useSortBy

**Location**: `src/hooks/useSortBy.ts`

**Purpose**: Sort array data by a field with ascending/descending options.

**Parameters**:
```typescript
interface UseSortByOptions {
  initialField?: string;      // Field to sort by initially
  initialOrder?: 'asc' | 'desc';  // Initial sort direction
}
```

**Returns**:
```typescript
{
  sortedItems: T[];           // Sorted array
  sortBy: (field: string) => void;  // Change sort field
  toggleOrder: () => void;    // Toggle asc/desc
  currentSort: {
    field: string;
    order: 'asc' | 'desc';
  };
}
```

**Usage**:
```typescript
import { useSortBy } from '../hooks/useSortBy';

function VoucherList({ vouchers }) {
  const { sortedItems, sortBy, currentSort } = useSortBy(vouchers, {
    initialField: 'date',
    initialOrder: 'desc'
  });

  return (
    <div>
      <button onClick={() => sortBy('number_house')}>Sort by House</button>
      <button onClick={() => sortBy('date')}>Sort by Date</button>
      <p>Currently sorting by: {currentSort.field} ({currentSort.order})</p>

      {sortedItems.map(item => (
        <div key={item.id}>{item.date}</div>
      ))}
    </div>
  );
}
```

**Features**:
- ✅ Flexible sorting by any field
- ✅ Toggle between ascending/descending
- ✅ Track current sort state
- ✅ Works with any data type

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
