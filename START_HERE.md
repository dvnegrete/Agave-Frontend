# 🚀 START HERE - Guía de Inicio Rápido

## ¡Todo está listo para probar!

### 📋 Requisitos Previos

1. ✅ La API debe estar corriendo en `http://localhost:3000`
2. ✅ Node.js instalado (ya lo tienes)
3. ✅ Dependencias instaladas (`npm install` - ya hecho)

### 🎯 Iniciar en 3 Pasos

#### 1️⃣ Asegúrate que tu API esté corriendo
```bash
# En otra terminal, inicia tu API backend
# La API debe estar en http://localhost:3000
```

#### 2️⃣ Inicia el frontend
```bash
npm run dev
```

#### 3️⃣ Abre el navegador
```
http://localhost:5173
```

### 🎨 Interfaz Visual

Al abrir la aplicación verás:

1. **Menú Hamburguesa** (esquina superior izquierda)
   - Botón azul con 3 líneas
   - Click para abrir el menú lateral

2. **Botones de Acceso Rápido** (en la página de inicio)
   - 📝 Verde: Vouchers
   - 💰 Morado: Transacciones
   - 🔄 Naranja: Conciliación

3. **Indicador de API** (esquina inferior derecha)
   - Verde: API conectada ✅
   - Rojo: API desconectada ❌

### 🧪 Prueba Rápida

#### Test 1: Vouchers (2 minutos)
1. Click en el menú hamburguesa (esquina superior izquierda)
2. Selecciona "📝 Vouchers"
3. Click en "Crear Voucher" → Se crea un voucher de prueba
4. Click en "Aprobar" en un voucher
5. Click en "Eliminar" en un voucher
6. Navega con "Anterior" y "Siguiente"

✅ **Resultado esperado:** Deberías ver la lista actualizada después de cada acción

#### Test 2: Transacciones (2 minutos)
1. Click en "💰 Transacciones Bancarias" en el menú
2. Selecciona un archivo CSV o Excel con transacciones
3. Click en "Subir"
4. Observa el resultado: importadas/duplicadas/errores
5. Ve la tabla de transacciones actualizada

✅ **Resultado esperado:** Archivo procesado y tabla con transacciones

#### Test 3: Conciliación (4 minutos)
1. Click en "🔄 Conciliación" en el menú
2. **Iniciar Conciliación (NUEVO):**
   - Click en el botón verde "🚀 Iniciar Conciliación"
   - Opcionalmente ingresa fechas (Inicio y Fin)
   - Click en "Iniciar"
   - Observa el resultado con estadísticas
3. **Prueba Manual:**
   - Selecciona una transacción (radio button izquierdo)
   - Selecciona un voucher (radio button derecho)
   - Click en "Conciliar"
4. **Prueba Automática:**
   - Marca checkboxes de sugerencias
   - Click en "Conciliar Seleccionadas"

✅ **Resultado esperado:** Conciliación iniciada y transacciones conciliadas exitosamente

### 🎛️ Navegación

**Usar el Menú Hamburguesa:**
```
1. Click en el botón azul (esquina superior izquierda)
2. Se abre el menú lateral
3. Click en cualquier opción:
   - 🏠 Inicio
   - 📝 Vouchers
   - 💰 Transacciones Bancarias
   - 🔄 Conciliación
4. Para cerrar: Click fuera del menú o en cualquier opción
```

**Usar Botones de Acceso Rápido:**
```
1. Desde la página de inicio
2. Click en cualquier botón de color
3. Vas directo a esa funcionalidad
```

### 🔍 Verificar Conexión con API

**Indicador Visual:**
- Esquina inferior derecha
- Verde + "API: Conectada" → ✅ Todo bien
- Rojo + "API: Desconectada" → ❌ Revisar backend

**Si está desconectada:**
1. Verifica que la API esté corriendo: `http://localhost:3000`
2. Revisa el archivo `.env`:
   ```
   VITE_API_BASE_URL=http://localhost:3000
   ```
3. Reinicia el servidor: `Ctrl+C` y luego `npm run dev`

### 📊 Datos de Prueba

**Crear Voucher:**
- Click en "Crear Voucher" genera automáticamente un voucher con datos de ejemplo
- No necesitas llenar formularios

**Transacciones:**
- Prepara un archivo CSV o Excel con columnas: fecha, descripción, referencia, débito, crédito, saldo

### 🎨 Funcionalidades Implementadas

| Página | Acciones Disponibles | Endpoint API |
|--------|---------------------|--------------|
| **Vouchers** | Listar, Crear, Aprobar, Eliminar, Paginar | GET/POST/PUT/DELETE `/api/vouchers` |
| **Transacciones** | Listar, Subir archivo | GET `/api/transactions-bank`, POST `/api/transactions-bank/upload` |
| **Conciliación** | **🆕 Iniciar proceso**, Manual, Automática (sugerencias), En lote | POST `/api/bank-reconciliation/reconcile` |

### ⚡ Características Especiales

✨ **Auto-refresh:** Después de cada acción, los datos se recargan automáticamente
✨ **Estados de carga:** Indicadores visuales mientras se procesan peticiones
✨ **Manejo de errores:** Mensajes claros en cajas rojas
✨ **Confirmaciones:** Antes de eliminar, se pide confirmación
✨ **Responsive:** Funciona en desktop, tablet y mobile
✨ **Paginación:** Solo carga 10 elementos a la vez para mejor rendimiento

### 🐛 Solución Rápida de Problemas

| Problema | Solución |
|----------|----------|
| API desconectada (rojo) | 1. Inicia la API en puerto 3000<br>2. Verifica `.env` |
| Menú no abre | Recarga la página (F5) |
| No se cargan datos | Abre DevTools (F12) → Network → Ve errores |
| CORS Error | Configura CORS en el backend |
| Botones no responden | Espera a que termine la operación actual |

### 📱 Atajos de Teclado

- `F5` → Recargar página
- `F12` → Abrir DevTools (para debugging)
- `Ctrl + Click` → Abrir enlace en nueva pestaña

### 📚 Documentación Adicional

- **MENU_GUIDE.md** → Guía detallada del menú y navegación
- **API_INTEGRATION.md** → Documentación completa de la integración API
- **QUICK_START.md** → Guía de desarrollo con ejemplos de código
- **IMPLEMENTATION_SUMMARY.md** → Resumen técnico de lo implementado

### 🎯 Checklist de Verificación

Antes de probar, verifica:

- [ ] ✅ API corriendo en `http://localhost:3000`
- [ ] ✅ Frontend corriendo (`npm run dev`)
- [ ] ✅ Navegador abierto en `http://localhost:5173`
- [ ] ✅ Badge de API en verde
- [ ] ✅ Menú hamburguesa visible (esquina superior izquierda)

### 🎉 ¡Listo para Probar!

Si todo está verde, ya puedes:
1. ✅ Click en el menú hamburguesa
2. ✅ Navegar entre las páginas
3. ✅ Probar cada funcionalidad
4. ✅ Ver los datos de la API en tiempo real

### 💡 Tips

- El indicador de API se actualiza cada 30 segundos
- Las tablas muestran 10 elementos por página
- Los botones se deshabilitan durante operaciones
- Las confirmaciones previenen errores accidentales

---

**¿Listo?** Ejecuta `npm run dev` y comienza a probar 🚀
