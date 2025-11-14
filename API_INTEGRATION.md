# API Integration Documentation

Esta documentación describe cómo usar los servicios de API implementados para consumir los endpoints de la aplicación Agave.

## Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

## Estructura de Archivos

```
src/
├── config/
│   └── api.ts                 # Configuración de endpoints
├── utils/
│   └── httpClient.ts          # Cliente HTTP base
├── types/
│   └── api.types.ts           # TypeScript interfaces
├── services/
│   ├── index.ts               # Exportaciones centralizadas
│   ├── voucherService.ts      # Servicio de vouchers
│   ├── transactionBankService.ts  # Servicio de transacciones bancarias
│   └── bankReconciliationService.ts  # Servicio de conciliación
└── hooks/
    ├── useVouchers.ts         # Hook para vouchers
    ├── useTransactionsBank.ts # Hook para transacciones
    └── useBankReconciliation.ts  # Hook para conciliación
```

## Servicios Disponibles

### 1. Vouchers Service

#### Obtener todos los vouchers

```typescript
import { getVouchers } from './services';

// Con filtros opcionales
const response = await getVouchers({
  page: 1,
  limit: 10,
  status: 'pending',
  startDate: '2025-01-01',
  endDate: '2025-12-31'
});
```

#### Obtener un voucher por ID

```typescript
import { getVoucherById } from './services';

const voucher = await getVoucherById('voucher-id-123');
```

#### Crear un voucher

```typescript
import { createVoucher } from './services';

const newVoucher = await createVoucher({
  voucherNumber: 'V-001',
  date: '2025-11-13',
  description: 'Pago de servicios',
  entries: [
    {
      accountId: 'account-1',
      debit: 1000,
      credit: 0,
      description: 'Cargo a cuenta'
    }
  ]
});
```

#### Actualizar un voucher

```typescript
import { updateVoucher } from './services';

const updated = await updateVoucher('voucher-id-123', {
  status: 'approved',
  description: 'Descripción actualizada'
});
```

#### Eliminar un voucher

```typescript
import { deleteVoucher } from './services';

await deleteVoucher('voucher-id-123');
```

### 2. Transactions Bank Service

#### Obtener transacciones bancarias

```typescript
import { getTransactionsBank } from './services';

const response = await getTransactionsBank({
  page: 1,
  limit: 20,
  reconciled: false,
  startDate: '2025-01-01',
  endDate: '2025-12-31'
});
```

#### Subir archivo de transacciones

```typescript
import { uploadTransactionsBank } from './services';

const handleFileUpload = async (file: File) => {
  const result = await uploadTransactionsBank(file);
  console.log(`Importadas: ${result.imported}`);
  console.log(`Duplicadas: ${result.duplicated}`);
  console.log(`Errores: ${result.errors}`);
};
```

### 3. Bank Reconciliation Service

#### Conciliar una transacción con un voucher

```typescript
import { reconcileTransaction } from './services';

const result = await reconcileTransaction({
  transactionId: 'transaction-123',
  voucherId: 'voucher-456'
});
```

#### Conciliación en lote

```typescript
import { bulkReconcile } from './services';

const result = await bulkReconcile({
  matches: [
    { transactionId: 'trans-1', voucherId: 'vouch-1', similarity: 0.95, suggested: true },
    { transactionId: 'trans-2', voucherId: 'vouch-2', similarity: 0.88, suggested: true }
  ]
});
```

#### Obtener coincidencias sugeridas

```typescript
import { getSuggestedMatches } from './services';

const suggestions = await getSuggestedMatches();
```

#### Deshacer conciliación

```typescript
import { undoReconciliation } from './services';

await undoReconciliation('transaction-123');
```

## React Hooks

Para facilitar el uso en componentes React, se han creado hooks personalizados:

### useVouchers Hook

