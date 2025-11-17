# API Integration Guide

## Overview

The application communicates with a REST API backend for all data operations. This document explains the integration layer and how to work with the API.

## Configuration

### Environment

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:3000
```

The API base URL defaults to `http://localhost:3000/api` (see `src/config/api.ts`).

## API Architecture

### Layers

```
Component (React)
  ↓
Hook (useVouchersQuery, etc.)
  ↓
Service (voucherService.ts)
  ↓
HTTP Client (httpClient.ts)
  ↓
API (http://localhost:3000/api)
```

### Service Layer

All API calls go through service files in `src/services/`:

```typescript
// ✅ Good: Use services
import { getVouchers } from './services/voucherService';
const vouchers = await getVouchers();

// ❌ Bad: Direct API calls
const response = await fetch('/api/vouchers');
```

**Benefits**:
- Centralized API logic
- Easy to change endpoints
- Consistent error handling
- Mock-friendly for testing

## API Endpoints

### Vouchers

#### GET /api/vouchers

Fetch all vouchers.

**Query Parameters**: None (pagination not supported)

**Response**:
```typescript
interface VouchersResponse {
  vouchers: Voucher[];
  total: number;
  page: number;
  limit: number;
}

// OR direct array
Voucher[]
```

**Example**:
```typescript
import { getVouchers } from './services/voucherService';

const response = await getVouchers();
// response.vouchers or response (array)
```

---

#### GET /api/vouchers/{id}

Fetch a single voucher with details.

**URL Parameters**:
- `id` (number): Voucher ID

**Response**:
```typescript
interface Voucher {
  id: number;
  date: string;                    // ISO date: "2025-01-15"
  authorization_number: string;    // e.g., "AUTH-123"
  confirmation_code: string;       // e.g., "CONF-456"
  amount: number;                  // e.g., 1500.50
  confirmation_status: boolean;    // true/false
  url: string;                     // PDF/file URL
  viewUrl?: string;               // Direct view URL
  number_house: number;            // Account/house number
  created_at: string;             // ISO timestamp
  updated_at: string;             // ISO timestamp
}
```

**Example**:
```typescript
import { getVoucherById } from './services/voucherService';

const voucher = await getVoucherById(123);
console.log(voucher.viewUrl);  // Use to open in new tab
```

---

#### POST /api/vouchers

Create a new voucher.

**Request Body**:
```typescript
interface CreateVoucherRequest {
  authorization_number: string;
  date: string;                // ISO date format
  confirmation_code: string;
  amount: number;
  confirmation_status: boolean;
  url: string;
}
```

**Response**:
```typescript
Voucher  // Created voucher with ID
```

**Example**:
```typescript
import { createVoucher } from './services/voucherService';

const newVoucher = await createVoucher({
  authorization_number: 'AUTH-789',
  date: '2025-01-15',
  confirmation_code: 'CONF-789',
  amount: 2500.00,
  confirmation_status: true,
  url: 'https://example.com/voucher.pdf'
});
```

---

#### PUT /api/vouchers/{id}

Update a voucher.

**URL Parameters**:
- `id` (number): Voucher ID

**Request Body**:
```typescript
interface UpdateVoucherRequest {
  authorization_number?: string;
  date?: string;
  confirmation_code?: string;
  amount?: number;
  confirmation_status?: boolean;
  url?: string;
}
```

**Response**: Updated `Voucher`

---

#### DELETE /api/vouchers/{id}

Delete a voucher.

**URL Parameters**:
- `id` (number): Voucher ID

**Response**: `{ success: boolean }`

---

### Bank Transactions

#### GET /api/transactions-bank

Fetch all bank transactions.

**Query Parameters**: None (no pagination)

**Response**:
```typescript
interface TransactionsBankResponse {
  transactions: BankTransaction[];
  total: number;
  page: number;
  limit: number;
}

// OR direct array
BankTransaction[]

interface BankTransaction {
  id: string;
  date: string;           // ISO date
  description: string;    // Transaction description
  reference: string;      // Bank reference number
  debit: number;         // Debit amount (0 if credit)
  credit: number;        // Credit amount (0 if debit)
  balance: number;       // Account balance after transaction
  reconciled: boolean;   // Is reconciled with a voucher
  voucherId?: string;    // Linked voucher ID
  createdAt: string;     // ISO timestamp
  updatedAt: string;     // ISO timestamp
}
```

**Example**:
```typescript
import { getTransactionsBank } from './services/transactionBankService';

const response = await getTransactionsBank();
const transactions = Array.isArray(response)
  ? response
  : response.transactions;
```

---

#### POST /api/transactions-bank/upload

Upload a bank statement file.

