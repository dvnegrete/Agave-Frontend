# Components Guide

## Overview

This document describes the main React components in the application and their responsibilities. The project is organized into business components (`components/`) and reusable UI components (`ui/`).

## Component Hierarchy

```
App (Router)
├── Login
│   ├── OAuth buttons (Google, Facebook)
│   └── Manual login form
├── BaseLayout (for authenticated routes)
│   ├── Header
│   ├── HamburgerMenu/Navigation
│   ├── Page content:
│   │   ├── Home
│   │   ├── BankReconciliation
│   │   │   ├── StartReconciliationModal
│   │   │   ├── Tab: Summary
│   │   │   ├── Tab: Conciliados
│   │   │   ├── Tab: Unfunded Vouchers
│   │   │   ├── Tab: Unclaimed Deposits
│   │   │   │   └── ModalAssignHouse
│   │   │   └── Tab: Manual Validation
│   │   ├── VoucherList
│   │   │   └── ExpandableTable (custom expandedContent)
│   │   ├── VoucherUpload
│   │   │   ├── File upload zone
│   │   │   └── Result display
│   │   ├── PaymentManagement
│   │   │   └── ExpandableTable (expandedRowLayout='table')
│   │   ├── TransactionUpload
│   │   │   ├── Bank selector
│   │   │   └── File upload & result
│   │   ├── UserManagement
│   │   │   ├── User table
│   │   │   ├── Add/Edit modals
│   │   │   └── Role/House assignment
│   │   └── HistoricalRecordsUpload
│   │       └── File upload for historical data
│   ├── Footer
│   └── ApiStatus (bottom-right)
└── ProtectedRoute (authentication wrapper)
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
- Bank selection via radio buttons (Santander-2025 or Custom)
- CSV/Excel file upload
- Comprehensive result display with statistics
- Transaction tables with details
- Error display
- Last-day transactions view

**Upload Section**:
- Bank selector (default: Santander-2025)
- Custom bank name input field
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
- `handleUpload()` - Sends file to API with bankName parameter
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

### PaymentManagement.tsx

**Location**: `src/components/PaymentManagement.tsx`

**Purpose**: Display payment history and transactions by house with reconciliation status.

**Features**:
- Tabbed interface (Summary, House Payments)
- StatsCards showing summary metrics (Total, Confirmadas, Pendientes, Deudas, Vouchers No Reconciliados)
- House selection with dropdown
- Combined table of bank transactions and unreconciled vouchers
- Expandable rows showing detailed information
- Differentiation between bank transactions and vouchers

**Summary Tab**:
- 5 StatsCards displaying:
  - Total amount
  - Confirmed transactions count
  - Pending transactions count
  - Debt balance
  - Unreconciled vouchers count (conditional - only if exists)

**House Payments Tab**:
- House selector dropdown
- Combined movements table with:
  - Main columns: Tipo (Transaction/Voucher), Fecha y Hora, Monto
  - Expandable columns: Concepto, Banco, Estatus
- Data combines:
  - Bank transactions from `transactions[]`
  - Unreconciled vouchers from `unreconciled_vouchers.vouchers[]`
- Sorted by date descending (most recent first)

**Column Rendering Details**:
- **Tipo**: Shows "🏦 Transacción" or "📋 Voucher" badge
- **Concepto**:
  - For transactions: shows concept text
  - For vouchers: shows confirmation_code with label
- **Banco**:
  - For transactions: shows bank_name
  - For vouchers: empty string
- **Estatus**: Shows status badge (Confirmada/Pendiente)

**Key State**:
- `activeTab` - Tracks selected tab (summary or house-payments)
- `selectedHouseId` - Selected house from dropdown

**Data Flow**:
- Fetches house payment data via `usePaymentHistoryQuery`
- Combines transactions and vouchers into single array
- Transforms voucher data to match transaction format
- Sorts by date descending

---

### UnclaimedDeposits.tsx

**Location**: `src/components/UnclaimedDeposits.tsx`

**Purpose**: Display and manage unclaimed deposits (surplus transactions) from bank reconciliation.

**Features**:
- Interactive table of surplus transactions
- Assign house modal for each transaction
- StatusBadge display for confirmation status
- House assignment workflow

**Columns**:
- Casa (House number)
- Monto (Amount)
- Fecha (Date)
- Concepto (Description)
- Estatus (Status badge)

**Key Functions**:
- `handleAssignHouse()` - Opens modal to assign transaction to house
- Modal submission triggers API call to reconcile transaction

---

### ModalAssignHouse.tsx

**Location**: `src/components/ModalAssignHouse.tsx`

**Purpose**: Modal dialog for assigning a transaction to a house and confirming reconciliation.

**Props**:
```typescript
interface ModalAssignHouseProps {
  isOpen: boolean;
  transaction: SurplusTransaction;
  onClose: () => void;
  onConfirm: (houseNumber: number) => Promise<void>;
  isLoading?: boolean;
}
```

**Features**:
- House number input field
- Transaction details display
- Confirm and Cancel buttons
- Loading state feedback
- Form validation

---

### Login.tsx

**Location**: `src/components/Login.tsx`

**Purpose**: Authentication entry point with OAuth and manual login options.

**Features**:
- OAuth 2.0 sign-in buttons (Google, Facebook)
- Email/password manual login form
- Remember me checkbox option
- Loading states and error messages
- Redirect to dashboard on successful login
- Responsive design

**OAuth Flow**:
- User clicks OAuth button
- Redirected to OAuth provider
- Returns to callback URL with auth code
- Token exchange handled by backend
- Automatic redirect to dashboard

**Manual Login**:
- Email and password fields
- Form validation
- Error handling
- Token storage in localStorage/cookies

---

### Home.tsx

**Location**: `src/components/Home.tsx`

**Purpose**: Dashboard/home page displayed after login.

**Features**:
- Welcome message with user name
- Quick access links to main features
- Summary statistics cards
- Recent activity feed (if applicable)
- Navigation to key pages

---

### VoucherUpload.tsx

**Location**: `src/components/VoucherUpload.tsx`

**Purpose**: Component for uploading vouchers from files.

**Props**: None (uses custom hooks)

**Features**:
- File upload zone (drag & drop)
- File validation
- Upload progress tracking
- Success/error messages
- Confirmation of uploaded data

**Upload Process**:
1. User selects or drags file
2. File validation (format, size)
3. Send to backend API
4. Display results with summary
5. Show any errors or warnings

---

### UserManagement.tsx

**Location**: `src/components/UserManagement.tsx`

**Purpose**: Admin interface for managing application users.

**Props**: None (uses custom hooks)

**Features**:
- User list with table display
- Add new user functionality
- Edit user details (modal)
- Delete user action
- Assign roles (Admin, User, Guest)
- Assign houses to users
- Search/filter users

**User Table Columns**:
- Name
- Email
- Role
- Assigned Houses
- Actions (Edit, Delete)

**Modals**:
- **Add User Modal**: Form to create new user
  - Name field
  - Email field
  - Password field
  - Role selector
  - House selector (multi-select)

- **Edit User Modal**: Modify user details
  - Update name, email
  - Change role
  - Update house assignments
  - Confirm/Cancel buttons

**Key Functions**:
- `handleAddUser()` - Opens add modal
- `handleEditUser(userId)` - Opens edit modal with user data
- `handleDeleteUser(userId)` - Delete with confirmation
- `handleSaveUser(data)` - Submit form data to API
- `handleAssignHouses(userId, houseIds)` - Update house assignments

---

### HistoricalRecordsUpload.tsx

**Location**: `src/components/HistoricalRecordsUpload.tsx`

**Purpose**: Upload historical transaction or voucher data.

**Props**: None (uses custom hooks)

**Features**:
- File upload interface
- Support for CSV/Excel formats
- Validation of historical data
- Processing status display
- Summary of imported records
- Error logging for failed records

**Upload Process**:
1. File selection
2. Format validation
3. Data parsing
4. Batch processing
5. Results summary

---

### ProtectedRoute.tsx

**Location**: `src/components/ProtectedRoute.tsx`

**Purpose**: Wrapper component that ensures only authenticated users can access routes.

**Props**:
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user' | 'guest';  // Optional role check
}
```

