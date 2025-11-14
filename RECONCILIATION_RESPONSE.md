# Estructura de Respuesta de Conciliación

## Endpoint
```
POST /bank-reconciliation/reconcile
```

## Request Body
```json
{
  "startDate": "2025-01-01",  // Opcional
  "endDate": "2025-01-31"      // Opcional
}
```

Si no se proporcionan fechas, procesa **TODOS** los registros pendientes.

## Response Structure

```typescript
{
  summary: {
    totalVouchers: number;              // Total de vouchers procesados
    totalTransactions: number;          // Total de transacciones procesadas
    matched: number;                    // Cantidad conciliada automáticamente
    pendingVouchers: number;            // Vouchers sin transacción asociada
    surplusTransactions: number;        // Transacciones sin voucher asociado
    manualValidationRequired: number;   // Casos ambiguos
  },
  conciliados: [                        // Conciliaciones exitosas
    {
      voucherId: number;                // ID del voucher
      transactionId: number;            // ID de la transacción
      amount: number;                   // Monto
      date: string;                     // Fecha
      matchConfidence: number;          // Nivel de confianza (0-1)
    }
  ],
  pendientes: [                         // Vouchers sin match
    {
      voucherId: number;                // ID del voucher
      amount: number;                   // Monto del voucher
      date: string;                     // Fecha del voucher
      reason: string;                   // Razón por la que no se encontró match
    }
  ],
  sobrantes: [                          // Transacciones sin match
    {
      transactionId: number;            // ID de la transacción
      amount: number;                   // Monto
      date: string;                     // Fecha
      reason: string;                   // Razón por la que no se encontró match
    }
  ],
  manualValidationRequired: [           // Casos ambiguos
    {
      voucherId: number;                // ID del voucher
      amount: number;                   // Monto del voucher
      date: string;                     // Fecha del voucher
      reason: string;                   // Razón de ambigüedad
      possibleMatches: [
        {
          transactionId: number;        // ID de la transacción candidata
          amount: number;               // Monto de la transacción
          date: string;                 // Fecha de la transacción
          matchScore: number;           // Puntuación de coincidencia (0-1)
        }
      ]
    }
  ]
}
```

## Ejemplo de Respuesta Real

```json
{
  "summary": {
    "totalVouchers": 50,
    "totalTransactions": 48,
    "matched": 45,
    "pendingVouchers": 5,
    "surplusTransactions": 3,
    "manualValidationRequired": 2
  },
  "conciliados": [
    {
      "voucherId": 1,
      "transactionId": 100,
      "amount": 1500.15,
      "date": "2025-01-05",
      "matchConfidence": 1.0
    }
  ],
  "pendientes": [
    {
      "voucherId": 2,
      "amount": 2000,
      "date": "2025-01-15",
      "reason": "No se encontró transacción bancaria coincidente"
    }
  ],
  "sobrantes": [
    {
      "transactionId": 101,
      "amount": 3000,
      "date": "2025-01-10",
      "reason": "No se encontró voucher coincidente"
    }
  ],
  "manualValidationRequired": [
    {
      "voucherId": 3,
      "amount": 1000,
      "date": "2025-01-12",
      "reason": "Múltiples transacciones candidatas",
      "possibleMatches": [
        {
          "transactionId": 102,
          "amount": 1000,
          "date": "2025-01-13",
          "matchScore": 0.85
        },
        {
          "transactionId": 103,
          "amount": 1000,
          "date": "2025-01-14",
          "matchScore": 0.80
        }
      ]
    }
  ]
}
```

## Criterios de Matching

El endpoint usa estos criterios para determinar coincidencias:

1. **Monto exacto** - El monto debe coincidir exactamente
2. **Fecha dentro de ±3 días** - La fecha puede variar hasta 3 días
3. **Número de casa coincidente** - El número de casa debe ser el mismo

## Grupos de Resultado

### 1. Conciliados (✅)
Transacciones que coincidieron automáticamente con vouchers.
- `matchConfidence: 1.0` = Match perfecto
- `matchConfidence < 1.0` = Match con alguna variación

### 2. Pendientes (⏳)
Vouchers sin transacción bancaria asociada.
- Pueden ser pagos que aún no se reflejan en el banco
- O vouchers incorrectos/duplicados

