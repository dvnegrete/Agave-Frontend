# Components Guide

## Overview

This document describes the main React components in the application and their responsibilities.

## Component Hierarchy

```
App
├── Navigation/Menu
├── BankReconciliation
│   ├── StartReconciliationModal
│   ├── Tab: Summary
│   ├── Tab: Conciliados
│   ├── Tab: Unfunded Vouchers
│   ├── Tab: Unclaimed Deposits
│   └── Tab: Manual Validation
├── VoucherList
│   └── Expandable Rows with Details
├── TransactionUpload
│   ├── File Input
│   └── Result Display
└── ApiStatus
```

## Main Components

### BankReconciliation.tsx

**Location**: `src/components/BankReconciliation.tsx`

**Purpose**: Main component for bank reconciliation functionality with tabbed interface.

**Props**: None (uses custom hooks)

**Features**:
- Tabbed interface (Summary, Conciliados, Unfunded, Unclaimed, Manual)
- Reconciliation result display
- Manual and bulk reconciliation buttons
- Detailed logging for debugging

**Tabs**:

1. **Summary** - Statistical overview of reconciliation results
   - Total vouchers
   - Total transactions
   - Matched items count
   - Pending/Surplus/Manual items counts

2. **Conciliados** - Successfully matched vouchers and transactions
   - Shows: Casa, Monto, Confianza (confidence level)
   - Color-coded confidence: High (green), Medium (yellow), Low (orange), Manual (blue)
   - Undo button for reversing reconciliation

3. **Comprobantes NO Conciliados** - Vouchers without matching transactions
   - Shows: Monto, Fecha, Reason for non-match

4. **Depósitos NO Asociados** - Transactions without matching vouchers
   - Shows: Monto, Fecha, Reason

5. **Validación Manual** - Cases requiring manual review
   - Shows: Voucher details, possible matches
   - Reconcile button to manually match

**Key Functions**:
- `handleStartReconciliation()` - Initiates reconciliation process
- `handleReconcile()` - Single transaction/voucher reconciliation
- `handleBulkReconcile()` - Multiple reconciliations at once
- `handleUndo()` - Reverse a reconciliation

**State Management**: Uses TanStack Query hooks

---

### VoucherList.tsx

**Location**: `src/components/VoucherList.tsx`

**Purpose**: Display and manage vouchers with expandable details.

**Props**: None (uses custom hooks)

**Features**:
- Expandable rows for detailed voucher information
- "Ver detalles" button - Shows full voucher details
- "Ver comprobante" button - Fetches and opens voucher PDF/file
- Approve and Delete buttons (in expanded view)
- Real-time data updates via TanStack Query

**Display Columns** (collapsed):
- Fecha (Date)
- Monto (Amount)
- Estado (Status)

**Details Shown** (when expanded):
- Authorization Number
- Confirmation Code
- Full details
- Action buttons (Approve, Delete, View)

**Key Functions**:
- `handleViewVoucher()` - Fetches voucher detail and opens viewUrl in new tab
- `handleExpand()` - Toggles row expansion
- `handleApprove()` - Updates voucher status
- `handleDelete()` - Removes voucher

**State Management**: Uses `useVouchersQuery` hook

---

### TransactionUpload.tsx

**Location**: `src/components/TransactionUpload.tsx`

**Purpose**: Handle bank transaction file uploads and display results.

**Props**: None (uses custom hooks)

**Features**:
- Bank selection via radio buttons (Santander, BBVA-2026)
- CSV/Excel file upload
- Comprehensive result display with statistics
- Transaction tables with details
- Error display
- Last-day transactions view

**Upload Section**:
- Bank selector (default: Santander)
- File input (accepts .csv, .xlsx, .xls)
- Upload button with loading state

**Result Display** (shows after successful upload):
- Success message
- Summary statistics:
  - Total Transacciones
  - Válidas (Valid)
  - Inválidas (Invalid)
  - Previamente Procesadas (Already processed)
- Date range of uploaded transactions
- Transaction table with columns:
  - Fecha (Date)
  - Hora (Time)
  - Concepto (Description)
  - Monto (Amount)
  - Tipo (Type: Depósito/Retiro)
  - Estado (Status)
- Last-day transactions table (if any)
- Errors list (if any)

