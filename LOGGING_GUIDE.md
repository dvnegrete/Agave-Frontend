# Guía de Logging - Inicio de Conciliación

## 🔍 Sistema de Logs Implementado

Se ha agregado un sistema completo de logging para rastrear el flujo de inicio de conciliación desde el frontend hasta la respuesta de la API.

## 📊 Niveles de Logging

### 1. **HTTP Client** (`src/utils/httpClient.ts`)
Registra todas las peticiones HTTP y respuestas:

```
🌐 [HTTP] POST http://localhost:3000/api/bank-reconciliation/reconcile
📡 [HTTP] Response Status: 200 OK
✅ [HTTP] Response Data: { success: true, message: "...", ... }
❌ [HTTP] Error Response: { error: "..." }
🚨 [HTTP] Request Failed: Error message
```

### 2. **Service Layer** (`src/services/bankReconciliationService.ts`)
Registra la capa de servicio:

```
🚀 [Service] Iniciando conciliación con datos: { startDate: "2025-08-01", endDate: "2025-08-31" }
🌐 [Service] Endpoint: /bank-reconciliation/reconcile
📦 [Service] Respuesta recibida de la API: { success: true, ... }
```

### 3. **Modal Component** (`src/components/StartReconciliationModal.tsx`)
Registra la interacción del usuario:

```
📤 Enviando petición de inicio de conciliación: { startDate: "2025-08-01" }
📥 Respuesta de la API: { success: true, message: "...", ... }
✅ Resultado del proceso: {
  success: true,
  message: "Conciliación iniciada exitosamente",
  matchesFound: 15,
  processedTransactions: 50,
  processedVouchers: 45
}
❌ Error al iniciar conciliación: Error message
```

## 🎯 Cómo Ver los Logs

### Paso 1: Abrir DevTools
1. En tu navegador, presiona `F12` o `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
2. Ve a la pestaña **Console**

### Paso 2: Filtrar Logs (Opcional)
Para ver solo los logs relacionados con conciliación, usa el filtro:
```
[HTTP] reconcile
```
O busca por emoji:
```
🚀
```

### Paso 3: Ejecutar el Flujo
1. Navega a `/reconciliation`
2. Click en "🚀 Iniciar Conciliación"
3. Opcionalmente ingresa fechas
4. Click en "Iniciar"
5. Observa la consola

## 📋 Ejemplo de Flujo Completo de Logs

Cuando inicias una conciliación con fechas, verás esta secuencia:

```javascript
// 1. Usuario hace click en "Iniciar"
📤 Enviando petición de inicio de conciliación: {
  startDate: "2025-08-01",
  endDate: "2025-08-31"
}

// 2. Service layer recibe la petición
🚀 [Service] Iniciando conciliación con datos: {
  startDate: "2025-08-01",
  endDate: "2025-08-31"
}
🌐 [Service] Endpoint: /bank-reconciliation/reconcile

// 3. HTTP client hace la petición
🌐 [HTTP] POST http://localhost:3000/api/bank-reconciliation/reconcile {
  body: {
    startDate: "2025-08-01",
    endDate: "2025-08-31"
  }
}

// 4. HTTP client recibe la respuesta
📡 [HTTP] Response Status: 200 OK
✅ [HTTP] Response Data: {
  success: true,
  message: "Conciliación iniciada exitosamente",
  matchesFound: 15,
  processedTransactions: 50,
  processedVouchers: 45
}

// 5. Service layer devuelve la respuesta
📦 [Service] Respuesta recibida de la API: {
  success: true,
  message: "Conciliación iniciada exitosamente",
  matchesFound: 15,
  processedTransactions: 50,
  processedVouchers: 45
}

// 6. Modal procesa la respuesta
📥 Respuesta de la API: {
  success: true,
  message: "Conciliación iniciada exitosamente",
  matchesFound: 15,
  processedTransactions: 50,
  processedVouchers: 45
}
✅ Resultado del proceso: {
  success: true,
  message: "Conciliación iniciada exitosamente",
  matchesFound: 15,
  processedTransactions: 50,
  processedVouchers: 45
}
```

## 🔴 Ejemplo de Error

Si hay un error, verás:

```javascript
// 1. HTTP error
📡 [HTTP] Response Status: 400 Bad Request
❌ [HTTP] Error Response: {
  error: "Invalid date format",
  message: "startDate must be in YYYY-MM-DD format"
}
🚨 [HTTP] Request Failed: Error: HTTP Error: 400 Bad Request