### 3. Sobrantes (➕)
Transacciones bancarias sin voucher asociado.
- Pueden ser pagos sin voucher registrado
- O transacciones no relacionadas con el condominio

### 4. Validación Manual (🔍)
Casos ambiguos que requieren revisión humana.
- Múltiples candidatos posibles
- Información insuficiente para decidir automáticamente

## Cómo se Procesa en el Frontend

### 1. Modal de Resultado
Muestra un resumen visual con:
- Estadísticas del `summary`
- Cantidades de cada grupo
- Se cierra automáticamente después de 5 segundos

### 2. Logs en Consola
```javascript
// Resumen compacto
✅ Resultado del proceso: {
  summary: { ... },
  conciliados: 45,
  pendientes: 5,
  sobrantes: 3,
  manualValidation: 2
}

// Detalles expandidos
📋 Detalles de Conciliación
  Conciliados: [...]
  Pendientes: [...]
  Sobrantes: [...]
  Validación Manual: [...]
```

### 3. Actualización de Datos
Después de procesar, se actualizan automáticamente:
- Lista de transacciones
- Lista de vouchers
- Sugerencias de conciliación

## Cómo Ver la Respuesta

### Opción 1: En el Modal
1. Click en "🚀 Iniciar Conciliación"
2. Ingresa fechas (opcional)
3. Click en "Iniciar"
4. Observa el resultado en el modal

### Opción 2: En la Consola (F12)
```javascript
// Aparecerán estos logs:
🌐 [HTTP] POST http://localhost:3000/api/bank-reconciliation/reconcile
📡 [HTTP] Response Status: 200 OK
✅ [HTTP] Response Data: { summary: {...}, conciliados: [...], ... }
📦 [Service] Respuesta recibida de la API: { ... }
📥 Respuesta de la API: { ... }
✅ Resultado del proceso: { ... }
📋 Detalles de Conciliación
  Conciliados: [...]
  Pendientes: [...]
  Sobrantes: [...]
  Validación Manual: [...]
```

### Opción 3: En Network Tab
1. F12 → Pestaña Network
2. Busca el request a `reconcile`
3. Click en la petición
4. Ve a "Response" para ver el JSON completo

## Próximos Pasos (Sugeridos)

Basándote en esta respuesta, podrías crear:

### 1. Tabla de Conciliados
Mostrar los registros conciliados automáticamente:
```typescript
<table>
  {result.conciliados.map(item => (
    <tr>
      <td>Voucher #{item.voucher.id}</td>
      <td>Transacción #{item.transaction.id}</td>
      <td>${item.voucher.monto}</td>
      <td>{(item.matchConfidence * 100).toFixed(0)}%</td>
    </tr>
  ))}
</table>
```

### 2. Lista de Pendientes
Mostrar vouchers que necesitan atención:
```typescript
<div>
  {result.pendientes.map(item => (
    <div className="alert alert-warning">
      Voucher #{item.voucherId} - Fecha: {item.date}
      - ${item.amount}
      <br />
      Razón: {item.reason}
    </div>
  ))}
</div>
```

### 3. Casos de Validación Manual
Permitir al usuario seleccionar el match correcto:
```typescript
{result.manualValidationRequired.map(item => (
  <div>
    <p>Voucher #{item.voucher.id} - ${item.voucher.monto}</p>
    <p>Selecciona la transacción correcta:</p>
    {item.possibleMatches.map(match => (
      <button onClick={() => selectMatch(item.voucher.id, match.transaction.id)}>
        Transacción #{match.transaction.id}
        (Match: {(match.matchScore * 100).toFixed(0)}%)
      </button>
    ))}
  </div>
))}
```

### 4. Dashboard de Conciliación
Crear una vista tipo dashboard con:
- Gráficos de resumen (pie chart, bar chart)
- Métricas principales
- Acciones rápidas para cada grupo
- Filtros y búsqueda

## Tipos TypeScript

Todos los tipos están definidos en:
```
src/types/api.types.ts
```

Puedes importarlos así:
```typescript
import type {
  StartReconciliationResponse,
  ReconciliationSummary,
  MatchedReconciliation,
  PendingVoucher,
  SurplusTransaction,
  ManualValidationCase
} from '../types/api.types';
```

---

**¡La respuesta ahora se procesa y muestra correctamente!** ✅
