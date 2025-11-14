# TanStack Query - Bank Reconciliation Implementation

## 🎯 Resumen

Se implementó **TanStack Query** en el componente de Conciliación Bancaria (`BankReconciliation.tsx`) para mejorar la gestión del estado del servidor y eliminar el uso de `useEffect` manual.

## 📦 Nuevos Hooks Creados

### 1. `useBankReconciliationQuery.ts`

Hook para manejar las mutaciones de conciliación bancaria.

```typescript
export const useBankReconciliationMutations = () => {
  const queryClient = useQueryClient();

  const startMutation = useMutation({
    mutationFn: (data?: StartReconciliationRequest) => startReconciliation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions-bank'] });
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
    },
  });

  // ... otras mutaciones (reconcile, bulkReconcile, undo)

  return {
    start: startMutation.mutateAsync,
    reconcile: reconcileMutation.mutateAsync,
    reconcileBulk: bulkReconcileMutation.mutateAsync,
    undo: undoMutation.mutateAsync,
    reconciling: startMutation.isPending || ...,
    error: startMutation.error?.message || ...,
  };
};
```

**Características:**
- ✅ Invalidación automática de queries relacionadas después de cada mutación
- ✅ Estado de carga unificado (`reconciling`)
- ✅ Manejo de errores consolidado
- ✅ Soporte para múltiples operaciones: start, reconcile, bulkReconcile, undo

### 2. `useTransactionsBankQuery.ts`

Hook para queries y mutaciones de transacciones bancarias.

```typescript
// Query Keys Pattern
export const transactionBankKeys = {
  all: ['transactions-bank'] as const,
  lists: () => [...transactionBankKeys.all, 'list'] as const,
  list: (filters: TransactionsBankQuery) => [...transactionBankKeys.lists(), filters] as const,
  details: () => [...transactionBankKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionBankKeys.details(), id] as const,
};

export const useTransactionsBankQuery = (initialQuery?: TransactionsBankQuery) => {
  const [query, setQuery] = useState<TransactionsBankQuery>(initialQuery || {});

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: transactionBankKeys.list(query),
    queryFn: async ({ signal }) => {
      const response = await getTransactionsBank(query, signal);
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Manejar tanto array directo como objeto con transactions
  const transactions = Array.isArray(data) ? data : (data?.transactions || []);
  const total = Array.isArray(data) ? data.length : (data?.total || 0);

  return {
    transactions,
    total,
    isLoading,
    isFetching,
    error: error?.message || null,
    setFilters,
    refetch,
  };
};
```

**Características:**
- ✅ Patrón de Query Keys jerárquico
- ✅ Soporte para filtros dinámicos
- ✅ Manejo flexible de respuesta (array o objeto)
- ✅ Upload de archivos con invalidación automática
- ✅ Delete con invalidación automática

## 🔄 Comparación: Antes vs Después

### Antes (con hooks tradicionales)

```typescript
import { useBankReconciliation } from '../hooks/useBankReconciliation';
import { useTransactionsBank } from '../hooks/useTransactionsBank';
import { useVouchers } from '../hooks/useVouchers';

export function BankReconciliation() {
  const { transactions, refetch: refetchTransactions } = useTransactionsBank({
    reconciled: false,
  });
  const { vouchers, refetch: refetchVouchers } = useVouchers({
    status: 'approved',
  });
  const { start, reconcile, reconcileBulk, undo, reconciling, error } =
    useBankReconciliation();

  const handleStartReconciliation = async (data) => {
    const result = await start(data);
    if (result) {
      setReconciliationResult(result);
      // Manual refetch
      refetchTransactions();
      refetchVouchers();
    }
    return result;
  };
}
```

**Problemas:**
- ❌ `useEffect` manual para fetching
- ❌ Estado local para loading/error
- ❌ Refetch manual después de mutaciones
- ❌ No hay caching automático
- ❌ No hay deduplicación de requests

### Después (con TanStack Query)

```typescript
import { useBankReconciliationMutations } from '../hooks/useBankReconciliationQuery';
import { useTransactionsBankQuery } from '../hooks/useTransactionsBankQuery';
import { useVouchersQuery } from '../hooks/useVouchersQuery';

export function BankReconciliation() {
  const {
    transactions,
    refetch: refetchTransactions,
  } = useTransactionsBankQuery({
    reconciled: false,
  });

  const {
    vouchers,
    refetch: refetchVouchers,
  } = useVouchersQuery({
    confirmation_status: true,
  });

  const { start, reconcile, reconcileBulk, undo, reconciling, error } =
    useBankReconciliationMutations();

  const handleStartReconciliation = async (data) => {
    const result = await start(data);
    if (result) {
      setReconciliationResult(result);
      // React Query automáticamente invalida y refetch
    }
    return result;
  };
}
```

**Ventajas:**
- ✅ Sin `useEffect` manual
- ✅ Caching automático (5 minutos staleTime)
- ✅ Invalidación automática después de mutaciones
- ✅ Deduplicación de requests
- ✅ Background refetch
- ✅ Estados de loading unificados
- ✅ Manejo de errores simplificado