**Query Parameters**:
- `bank` (string): Bank name (required)
  - Valid values: "Santander", "BBVA-2026"

**Request**:
- Content-Type: `multipart/form-data`
- Body: File as form data

**Response**:
```typescript
interface UploadTransactionsResponse {
  message: string;                    // Success message
  success: boolean;                   // true/false
  totalTransactions: number;          // All transactions in file
  validTransactions: number;          // Valid ones
  invalidTransactions: number;        // Invalid ones
  previouslyProcessedTransactions: number; // Already in DB
  transactions: UploadedTransaction[]; // Processed transactions
  errors: any[];                      // Error details
  dateRange: {
    start: string;                    // First transaction date
    end: string;                      // Last transaction date
  };
  lastDayTransaction: UploadedTransaction[]; // Latest day's transactions
}

interface UploadedTransaction {
  date: string;           // ISO date
  time: string;          // HH:MM:SS
  concept: string;       // Transaction description
  amount: number;        // Transaction amount
  currency: string;      // "USD", "MXN", etc.
  is_deposit: boolean;   // true=deposit, false=withdrawal
  bank_name: string;     // Bank name
  validation_flag: boolean;
  status: string;        // "pending", "processed", etc.
  id: string;            // Transaction ID
  createdAt: string;     // ISO timestamp
  updatedAt: string;     // ISO timestamp
}
```

**Example**:
```typescript
import { uploadTransactionsBank } from './services/transactionBankService';

const file = document.getElementById('file').files[0];
const result = await uploadTransactionsBank(file, 'Santander');

console.log(`Valid: ${result.validTransactions}`);
console.log(`Invalid: ${result.invalidTransactions}`);
result.transactions.forEach(t => {
  console.log(`${t.date}: ${t.amount} ${t.currency}`);
});
```

---

### Bank Reconciliation

#### POST /api/bank-reconciliation/start

Start the reconciliation process.

**Request Body**:
```typescript
interface StartReconciliationRequest {
  startDate?: string;   // ISO date (optional)
  endDate?: string;     // ISO date (optional)
}
```

**Response**:
```typescript
interface StartReconciliationResponse {
  summary: ReconciliationSummary;
  conciliados: MatchedReconciliation[];      // Matched items
  unfundedVouchers: PendingVoucher[];        // Vouchers without matches
  unclaimedDeposits: SurplusTransaction[];   // Transactions without vouchers
  manualValidationRequired: ManualValidationCase[];
}

interface ReconciliationSummary {
  totalVouchers: number;
  totalTransactions: number;
  matched: number;
  pendingVouchers: number;
  surplusTransactions: number;
  manualValidationRequired: number;
}

interface MatchedReconciliation {
  transactionBankId: string;
  amount: number;
  houseNumber: number;
  matchCriteria: MatchCriteria[];
  confidenceLevel: 'high' | 'medium' | 'low' | 'manual';
  voucherId?: number;
  dateDifferenceHours?: number;
}

interface PendingVoucher {
  voucherId: number;
  amount: number;
  date: string;
  reason: string;
}

interface SurplusTransaction {
  transactionId: number;
  amount: number;
  date: string;
  reason: string;
}

interface ManualValidationCase {
  voucherId: number;
  amount: number;
  date: string;
  reason: string;
  possibleMatches: PossibleMatch[];
}
```

**Example**:
```typescript
import { startReconciliation } from './services/bankReconciliationService';

const result = await startReconciliation({
  startDate: '2025-01-01',
  endDate: '2025-12-31'
});

console.log(`Matched: ${result.summary.matched}`);
console.log(`Manual cases: ${result.manualValidationRequired.length}`);
```

---

#### POST /api/bank-reconciliation/reconcile

Reconcile a single transaction with a voucher.

**Request Body**:
```typescript
interface ReconcileRequest {
  transactionId: string;  // Transaction ID
  voucherId: string;      // Voucher ID
}
```

**Response**:
```typescript
interface ReconcileResponse {
  success: boolean;
  message: string;
  transaction: BankTransaction;  // Updated transaction
  voucher: Voucher;              // Updated voucher
}
```

**Example**:
```typescript
import { reconcileTransaction } from './services/bankReconciliationService';

const result = await reconcileTransaction({
  transactionId: 'trans-123',
  voucherId: 'vouch-456'
});

if (result.success) {
  console.log('Reconciliation saved');
}
```

---

#### POST /api/bank-reconciliation/reconcile/bulk

Reconcile multiple transactions at once.

