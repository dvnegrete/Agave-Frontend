# Manual Reconciliation Feature

## ✅ Implementación Completada

La funcionalidad de conciliación manual está completamente implementada en `BankReconciliation.tsx`.

## 🎯 ¿Qué es la Conciliación Manual?

Cuando el sistema automático de conciliación encuentra **múltiples transacciones candidatas** para un voucher, no puede decidir automáticamente cuál es la correcta. En estos casos, requiere **validación manual** donde un usuario revisa las opciones y selecciona la transacción correcta.

## 📍 Ubicación en la UI

**Pestaña**: 🔍 Validación Manual (tab rojo en la interfaz de resultados)

Esta pestaña solo aparece después de ejecutar "Iniciar Conciliación" y solo si hay casos que requieren validación manual.

## 🔧 Cómo Funciona

### Flujo de Usuario:

1. **Ver casos ambiguos**: Cada card muestra:
   ```
   ┌────────────────────────────────────────┐
   │ Voucher #3 - $1,000.00                 │
   │ Múltiples transacciones candidatas     │
   │                                        │
   │ Posibles coincidencias:                │
   │ • Transacción #102  Score: 85%  [Conciliar] │
   │ • Transacción #103  Score: 80%  [Conciliar] │
   └────────────────────────────────────────┘
   ```

2. **Revisar scores**: Cada transacción candidata tiene un score de similitud (0-100%)
   - **85-100%**: Alta probabilidad de match
   - **70-84%**: Probabilidad media
   - **<70%**: Baja probabilidad

3. **Seleccionar el match correcto**: Click en "Conciliar" en la transacción que corresponde

4. **Automático después del click**:
   - Botón cambia a "Procesando..."
   - Se ejecuta la conciliación en la API
   - Se actualiza automáticamente la lista de resultados
   - El caso desaparece de la lista de validación manual
   - Aparece en la lista de "Conciliados"

## 💻 Implementación Técnica

### Función Principal

```typescript
const handleManualValidation = async (voucherId: number, transactionId: number) => {
  try {
    console.log('🔧 [Manual Validation] Iniciando conciliación manual:', {
      voucherId,
      transactionId,
    });

    // Ejecutar conciliación en la API
    await reconcile({
      transactionId: transactionId.toString(),
      voucherId: voucherId.toString(),
    });

    console.log('✅ [Manual Validation] Conciliación manual exitosa');

    // Re-ejecutar conciliación para obtener resultados actualizados
    const updatedResult = await start({});
    if (updatedResult) {
      setReconciliationResult(updatedResult);
      // Se queda en la pestaña de validación manual para continuar trabajando
    }

    // Actualizar otros datos
    refetchTransactions();
    refetchVouchers();
    refetchMatches();
  } catch (err) {
    console.error('❌ [Manual Validation] Error en conciliación manual:', err);
    alert('Error al realizar la conciliación manual. Por favor intenta de nuevo.');
  }
};
```

### Botón Interactivo

```typescript
<button
  onClick={() => handleManualValidation(item.voucher.id, match.transaction.id)}
  disabled={reconciling}
  className="ml-3 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
>
  {reconciling ? 'Procesando...' : 'Conciliar'}
</button>
```

## 🔄 Flujo de Datos

```mermaid
Usuario → Click "Conciliar"
       → handleManualValidation()
       → API POST /bank-reconciliation/reconcile
       → Conciliación guardada en DB
       → Re-ejecutar GET /bank-reconciliation/reconcile
       → Obtener resultados actualizados
       → Actualizar estado local
       → UI se actualiza automáticamente
       → Caso desaparece de "Validación Manual"
       → Aparece en "Conciliados"
```

## 📊 API Endpoints Utilizados

### 1. POST /bank-reconciliation/reconcile (Individual)
**Request:**
```json
{
  "transactionId": "102",
  "voucherId": "3"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Conciliación exitosa",
  "transaction": { ... },
  "voucher": { ... }
}
```

### 2. POST /bank-reconciliation/reconcile (Bulk)
Después de conciliar, se vuelve a ejecutar el proceso completo para obtener la lista actualizada:

**Request:**
```json
{
  "startDate": "2025-01-01",  // Opcional
  "endDate": "2025-01-31"      // Opcional
}
```

**Response:**
```json
{
  "summary": { ... },
  "conciliados": [ ... ],      // Ahora incluye el recién conciliado
  "pendientes": [ ... ],
  "sobrantes": [ ... ],
  "manualValidationRequired": [ ... ]  // Ya no incluye el caso resuelto
}
```

## 🎨 Estados Visuales