## 📊 Flujo de Datos

### Query Flow (Transacciones)
```
Componente → useTransactionsBankQuery → QueryKey → QueryFn → API → Cache → Componente
                       ↑                                               ↓
                       └──────────── Invalidation ─────────────────────┘
```

### Mutation Flow (Reconciliación)
```
Componente → useMutation → MutationFn → API
                                        ↓
                                   onSuccess
                                        ↓
                            invalidateQueries(['transactions-bank'])
                            invalidateQueries(['vouchers'])
                                        ↓
                                Automatic Refetch
```

## 🎨 Características Implementadas

### 1. Invalidación Inteligente

Después de cualquier operación de conciliación, se invalidan automáticamente:
- Todas las queries de transacciones bancarias
- Todas las queries de vouchers

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['transactions-bank'] });
  queryClient.invalidateQueries({ queryKey: ['vouchers'] });
}
```

### 2. Estado de Loading Unificado

```typescript
reconciling:
  startMutation.isPending ||
  reconcileMutation.isPending ||
  bulkReconcileMutation.isPending ||
  undoMutation.isPending
```

### 3. Manejo de Errores Consolidado

```typescript
error:
  startMutation.error?.message ||
  reconcileMutation.error?.message ||
  bulkReconcileMutation.error?.message ||
  undoMutation.error?.message ||
  null
```

### 4. Soporte para Respuestas Flexibles

El hook maneja tanto respuestas que vienen como array directo o como objeto:

```typescript
const transactions = Array.isArray(data)
  ? data
  : data?.transactions || [];
const total = Array.isArray(data)
  ? data.length
  : data?.total || 0;
```

## 📝 Archivos Modificados/Creados

### Nuevos Archivos
1. ✅ `src/hooks/useBankReconciliationQuery.ts` - Mutaciones de conciliación
2. ✅ `src/hooks/useTransactionsBankQuery.ts` - Queries y mutaciones de transacciones

### Archivos Modificados
1. ✅ `src/components/BankReconciliation.tsx` - Actualizado para usar nuevos hooks

### Archivos Existentes (sin modificar)
- `src/hooks/useBankReconciliation.ts` - Hook antiguo (mantener por compatibilidad)
- `src/hooks/useTransactionsBank.ts` - Hook antiguo (mantener por compatibilidad)
- `src/services/bankReconciliationService.ts` - Sin cambios
- `src/services/transactionBankService.ts` - Sin cambios

## ✅ Ventajas de la Implementación

| Aspecto | Hooks Tradicionales | TanStack Query |
|---------|-------------------|----------------|
| **Setup** | Manual state, loading, error | Hook simple |
| **Fetching** | useEffect + dependencies | Automático |
| **Refetch** | Manual llamada | Automático después de mutations |
| **Cache** | No existe | Automático (5 min staleTime) |
| **Loading** | Múltiples estados | isLoading + isFetching |
| **Deduplication** | No | Sí |
| **Background Refetch** | No | Sí |
| **DevTools** | No | Sí |
| **Code Lines** | ~100 líneas | ~30 líneas |

## 🚀 Próximos Pasos

### 1. Migrar TransactionUpload
- Aplicar el mismo patrón a `TransactionUpload.tsx`
- Usar `useTransactionBankMutations` para upload

### 2. Implementar Prefetching
```typescript
const prefetchTransactions = () => {
  queryClient.prefetchQuery({
    queryKey: transactionBankKeys.list({ reconciled: false }),
    queryFn: () => getTransactionsBank({ reconciled: false }),
  });
};
```

### 3. Agregar Optimistic Updates
Para mejor UX en conciliación manual:

```typescript
const reconcileMutation = useMutation({
  mutationFn: (data: ReconcileRequest) => reconcileTransaction(data),
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: transactionBankKeys.lists() });
    const previous = queryClient.getQueryData(transactionBankKeys.lists());
    // Actualizar optimistamente
    queryClient.setQueryData(transactionBankKeys.lists(), (old) => {
      // ... update logic
    });
    return { previous };
  },
  onError: (err, variables, context) => {
    queryClient.setQueryData(transactionBankKeys.lists(), context?.previous);
  },
});
```

## 📌 Notas Importantes

1. **Compatibilidad**: Los hooks antiguos se mantienen para no romper otros componentes
2. **Query Keys**: Usar el patrón establecido para consistencia
3. **StaleTime**: 5 minutos por defecto, ajustar según necesidades
4. **Error Handling**: Los errores se propagan correctamente

## ✅ Checklist de Migración

- [✅] Crear `useBankReconciliationQuery.ts`
- [✅] Crear `useTransactionsBankQuery.ts`
- [✅] Actualizar `BankReconciliation.tsx`
- [✅] Build exitoso
- [✅] Documentación completa
- [ ] Testing en desarrollo
- [ ] Migrar `TransactionUpload.tsx`

---

✅ **Estado**: Implementado en Bank Reconciliation
🏗️ **Build**: Exitoso
📝 **Documentación**: Completa
🎯 **Siguiente**: Testing y migración de TransactionUpload