**Features**:
- Checks authentication status via `useAuth` hook
- Redirects to login if not authenticated
- Optional role-based access control
- Loading state while checking auth

**Usage**:
```typescript
<ProtectedRoute>
  <BankReconciliation />
</ProtectedRoute>

// With role requirement
<ProtectedRoute requiredRole="admin">
  <UserManagement />
</ProtectedRoute>
```

---

### BaseLayout.tsx

**Location**: `src/layouts/BaseLayout.tsx`

**Purpose**: Main layout wrapper for authenticated pages.

**Props**:
```typescript
interface BaseLayoutProps {
  children: React.ReactNode;
}
```

**Features**:
- Header component (logo, user menu)
- Navigation sidebar/hamburger menu
- Main content area
- Footer
- Responsive design
- Theme support

**Structure**:
```
┌─────────────────────────┐
│ Header (logo, user menu)│
├──────┬──────────────────┤
│      │                  │
│ Menu │  Main Content    │
│      │  (children)      │
│      │                  │
├──────┴──────────────────┤
│ Footer                  │
└─────────────────────────┘
```

---

### HamburgerMenu.tsx

**Location**: `src/components/HamburgerMenu.tsx`

**Purpose**: Mobile-friendly navigation menu.

**Features**:
- Toggle menu visibility
- Links to all main pages
- User logout option
- Active page indicator
- Responsive collapse

