# Quick Start - Integración API

## Configuración Inicial

1. **Crear archivo de entorno**
   ```bash
   cp .env.example .env
   ```

2. **Configurar URL de la API**
   Edita `.env`:
   ```
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

3. **Instalar dependencias (si aún no lo has hecho)**
   ```bash
   npm install
   ```

4. **Ejecutar el proyecto**
   ```bash
   npm run dev
   ```

## Estructura Creada

```
src/
├── config/
│   └── api.ts                          # URLs y configuración
├── utils/
│   └── httpClient.ts                   # Cliente HTTP (fetch wrapper)
├── types/
│   └── api.types.ts                    # Tipos TypeScript
├── services/
│   ├── index.ts                        # Exportaciones
│   ├── voucherService.ts               # API de vouchers
│   ├── transactionBankService.ts       # API de transacciones
│   └── bankReconciliationService.ts    # API de conciliación
├── hooks/
│   ├── useVouchers.ts                  # React hooks para vouchers
│   ├── useTransactionsBank.ts          # React hooks para transacciones
│   └── useBankReconciliation.ts        # React hooks para conciliación
└── components/
    ├── VoucherList.example.tsx         # Ejemplo de componente
    ├── TransactionUpload.example.tsx   # Ejemplo de subir archivo
    └── BankReconciliation.example.tsx  # Ejemplo de conciliación
```

## Endpoints Implementados

| Endpoint | Método | Servicio |
|----------|--------|----------|
| `/vouchers` | GET, POST | `getVouchers`, `createVoucher` |
| `/vouchers/{id}` | GET, PUT, DELETE | `getVoucherById`, `updateVoucher`, `deleteVoucher` |
| `/transactions-bank` | GET | `getTransactionsBank` |
| `/transactions-bank/upload` | POST | `uploadTransactionsBank` |
| `/bank-reconciliation/reconcile` | POST | `reconcileTransaction` |

## Uso Rápido

### 1. Importar y usar directamente el servicio

```typescript
import { getVouchers, createVoucher } from './services';

// Obtener vouchers
const { vouchers } = await getVouchers({ page: 1, limit: 10 });

// Crear voucher
const newVoucher = await createVoucher({
  voucherNumber: 'V-001',
  date: '2025-11-13',
  description: 'Mi voucher',
  entries: []
});
```

### 2. Usar hooks en componentes React

```typescript
import { useVouchers, useVoucherMutations } from './hooks/useVouchers';

function MyComponent() {
  const { vouchers, loading, error } = useVouchers();
  const { create, update, remove } = useVoucherMutations();

  // Tu lógica aquí
}
```

### 3. Subir archivo de transacciones

```typescript
import { useUploadTransactions } from './hooks/useTransactionsBank';

function UploadComponent() {
  const { upload, uploading, uploadResult } = useUploadTransactions();

  const handleFileUpload = async (file: File) => {
    await upload(file);
  };
}
```

### 4. Conciliar transacciones

```typescript
import { useBankReconciliation } from './hooks/useBankReconciliation';

function ReconcileComponent() {
  const { reconcile, reconciling } = useBankReconciliation();

  const handleReconcile = async () => {
    await reconcile({
      transactionId: 'trans-123',
      voucherId: 'vouch-456'
    });
  };
}
```

## Ejemplos de Componentes

Revisa los archivos `*.example.tsx` en `src/components/` para ver ejemplos completos de:

- **VoucherList.example.tsx**: Lista de vouchers con CRUD
- **TransactionUpload.example.tsx**: Subir y mostrar transacciones
- **BankReconciliation.example.tsx**: Conciliación manual y automática

## Documentación Completa

Para documentación detallada, consulta:
- **API_INTEGRATION.md** - Guía completa de la integración

## Características

- ✅ Cliente HTTP con manejo de errores
- ✅ TypeScript completamente tipado
- ✅ React Hooks para fácil integración
- ✅ Soporte para cancelación de peticiones (AbortSignal)
- ✅ Manejo automático de FormData para uploads
- ✅ Ejemplos de componentes funcionales
- ✅ Paginación incluida
- ✅ Estados de carga y error