**Request Body**:
```typescript
interface BulkReconcileRequest {
  matches: ReconciliationMatch[];
}

interface ReconciliationMatch {
  transactionId: string;
  voucherId: string;
  similarity: number;      // 0.0 to 1.0
  suggested: boolean;      // Was this system-suggested
}
```

**Response**:
```typescript
interface BulkReconcileResponse {
  success: boolean;
  message: string;
  reconciled: number;  // Successfully matched
  failed: number;      // Failed matches
  errors: string[];    // Error details
}
```

**Example**:
```typescript
import { bulkReconcile } from './services/bankReconciliationService';

const result = await bulkReconcile({
  matches: [
    {
      transactionId: 'trans-1',
      voucherId: 'vouch-1',
      similarity: 0.95,
      suggested: true
    },
    {
      transactionId: 'trans-2',
      voucherId: 'vouch-2',
      similarity: 0.88,
      suggested: true
    }
  ]
});

console.log(`Reconciled: ${result.reconciled}`);
```

---

## Data Types

### Property Name Convention

Important: The API uses **snake_case** property names:

```typescript
// ✅ Correct (matching API)
interface Voucher {
  authorization_number: string;
  confirmation_code: string;
  confirmation_status: boolean;
  created_at: string;
  updated_at: string;
}

// ❌ Wrong (don't use camelCase)
interface Voucher {
  authorizationNumber: string;      // Wrong!
  confirmationCode: string;         // Wrong!
  confirmationStatus: boolean;      // Wrong!
}
```

### Date Formats

All dates use ISO 8601 format:

```typescript
// ✅ Correct
{
  date: '2025-01-15',           // ISO date
  createdAt: '2025-01-15T14:30:00Z'  // ISO datetime
}

// ❌ Wrong
{
  date: '01/15/2025',           // Locale format
  createdAt: 1705334400000      // Timestamp
}
```

### Numeric Types

- **Amounts**: Float/Decimal (e.g., `1500.50`)
- **Counts**: Integer (e.g., `5`)
- **Percentages**: 0.0 to 1.0 (e.g., `0.95` for 95%)

## Error Handling

### Response Format

```typescript
interface ApiError {
  success: false;
  message: string;
  errors?: string[];
  statusCode?: number;
}
```

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process response |
| 400 | Bad Request | Check request format |
| 401 | Unauthorized | Authentication issue |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Retry or report |

### Error Handling in Code

```typescript
try {
  const vouchers = await getVouchers();
  // Process vouchers
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
    // Show error to user
  }
}
```

## HTTP Client

### Configuration

The HTTP client is configured in `src/utils/httpClient.ts`:

```typescript
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### Using the Client

```typescript
// GET request
const response = await httpClient.get('/vouchers');

// POST request
const response = await httpClient.post('/vouchers', {
  authorization_number: 'AUTH-123',
  amount: 1500
});

// PUT request
const response = await httpClient.put(`/vouchers/${id}`, {
  amount: 2000
});

// DELETE request
await httpClient.delete(`/vouchers/${id}`);
```

## Service Examples

### voucherService.ts

```typescript
import { httpClient } from '../utils/httpClient';
import type { Voucher, CreateVoucherRequest } from '../types/api.types';

export const getVouchers = async () => {
  const response = await httpClient.get('/vouchers');
  return response.data;
};

export const getVoucherById = async (id: number) => {
  const response = await httpClient.get(`/vouchers/${id}`);
  return response.data;
};

export const createVoucher = async (data: CreateVoucherRequest) => {
  const response = await httpClient.post('/vouchers', data);
  return response.data;
};
```

## Testing API Integration

### Check API Status

```typescript
// API Status component checks connectivity
// Green indicator = API running
// Red indicator = API down
```

### Manual Testing

```bash
# Test API with curl
curl -X GET http://localhost:3000/api/vouchers
curl -X GET http://localhost:3000/api/transactions-bank
```

### Browser DevTools

1. Open DevTools (F12)
2. Go to Network tab
3. Perform actions in app
4. See all API requests and responses

## Best Practices

1. **Always use services** - Don't call API directly
2. **Use TypeScript types** - Type all requests and responses
3. **Handle errors** - Wrap API calls in try-catch
4. **Use query hooks** - Let TanStack Query handle caching
5. **Validate data** - Check API response matches types
6. **Log for debugging** - Add console logs in services
7. **Mock for testing** - Use MSW or similar for tests

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| 404 errors | Wrong endpoint URL | Check `src/config/api.ts` |
| CORS errors | Missing CORS headers | Configure backend CORS |
| Timeout errors | API is slow or down | Check API is running |
| Type mismatch | API response format changed | Update `api.types.ts` |

---

See [Hooks Guide](./HOOKS.md) for examples of using TanStack Query with these endpoints.