```typescript
import { useVouchers, useVoucher, useVoucherMutations } from './hooks/useVouchers';

function VouchersComponent() {
  // Listar vouchers
  const { vouchers, loading, error, total, page, setPage, refetch } = useVouchers({
    status: 'pending'
  });

  // Obtener un voucher específico
  const { voucher, loading: loadingVoucher } = useVoucher('voucher-id-123');

  // Mutaciones (crear, actualizar, eliminar)
  const { create, update, remove, loading: mutating } = useVoucherMutations();

  const handleCreate = async () => {
    try {
      await create({
        voucherNumber: 'V-002',
        date: '2025-11-13',
        description: 'Nuevo voucher',
        entries: []
      });
      refetch(); // Recargar lista
    } catch (error) {
      console.error('Error creating voucher:', error);
    }
  };

  return (
    <div>
      {loading ? <p>Cargando...</p> : null}
      {error ? <p>Error: {error}</p> : null}
      {vouchers.map(v => <div key={v.id}>{v.description}</div>)}
    </div>
  );
}
```

### useTransactionsBank Hook

```typescript
import { useTransactionsBank, useUploadTransactions } from './hooks/useTransactionsBank';

function TransactionsComponent() {
  const { transactions, loading, error, refetch } = useTransactionsBank({
    reconciled: false
  });

  const { upload, uploading, uploadResult, uploadError } = useUploadTransactions();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await upload(file);
        refetch(); // Recargar transacciones
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} disabled={uploading} />
      {uploadResult && (
        <p>Importadas: {uploadResult.imported}, Duplicadas: {uploadResult.duplicated}</p>
      )}
    </div>
  );
}
```

### useBankReconciliation Hook

```typescript
import { useBankReconciliation, useSuggestedMatches } from './hooks/useBankReconciliation';

function ReconciliationComponent() {
  const { reconcile, reconcileBulk, undo, reconciling, error } = useBankReconciliation();
  const { matches, loading, refetch } = useSuggestedMatches();

  const handleReconcile = async () => {
    try {
      await reconcile({
        transactionId: 'trans-123',
        voucherId: 'vouch-456'
      });
      refetch(); // Actualizar sugerencias
    } catch (error) {
      console.error('Error reconciling:', error);
    }
  };

  return (
    <div>
      {matches.map(match => (
        <div key={match.transactionId}>
          Similitud: {match.similarity * 100}%
        </div>
      ))}
    </div>
  );
}
```

## Manejo de Errores

Todos los servicios manejan errores de manera consistente:

```typescript
try {
  const voucher = await getVoucherById('invalid-id');
} catch (error) {
  if (error instanceof Error) {
    console.error('Error message:', error.message);
  }
}
```

## Cancelación de Solicitudes

Los hooks incluyen soporte para cancelación automática cuando el componente se desmonta:

```typescript
useEffect(() => {
  const abortController = new AbortController();

  getVouchers({}, abortController.signal);

  return () => abortController.abort();
}, []);
```

## TypeScript Support

Todos los servicios y hooks están completamente tipados con TypeScript. Los tipos están disponibles en:

- `src/types/api.types.ts` - Tipos de datos de la API
- Cada servicio exporta sus propios tipos específicos

```typescript
import type { Voucher, CreateVoucherRequest, VoucherQuery } from './services';
```

## Endpoints Implementados

| Endpoint | Método | Servicio |
|----------|--------|----------|
| `/vouchers` | GET, POST | `voucherService.ts` |
| `/vouchers/{id}` | GET, PUT, DELETE | `voucherService.ts` |
| `/transactions-bank` | GET | `transactionBankService.ts` |
| `/transactions-bank/upload` | POST | `transactionBankService.ts` |
| `/bank-reconciliation/reconcile` | POST | `bankReconciliationService.ts` |

## Próximos Pasos

1. Configurar la variable de entorno `VITE_API_BASE_URL` en tu archivo `.env`
2. Importar los servicios o hooks necesarios en tus componentes
3. Implementar la UI para interactuar con estos endpoints
4. Agregar autenticación/autorización si es necesario (tokens JWT, etc.)
