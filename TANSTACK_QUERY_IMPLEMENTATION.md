# TanStack Query Implementation

## 🎯 Resumen

Se implementó **TanStack Query (React Query)** para manejar el estado del servidor en la aplicación, eliminando el uso de `useEffect` manual y mejorando la gestión de datos asíncronos.

## 📦 Instalación

```bash
npm install @tanstack/react-query
npm install @tanstack/react-query-devtools
```

## 🔧 Configuración

### 1. QueryClient Setup (`src/App.tsx`)

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Crear cliente con configuración global
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,  // No refetch al cambiar de tab
      retry: 1,                      // Solo 1 reintento en caso de error
      staleTime: 5 * 60 * 1000,     // Datos considerados frescos por 5 minutos
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Tu app */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### 2. Custom Hooks (`src/hooks/useVouchersQuery.ts`)

#### Query Keys Pattern

```typescript
export const voucherKeys = {
  all: ['vouchers'] as const,
  lists: () => [...voucherKeys.all, 'list'] as const,
  list: (filters: VoucherQuery) => [...voucherKeys.lists(), filters] as const,
  details: () => [...voucherKeys.all, 'detail'] as const,
  detail: (id: string) => [...voucherKeys.details(), id] as const,
}
```

**Estructura de Keys:**
- `['vouchers']` - Todas las queries de vouchers
- `['vouchers', 'list']` - Todas las listas
- `['vouchers', 'list', { page: 1, limit: 10 }]` - Lista específica con filtros
- `['vouchers', 'detail']` - Todos los detalles
- `['vouchers', 'detail', '123']` - Detalle de voucher específico

#### useVouchersQuery Hook

```typescript
export const useVouchersQuery = (initialQuery?: VoucherQuery) => {
  const [query, setQuery] = useState<VoucherQuery>(
    initialQuery || { page: 1, limit: 10 }
  )

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: voucherKeys.list(query),
    queryFn: async ({ signal }) => {
      const response = await getVouchers(query, signal)
      return response
    },
    staleTime: 5 * 60 * 1000,
  })

  const setPage = (page: number) => {
    setQuery((prev) => ({ ...prev, page }))
  }

  return {
    vouchers: data?.vouchers || [],
    total: data?.total || 0,
    page: query.page || 1,
    limit: query.limit || 10,
    isLoading,
    isFetching,
    error: error?.message || null,
    setPage,
    refetch,
  }
}
```

#### useVoucherMutations Hook

```typescript
export const useVoucherMutations = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: CreateVoucherRequest) => createVoucher(data),
    onSuccess: () => {
      // Invalidar automáticamente todas las listas
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVoucherRequest }) =>
      updateVoucher(id, data),
    onSuccess: (_, variables) => {
      // Invalidar detalle específico y todas las listas
      queryClient.invalidateQueries({ queryKey: voucherKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVoucher(id),
    onSuccess: () => {
      // Invalidar todas las queries de vouchers
      queryClient.invalidateQueries({ queryKey: voucherKeys.all })
    },
  })

  return {
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  }
}
```

### 3. Componente Actualizado (`VoucherList.tsx`)

**Antes (con useEffect):**
```typescript
export function VoucherList() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVouchers = async () => {
      setLoading(true)
      try {
        const response = await getVouchers()
        setVouchers(response.vouchers)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchVouchers()
  }, [])

  const handleCreate = async () => {
    await createVoucher(data)
    // Manualmente refetch
    fetchVouchers()
  }
}
```

**Después (con React Query):**
```typescript
export function VoucherList() {
  const {
    vouchers,
    total,
    page,
    isLoading,
    isFetching,
    error,
    setPage,
  } = useVouchersQuery()

  const { create, isLoading: mutating } = useVoucherMutations()

  const handleCreate = async () => {
    await create(data)
    // React Query automáticamente invalida y refetch
  }
}
```

## ✅ Ventajas de TanStack Query

### 1. **Caching Automático**
- Los datos se cachean automáticamente
- Configuración de `staleTime` para control de frescura
- Deduplicación de requests

### 2. **Sin useEffect Manual**
```typescript
// ❌ Antes
useEffect(() => {
  const fetchData = async () => {
    // fetch logic
  }
  fetchData()
}, [dependencies])

// ✅ Después
const { data } = useQuery({
  queryKey: ['key'],
  queryFn: fetchData,
})
```

### 3. **Estado de Loading Mejorado**
- `isLoading` - Primera carga
- `isFetching` - Cualquier fetch (incluye background)
- `isError` - Estado de error
- `isSuccess` - Estado de éxito