**Key Functions**:
- `handleFileChange()` - Updates selected file
- `handleUpload()` - Sends file to API with bank parameter
- Result rendering based on API response

**State Management**: Uses `useTransactionBankMutations` hook

---

### StartReconciliationModal.tsx

**Location**: `src/components/StartReconciliationModal.tsx`

**Purpose**: Modal dialog for initiating reconciliation with optional date filters.

**Props**:
```typescript
interface StartReconciliationModalProps {
  isOpen: boolean;                    // Modal visibility
  onClose: () => void;                // Close handler
  onStart: (data: StartReconciliationRequest) => Promise<StartReconciliationResult>;
  isProcessing: boolean;              // Loading state
}
```

**Features**:
- Date range selection (optional)
- Start and Cancel buttons
- Loading state feedback
- Detailed console logging

**Input Fields**:
- Start Date (optional)
- End Date (optional)

**Key Functions**:
- `handleStart()` - Sends reconciliation request with dates
- `handleClose()` - Clears inputs and closes modal

**State Management**: Local state for date inputs, parent manages modal state

---

### ApiStatus.tsx

**Location**: `src/components/ApiStatus.tsx`

**Purpose**: Display API connectivity status indicator.

**Features**:
- Shows API connection status (Online/Offline)
- Green indicator when connected
- Red indicator when disconnected
- Checks API every 5 minutes
- Shows API URL

**Display**:
- Fixed bottom-right corner
- Green badge: "API: Conectada" ✅
- Red badge: "API: Desconectada" ❌

**Key Functions**:
- `checkApi()` - Pings API endpoint with 5-second timeout

---

## Using Components

### In Another Component

```typescript
import { BankReconciliation } from './components/BankReconciliation';
import { VoucherList } from './components/VoucherList';

export function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <BankReconciliation />
      <VoucherList />
    </div>
  );
}
```

### With Props

```typescript
// Example: If a component accepted props
<ComponentName
  title="My Title"
  items={items}
  onAction={handleAction}
/>
```

## Component Best Practices

### 1. Keep Components Focused
- One main responsibility per component
- Break down complex UI into smaller components

### 2. Use Custom Hooks
- Extract data fetching logic into hooks
- Reuse logic across components

### 3. Proper Error Handling
```typescript
if (error) {
  return <div className="text-red-600">Error: {error}</div>;
}
```

### 4. Loading States
```typescript
if (isLoading) {
  return <div>Cargando...</div>;
}
```

### 5. Type Safety
```typescript
interface ComponentProps {
  title: string;
  items: Item[];
  onSelect?: (id: number) => void;
}

export function MyComponent({ title, items, onSelect }: ComponentProps) {
  // ...
}
```

## Component Props Pattern

Most components in this project follow this pattern:

```typescript
import { useState } from 'react';
import { useCustomHook } from '../hooks/useCustomHook';

interface ComponentProps {
  title?: string;
  onAction?: (id: number) => void;
}

export function MyComponent({ title, onAction }: ComponentProps) {
  // Client state
  const [expanded, setExpanded] = useState(false);

  // Server state
  const { data, isLoading, error } = useCustomHook();

  // Handlers
  const handleClick = () => {
    // ...
  };

  // Rendering
  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {data && <div>{/* Render data */}</div>}
    </div>
  );
}
```

## Styling

All components use **Tailwind CSS** classes:

```typescript
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
  Click me
</button>
```

### Common Classes

- **Colors**: `bg-blue-600`, `text-white`, `border-gray-300`
- **Spacing**: `p-4`, `m-2`, `gap-3`
- **Size**: `w-full`, `h-10`, `max-w-md`
- **Display**: `flex`, `grid`, `hidden`, `block`
- **Responsive**: `md:grid-cols-2`, `lg:p-8`

## Adding New Components

1. Create file in `src/components/`
2. Use TypeScript with proper interfaces
3. Use custom hooks for data fetching
4. Add Tailwind CSS for styling
5. Update this documentation
6. Test thoroughly

---

## Component Checklist

When creating a new component:

- [ ] Use TypeScript interfaces for props
- [ ] Import and use custom hooks
- [ ] Add loading states
- [ ] Handle errors gracefully
- [ ] Use Tailwind CSS for styling
- [ ] Add JSDoc comments for complex logic
- [ ] Export with `export function`
- [ ] Test all user interactions
- [ ] Update this documentation
