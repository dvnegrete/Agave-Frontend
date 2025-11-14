# Guía: Iniciar Conciliación

## Nueva Funcionalidad Implementada

Se ha agregado un botón **"🚀 Iniciar Conciliación"** en la página de conciliación bancaria que permite iniciar el proceso de conciliación con filtros opcionales de fecha.

## 🎯 Ubicación

**Ruta:** `/reconciliation`

**Navegación:**
1. Click en el menú hamburguesa (esquina superior izquierda)
2. Selecciona "🔄 Conciliación"
3. Verás el botón verde "🚀 Iniciar Conciliación" en la esquina superior derecha

## 🔧 Cómo Usar

### Paso 1: Abrir el Modal
Click en el botón verde **"🚀 Iniciar Conciliación"**

### Paso 2: Configurar Fechas (Opcional)
El modal mostrará dos campos de fecha:

- **Fecha Inicio** (opcional)
- **Fecha Fin** (opcional)

**Importante:** Ambos campos son opcionales. Si no especificas fechas, la API procesará todos los registros disponibles.

### Paso 3: Iniciar el Proceso
Click en el botón **"Iniciar"**

### Paso 4: Ver Resultados
El modal mostrará:
- ✅ Mensaje de éxito/error
- 📊 Coincidencias encontradas
- 📝 Transacciones procesadas
- 📄 Vouchers procesados

## 📡 Endpoint API

### Request

**Método:** `POST`
**URL:** `/api/bank-reconciliation/reconcile`

**Body (JSON):**
```json
{
  "startDate": "2025-08-01",
  "endDate": "2025-08-31"
}
```

**Campos opcionales:**
- `startDate` (string, formato: YYYY-MM-DD)
- `endDate` (string, formato: YYYY-MM-DD)

**Body vacío también es válido:**
```json
{}
```

### Response

```json
{
  "success": true,
  "message": "Conciliación iniciada exitosamente",
  "matchesFound": 15,
  "processedTransactions": 50,
  "processedVouchers": 45
}
```

## 🎨 Características de la UI

### Modal Interactivo
- 📅 Campos de fecha con selector visual
- 🔄 Indicador de carga mientras procesa
- ✅ Mensaje de resultado con colores (verde=éxito, rojo=error)
- 📊 Estadísticas detalladas del proceso

### Estados
- **Inicial:** Campos vacíos, botón "Iniciar" activo
- **Procesando:** Botón muestra "Procesando...", campos deshabilitados
- **Completado:** Muestra resultado con estadísticas
- **Error:** Muestra mensaje de error en rojo

### Validaciones
- Las fechas se envían en formato ISO (YYYY-MM-DD)
- Si no hay fechas, se envía objeto vacío `{}`
- Los botones se deshabilitan durante el proceso

## 🧪 Ejemplos de Uso

### Ejemplo 1: Sin Fechas (Procesar Todo)
1. Click en "🚀 Iniciar Conciliación"
2. Dejar ambos campos vacíos
3. Click en "Iniciar"
4. Resultado: Procesa todas las transacciones y vouchers

### Ejemplo 2: Con Rango de Fechas
1. Click en "🚀 Iniciar Conciliación"
2. Fecha Inicio: `2025-08-01`
3. Fecha Fin: `2025-08-31`
4. Click en "Iniciar"
5. Resultado: Procesa solo registros de agosto 2025

### Ejemplo 3: Solo Fecha Inicio
1. Click en "🚀 Iniciar Conciliación"
2. Fecha Inicio: `2025-08-01`
3. Fecha Fin: (vacío)
4. Click en "Iniciar"
5. Resultado: Procesa desde agosto 2025 en adelante

### Ejemplo 4: Solo Fecha Fin
1. Click en "🚀 Iniciar Conciliación"
2. Fecha Inicio: (vacío)
3. Fecha Fin: `2025-08-31`
4. Click en "Iniciar"
5. Resultado: Procesa hasta agosto 2025

## 🔄 Flujo Completo