**Menu Items**:
- Home
- Comprobantes (Vouchers)
- Conciliación Bancaria (Bank Reconciliation)
- Administración de Pagos (Payment Management)
- Carga de Transacciones (Transaction Upload)
- Administración de Usuarios (User Management - if admin)
- Carga de Registros Históricos (Historical Records - if admin)

---

### Footer.tsx

**Location**: `src/components/Footer.tsx`

**Purpose**: Application footer displayed on all pages.

**Features**:
- Company/app information
- Links to documentation
- Version info
- Copyright notice
- Optional social links

---

## UI Components

UI components are reusable, presentation-focused components located in `src/ui/`. They handle styling, layout, and common interactions.

### ExpandableTable.tsx

**Location**: `src/ui/ExpandableTable.tsx`

**Purpose**: Flexible table component that supports expandable rows with multiple layout modes.

**Props**:
```typescript
interface ExpandableTableProps<T = any> {
  data: T[];                                          // Array of data rows
  mainColumns: ExpandableTableColumn<T>[];           // Columns always visible
  expandableColumns?: ExpandableTableColumn<T>[];    // Columns shown when expanded
  expandedContent?: (row: T, index: number) => React.ReactNode;  // Custom expanded content
  expandedRowLayout?: 'grid' | 'table';              // How to display expandable columns
  keyField?: string | ((row: T, index: number) => string | number);
  rowClassName?: string | ((row: T, index: number) => string);
  headerClassName?: string;
  maxHeight?: string;
  emptyMessage?: string;
  hoverable?: boolean;
  striped?: boolean;
  stickyHeader?: boolean;
  variant?: 'default' | 'compact' | 'spacious';
  headerVariant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  expandButtonLabel?: { expand: string; collapse: string };
}
```

**Three Expansion Modes**:

1. **Custom Content Mode** (VoucherList)
   - Use `expandedContent` prop for completely custom rendering
   - Shows buttons, cards, and actions in expanded row
   - Example: VoucherList with "Ver comprobante", "Confirmar", "Eliminar" buttons

