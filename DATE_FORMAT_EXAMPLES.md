# Ejemplos de Formato de Fechas

## 🎯 Función Implementada: `useFormatDate`

Ubicación: `src/hooks/useFormatDate.ts`

### 📝 Formato de Salida

**Entrada**: Fecha ISO de PostgreSQL (ej: `"2025-09-05T00:00:00.000Z"`)  
**Salida**: Formato español legible (ej: `"05-septiembre-2025"`)

### 🧪 Ejemplos de Transformación

| Entrada (PostgreSQL) | Salida (Formateada) |
|---------------------|---------------------|
| `"2025-01-15T00:00:00.000Z"` | `"15-enero-2025"` |
| `"2025-02-28T00:00:00.000Z"` | `"28-febrero-2025"` |
| `"2025-03-10T00:00:00.000Z"` | `"10-marzo-2025"` |
| `"2025-04-20T00:00:00.000Z"` | `"20-abril-2025"` |
| `"2025-05-05T00:00:00.000Z"` | `"05-mayo-2025"` |
| `"2025-06-12T00:00:00.000Z"` | `"12-junio-2025"` |
| `"2025-07-25T00:00:00.000Z"` | `"25-julio-2025"` |
| `"2025-08-30T00:00:00.000Z"` | `"30-agosto-2025"` |
| `"2025-09-05T00:00:00.000Z"` | `"05-septiembre-2025"` |
| `"2025-10-18T00:00:00.000Z"` | `"18-octubre-2025"` |
| `"2025-11-22T00:00:00.000Z"` | `"22-noviembre-2025"` |
| `"2025-12-31T00:00:00.000Z"` | `"31-diciembre-2025"` |

### 🛡️ Manejo de Casos Especiales

| Entrada | Salida |
|---------|--------|
| `null` | `"N/A"` |
| `undefined` | `"N/A"` |
| `""` (string vacío) | `"N/A"` |
| `"fecha-invalida"` | `"Fecha inválida"` |

### 📍 Ubicaciones de Uso

La función `useFormatDate` se utiliza en todas las tablas de `BankReconciliation.tsx`:

#### 1. Tabla "Conciliados" (línea 239)
```typescript
<td>{useFormatDate(item.date)}</td>
```

#### 2. Tabla "Pendientes" (línea 270)
```typescript
<td>{useFormatDate(item.date)}</td>
```

#### 3. Tabla "Sobrantes" (línea 303)
```typescript
<td>{useFormatDate(item.date)}</td>
```

#### 4. Cards "Validación Manual"
- Header del voucher (línea 324):
  ```typescript
  <p>Fecha: {useFormatDate(item.date)}</p>
  ```
- Detalles de matches (línea 340):
  ```typescript
  Fecha: {useFormatDate(match.date)} | Score: ...
  ```

### 🔧 Funciones Disponibles

#### 1. `useFormatDate(dateString)`
**Formato**: DD-mes-YYYY (en español)  
**Ejemplo**: `"05-septiembre-2025"`

```typescript
import { useFormatDate } from '../hooks/useFormatDate';

const fechaFormateada = useFormatDate("2025-09-05T00:00:00.000Z");
// Resultado: "05-septiembre-2025"
```

#### 2. `useFormatDateShort(dateString)`
**Formato**: DD/MM/YYYY  
**Ejemplo**: `"05/09/2025"`

```typescript
import { useFormatDateShort } from '../hooks/useFormatDate';

const fechaCorta = useFormatDateShort("2025-09-05T00:00:00.000Z");
// Resultado: "05/09/2025"
```

### 📊 Implementación

```typescript
const MESES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

export const useFormatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = MESES_ES[date.getMonth()];
    const anio = date.getFullYear();
    
    return `${dia}-${mes}-${anio}`;
  } catch (error) {
    return 'Fecha inválida';
  }
};
```

### ✅ Ventajas

1. **Legibilidad**: Fechas más fáciles de leer en español
2. **Consistencia**: Todas las fechas usan el mismo formato
3. **Robustez**: Maneja errores y casos especiales
4. **Type-safe**: TypeScript valida los tipos
5. **Reutilizable**: Se puede usar en cualquier componente

### 🎨 Antes vs Después

**Antes:**
```
Fecha: 2025-09-05T00:00:00.000Z
```

**Después:**
```
Fecha: 05-septiembre-2025
```

---

✅ **Estado**: Implementado  
🏗️ **Build**: Exitoso  
📝 **Documentación**: Completa