```
Usuario → Click "Iniciar Conciliación"
       → Modal se abre
       → Ingresa fechas (opcional)
       → Click "Iniciar"
       → Frontend envía POST a /api/bank-reconciliation/reconcile
       → Backend procesa conciliación
       → Frontend recibe respuesta
       → Muestra resultado en modal
       → Auto-actualiza: transacciones, vouchers y sugerencias
       → Usuario puede cerrar modal
```

## 📊 Actualización Automática

Después de iniciar la conciliación exitosamente, la página actualiza automáticamente:
- ✅ Lista de transacciones no conciliadas
- ✅ Lista de vouchers aprobados
- ✅ Sugerencias de conciliación

## 🎯 Casos de Uso

### 1. Conciliación Mensual
```
Fecha Inicio: 2025-08-01
Fecha Fin: 2025-08-31
Uso: Conciliar transacciones de un mes específico
```

### 2. Conciliación Trimestral
```
Fecha Inicio: 2025-07-01
Fecha Fin: 2025-09-30
Uso: Conciliar transacciones de un trimestre
```

### 3. Conciliación Total
```
Fecha Inicio: (vacío)
Fecha Fin: (vacío)
Uso: Procesar todos los registros disponibles
```

### 4. Conciliación Desde Fecha
```
Fecha Inicio: 2025-08-01
Fecha Fin: (vacío)
Uso: Procesar todo desde agosto 2025
```

## 🐛 Manejo de Errores

### Error de Conexión
Si la API no está disponible:
```
- Modal muestra mensaje en rojo
- Botón se reactiva para reintentar
- Se recomienda verificar conexión con API
```

### Error de Validación
Si hay error en los datos:
```
- Modal muestra mensaje de error específico
- Usuario puede corregir fechas y reintentar
```

### Error Inesperado
```
- Se muestra mensaje de error genérico
- Error se registra en consola del navegador (F12)
```

## 💡 Tips

1. **Para mejor rendimiento:** Usa rangos de fechas específicos
2. **Para conciliación completa:** Deja ambos campos vacíos
3. **Revisa los resultados:** El modal muestra estadísticas detalladas
4. **Actualización automática:** Los datos se refrescan solos después del proceso
5. **Cierre del modal:** Puedes cerrar y los cambios persisten

## 🔍 Debugging

### Ver Request en DevTools
1. Abre DevTools (F12)
2. Ve a la pestaña "Network"
3. Click en "Iniciar Conciliación"
4. Busca el request a `/bank-reconciliation/reconcile`
5. Ve el "Payload" para ver los datos enviados

### Ver Response
En la misma petición de Network, ve:
- **Status:** Debería ser 200 (OK)
- **Response:** JSON con el resultado

### Console Logs
Si hay errores, se mostrarán en la consola:
```javascript
console.error('Error starting reconciliation:', err);
```

## 📝 Código Implementado

### Tipos TypeScript
```typescript
interface StartReconciliationRequest {
  startDate?: string;
  endDate?: string;
}

interface StartReconciliationResponse {
  success: boolean;
  message: string;
  matchesFound?: number;
  processedTransactions?: number;
  processedVouchers?: number;
}
```

### Servicio
```typescript
export const startReconciliation = async (
  data?: StartReconciliationRequest,
  signal?: AbortSignal
): Promise<StartReconciliationResponse>
```

### Hook
```typescript
const { start, reconciling, error } = useBankReconciliation();

await start({ startDate: '2025-08-01', endDate: '2025-08-31' });
```

## 🚀 Próximos Pasos

Después de iniciar la conciliación, puedes:
1. Ver las sugerencias automáticas generadas
2. Conciliar manualmente transacciones específicas
3. Usar conciliación en lote para múltiples coincidencias
4. Revisar las transacciones conciliadas

## 📞 Soporte

Si tienes problemas:
1. Verifica que la API esté corriendo
2. Revisa el indicador de API (esquina inferior derecha)
3. Abre la consola del navegador (F12) para ver errores
4. Revisa los logs del backend

---

**¡Listo para usar!** 🎉