2. **Table Layout Mode** (PaymentManagement)
   - Use `expandableColumns` + `expandedRowLayout='table'`
   - Shows additional columns as table cells in expanded row
   - Minimal height, inline with main columns
   - Example: PaymentManagement with Concepto, Banco, Estatus columns

3. **Grid Layout Mode** (Default)
   - Use `expandableColumns` + `expandedRowLayout='grid'`
   - Shows additional columns as cards in grid layout
   - Great for many expandable columns
   - Default when no `expandedContent` provided

**Features**:
- Automatic expand/collapse button
- Expandable button shows/hides based on content availability
- Hover effects on expandable rows
- Sticky header option
- Striped rows option
- Multiple style variants (default, compact, spacious)
- Header style variants (default, primary, success, warning, error, info)
- Type-safe generic component

**CSS Classes Used**:
- `bg-tertiary` for header background
- `bg-base` for grid cards
- `bg-primary/5` for expanded row highlight
- `border-l-4 border-primary` for expanded row left border

---

### Table.tsx

**Location**: `src/ui/Table.tsx`

**Purpose**: Standard table component for simple data display without expand functionality.

**Props**:
```typescript
interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  keyField?: string | ((row: T, index: number) => string | number);
  rowClassName?: string | ((row: T, index: number) => string);
  headerClassName?: string;
  maxHeight?: string;
  emptyMessage?: string;
  hoverable?: boolean;
  striped?: boolean;
  stickyHeader?: boolean;
  variant?: 'default' | 'compact' | 'spacious';
  headerVariant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
}
```

**Features**:
- Simple, focused table rendering
- Style variants and customization
- Hover effects
- Striped rows
- Sticky header option

---

### Button.tsx

**Location**: `src/ui/Button.tsx`

**Purpose**: Reusable button component with multiple variants and states.

**Variants**: `primary`, `success`, `warning`, `error`, `sameUi`

**Props**:
- `onClick` - Click handler
- `disabled` - Disable state
- `isLoading` - Loading state with spinner
- `variant` - Button style variant
- `children` - Button content

---

### StatusBadge.tsx

**Location**: `src/ui/StatusBadge.tsx`

**Purpose**: Display status indicators with icons and color coding.

**Props**:
- `status` - Status type (success, warning, error, info, pending)
- `label` - Display text
- `icon` - Optional icon/emoji

**Example**:
```typescript
<StatusBadge
  status="success"
  label="Confirmada"
  icon="✓"
/>
```

---

### StatsCard.tsx

**Location**: `src/ui/StatsCard.tsx`

**Purpose**: Display statistics with title, value, and optional icon.

**Props**:
- `title` - Card title
- `value` - Main value to display
- `icon` - Optional emoji or icon
- `subtitle` - Optional subtitle text
- `variant` - Style variant (default, primary, success, warning, error)

**Example**:
```typescript
<StatsCard
  title="Transacciones Totales"
  value={150}
  icon="📊"
  variant="primary"
/>
```

---

### Tabs.tsx

**Location**: `src/ui/Tabs.tsx`

**Purpose**: Tab navigation component for switching between sections.

**Props**:
- `tabs` - Array of tab definitions
- `activeTab` - Currently active tab
- `onTabChange` - Tab change handler

---

### ReconciliationCard.tsx

**Location**: `src/ui/ReconciliationCard.tsx`

**Purpose**: Card component for displaying reconciliation status and results.

**Features**:
- Confidence level indicators
- Amount display
- Status information

---

### DateTimeCell.tsx

**Location**: `src/ui/DateTimeCell.tsx`

**Purpose**: Display date and time in a formatted table cell.

**Props**:
- `date` - ISO date string
- `time` - HH:MM:SS format string (optional)

**Features**:
- Formats date using `useFormatDate` hook
- Shows date and time on separate lines
- Gray secondary text color

**Example**:
```typescript
<DateTimeCell
  date={transaction.date}
  time={transaction.time}
/>
```

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