### 4. **Invalidación Automática**
```typescript
// Después de una mutación, invalida automáticamente
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: voucherKeys.lists() })
}
```

### 5. **Optimistic Updates** (Opcional)
```typescript
const updateMutation = useMutation({
  mutationFn: updateVoucher,
  onMutate: async (newData) => {
    // Cancelar queries en progreso
    await queryClient.cancelQueries({ queryKey: voucherKeys.lists() })
    
    // Snapshot del valor anterior
    const previous = queryClient.getQueryData(voucherKeys.lists())
    
    // Actualizar optimistamente
    queryClient.setQueryData(voucherKeys.lists(), newData)
    
    return { previous }
  },
  onError: (err, variables, context) => {
    // Rollback en caso de error
    queryClient.setQueryData(voucherKeys.lists(), context?.previous)
  },
})
```

### 6. **DevTools**
- Panel de desarrollo integrado
- Visualización de queries y mutaciones
- Inspección de cache
- Timeline de eventos

## 🎨 Características Implementadas

### Indicador de Actualización
```typescript
{isFetching && !isLoading && (
  <div className="flex items-center text-sm text-gray-500">
    <svg className="animate-spin h-4 w-4 mr-2">...</svg>
    Actualizando...
  </div>
)}
```

### Paginación Reactiva
```typescript
const setPage = (page: number) => {
  setQuery((prev) => ({ ...prev, page }))
}
// Al cambiar query, useQuery automáticamente refetch
```

### Manejo de Errores
```typescript
if (error) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      Error: {error}
    </div>
  )
}
```

## 📊 Flujo de Datos

### Query Flow
```
Componente → useQuery → QueryKey → QueryFn → API → Cache → Componente
                ↑                                    ↓
                └──────────── Invalidation ──────────┘
```

### Mutation Flow
```
Componente → useMutation → MutationFn → API
                                         ↓
                                    onSuccess
                                         ↓
                              invalidateQueries
                                         ↓
                                  Automatic Refetch
```

## 🔍 Comparación: Antes vs Después

| Aspecto | useEffect | React Query |
|---------|-----------|-------------|
| **Setup** | Manual state, loading, error | Hook simple |
| **Fetching** | useEffect + dependencies | Automático |
| **Refetch** | Manual llamada | Automático después de mutations |
| **Cache** | No existe | Automático (5 min staleTime) |
| **Loading** | 1 estado | isLoading + isFetching |
| **Deduplication** | No | Sí |
| **Background Refetch** | No | Sí |
| **DevTools** | No | Sí |
| **Code Lines** | ~50 líneas | ~10 líneas |

## 🚀 Próximos Pasos

### 1. Implementar en otros componentes
- `BankReconciliation` ✅ Pendiente
- `TransactionUpload` ✅ Pendiente
- `TransactionList` ✅ Pendiente

### 2. Agregar Prefetching
```typescript
const prefetchNextPage = () => {
  queryClient.prefetchQuery({
    queryKey: voucherKeys.list({ page: page + 1, limit }),
    queryFn: () => getVouchers({ page: page + 1, limit }),
  })
}
```

### 3. Implementar Infinite Queries
```typescript
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: voucherKeys.lists(),
  queryFn: ({ pageParam = 1 }) => getVouchers({ page: pageParam }),
  getNextPageParam: (lastPage) => lastPage.nextPage,
})
```

### 4. Agregar Mutaciones Optimistas
Para mejor UX, actualizar UI antes de esperar respuesta del servidor.

## 📝 Notas Importantes

1. **No eliminar hooks antiguos aún**: Mantener `useVouchers.ts` hasta migrar todos los componentes
2. **Query Keys**: Seguir el patrón establecido para consistencia
3. **StaleTime**: Ajustar según necesidades de cada query
4. **Error Handling**: Implementar boundary errors para producción

## ✅ Checklist de Migración

Para migrar un componente a React Query:

- [ ] Instalar dependencias
- [✅] Configurar QueryClient en App
- [✅] Crear custom hooks con useQuery
- [✅] Crear custom hooks con useMutation
- [✅] Actualizar componente para usar nuevos hooks
- [✅] Eliminar useEffect manual
- [✅] Eliminar estado local de loading/error
- [✅] Implementar invalidación en mutaciones
- [✅] Agregar indicadores visuales (isFetching)
- [✅] Probar funcionalidad
- [✅] Build exitoso

---

✅ **Estado**: Implementado en Vouchers
🏗️ **Build**: Exitoso
📝 **Documentación**: Completa
🎯 **Siguiente**: Aplicar a otros componentes