// 2. Modal captura el error
❌ Error al iniciar conciliación: Error: HTTP Error: 400 Bad Request
```

## 🎨 Copiar Logs desde la Consola

### Opción 1: Copy Object
1. En la consola, haz click derecho en el objeto
2. Selecciona "Copy object"
3. Pega en tu editor

### Opción 2: Console.table
Puedes modificar temporalmente un log para usar table:
```javascript
console.table(response);
```

### Opción 3: Guardar como Global
En la consola:
```javascript
copy(response) // Copia automáticamente al clipboard
```

## 🎯 Información Capturada

Cada nivel de log captura:

### HTTP Client
- ✅ URL completa del endpoint
- ✅ Método HTTP (POST, GET, etc.)
- ✅ Body enviado
- ✅ Status code de respuesta
- ✅ Headers de respuesta
- ✅ Datos JSON de respuesta
- ✅ Errores HTTP

### Service Layer
- ✅ Datos enviados al servicio
- ✅ Endpoint configurado
- ✅ Respuesta transformada

### Modal Component
- ✅ Datos del formulario (fechas)
- ✅ Respuesta de la API
- ✅ Resultado procesado
- ✅ Errores capturados

## ⏱️ Auto-Cierre del Modal

El modal se cierra automáticamente en estos casos:

1. **Éxito:** Se cierra después de 3 segundos si `response.success === true`
2. **Cancelar:** Se cierra inmediatamente al hacer click en "Cancelar"
3. **Manual:** Usuario puede cerrar haciendo click fuera del modal

### Deshabilitar Auto-Cierre (Para Debugging)

Si quieres ver el resultado más tiempo, comenta esta línea en `StartReconciliationModal.tsx`:

```typescript
// Línea 53-57
// if (response.success) {
//   setTimeout(() => {
//     handleClose();
//   }, 3000);
// }
```

## 🔍 Tips de Debugging

### 1. Usar Network Tab
Además de los logs de consola, usa la pestaña **Network** en DevTools:
1. Ve a pestaña "Network"
2. Filtra por "XHR" o "Fetch"
3. Busca la petición a `reconcile`
4. Click en la petición para ver:
   - **Headers:** Método, URL, headers
   - **Payload:** Datos enviados
   - **Preview:** Respuesta en formato legible
   - **Response:** Respuesta raw

### 2. Persistir Logs
Para mantener los logs después de recargar:
1. En DevTools Console
2. Click derecho
3. "Preserve log"

### 3. Timestamps
Para ver timestamps de los logs:
1. En DevTools Console
2. Click en ⚙️ (Settings)
3. Marca "Show timestamps"

### 4. Logs en Producción

**Importante:** Los `console.log` también aparecerán en producción. Para deshabilitarlos:

**Opción A - Comentar logs específicos:**
```typescript
// console.log('📤 Enviando petición...');
```

**Opción B - Usar variable de entorno:**
```typescript
if (import.meta.env.DEV) {
  console.log('📤 Enviando petición...');
}
```

**Opción C - Crear función de log condicional:**
```typescript
// src/utils/logger.ts
export const log = (...args: any[]) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

// Uso:
log('📤 Enviando petición...');
```

## 📸 Captura de Pantalla de Logs

Para compartir logs:
1. Abre DevTools Console
2. Presiona `Ctrl+Shift+P` (Windows/Linux) / `Cmd+Shift+P` (Mac)
3. Escribe "screenshot"
4. Selecciona "Capture area screenshot"
5. Selecciona el área de la consola

## 🔔 Verificación Rápida

Para verificar que los logs funcionan, abre la consola y ejecuta:

```javascript
// Deberías ver todos los niveles de log
console.log('Test de logging OK ✅');
```

## 📊 Formato de la Respuesta Esperada

La API debe devolver este formato:

```typescript
{
  success: boolean;
  message: string;
  matchesFound?: number;           // Opcional
  processedTransactions?: number;  // Opcional
  processedVouchers?: number;      // Opcional
}
```

Si la API devuelve un formato diferente, se verá en los logs:
```
✅ [HTTP] Response Data: { tu_formato_real }
```

## 🎯 Resumen de Emojis en Logs

| Emoji | Significado |
|-------|-------------|
| 🌐 | HTTP Request |
| 📡 | HTTP Response Status |
| ✅ | Respuesta exitosa |
| ❌ | Error de respuesta |
| 🚨 | Fallo de petición |
| 🚀 | Inicio de servicio |
| 📦 | Datos del servicio |
| 📤 | Envío desde modal |
| 📥 | Recepción en modal |

## 🔧 Personalizar Logs

Para agregar más información a los logs, modifica:

```typescript
// En StartReconciliationModal.tsx
console.log('📤 Enviando petición...', {
  data,
  timestamp: new Date().toISOString(),
  userId: 'current-user-id' // Si tienes auth
});
```

---

**¡Sistema de logging completo implementado!** 📊✅