| Estado | Apariencia | Significado |
|--------|-----------|-------------|
| Normal | Botón azul "Conciliar" | Listo para conciliar |
| Hover | Botón azul más oscuro | Interactivo |
| Processing | "Procesando..." + opacidad 50% | Ejecutando API call |
| Disabled | Opacidad 50% + cursor no permitido | Otra conciliación en progreso |

## 📝 Logging

El sistema genera logs detallados en consola:

```javascript
// Al iniciar
🔧 [Manual Validation] Iniciando conciliación manual: {
  voucherId: 3,
  transactionId: 102
}

// Al completar exitosamente
✅ [Manual Validation] Conciliación manual exitosa

// Si hay error
❌ [Manual Validation] Error en conciliación manual: <error details>
```

## ⚠️ Manejo de Errores

### Casos de Error:

1. **Error de red**: No se puede conectar con la API
2. **Error de validación**: IDs inválidos
3. **Error de negocio**: La transacción ya está conciliada

### Respuesta del Sistema:

- Muestra alert con mensaje de error
- Log detallado en consola
- No cambia el estado de la UI (el caso sigue en la lista)
- Permite reintentar

## 💡 Tips de Uso

### Para el Usuario:

1. **Revisar scores antes de conciliar**
   - Prioriza scores más altos (más probable que sea correcto)
   - Si todos los scores son bajos (<70%), investiga antes de conciliar

2. **Trabajar de arriba hacia abajo**
   - Los casos están ordenados por importancia
   - Resuelve primero los de score más alto

3. **Verificar después de conciliar**
   - Ve a la pestaña "Conciliados"
   - Verifica que el caso aparezca correctamente

### Para el Desarrollador:

1. **Debugging**
   - Abre la consola (F12)
   - Busca logs con prefijo `[Manual Validation]`
   - Verifica los payloads enviados a la API

2. **Testing**
   - Prueba con diferentes scores
   - Verifica que se actualice correctamente
   - Prueba el manejo de errores desconectando la API

## 🧪 Casos de Prueba

### Caso 1: Conciliación Exitosa
```
Precondición: Hay al menos 1 caso en "Validación Manual"
Acción: Click en "Conciliar" en cualquier candidato
Resultado esperado:
  - Botón muestra "Procesando..."
  - Request a API se ejecuta
  - Resultados se actualizan
  - Caso desaparece de validación manual
  - Caso aparece en conciliados
```

### Caso 2: Error de API
```
Precondición: API está apagada
Acción: Click en "Conciliar"
Resultado esperado:
  - Se muestra alert de error
  - Log de error en consola
  - Caso permanece en la lista
  - Permite reintentar
```

### Caso 3: Múltiples Conciliaciones
```
Precondición: Varios casos en validación manual
Acción: Conciliar varios casos uno por uno
Resultado esperado:
  - Cada conciliación se procesa correctamente
  - Lista se actualiza después de cada una
  - No hay conflictos entre conciliaciones
```

## 🔍 Comparación: Manual vs Automática

| Aspecto | Conciliación Automática | Conciliación Manual |
|---------|------------------------|---------------------|
| Cuándo | Match único y claro (score ~100%) | Múltiples candidatos |
| Intervención | No requiere | Usuario decide |
| Ubicación en UI | Pestaña "Conciliados" directamente | Primero "Validación Manual", luego "Conciliados" |
| Confianza | Alta (matchConfidence = 1.0) | Variable según el score seleccionado |

## 📈 Mejoras Futuras (Sugeridas)

1. **Confirmación antes de conciliar**
   - Modal de confirmación con detalles de ambos registros
   - Comparación lado a lado

2. **Historial de conciliaciones manuales**
   - Ver quién concilió qué
   - Timestamp de cada acción
   - Opción de revertir

3. **Más información en los cards**
   - Mostrar más campos de voucher y transacción
   - Explicación de por qué el score es X%

4. **Búsqueda y filtrado**
   - Buscar por ID de voucher
   - Filtrar por rango de score
   - Ordenar por score ascendente/descendente

5. **Acciones en lote**
   - Conciliar múltiples casos con score > 90%
   - Checkbox para seleccionar varios

## ✅ Checklist de Verificación

Antes de usar en producción, verifica:

- [ ] API está corriendo en http://localhost:3000
- [ ] Endpoint POST /bank-reconciliation/reconcile funciona
- [ ] Endpoint POST /bank-reconciliation/reconcile (bulk) funciona
- [ ] Los logs aparecen correctamente en consola
- [ ] Los errores se manejan con alertas
- [ ] La UI se actualiza después de conciliar
- [ ] No hay errores en la consola del navegador
- [ ] El build de producción funciona (`npm run build`)

---

¡La conciliación manual está completamente funcional y lista para usar! 🎉
