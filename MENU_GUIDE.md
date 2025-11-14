# Guía del Menú Hamburguesa y Navegación

## Inicio Rápido

### 1. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

Esto iniciará el servidor en `http://localhost:5173` (o el puerto que indique Vite).

### 2. Asegúrate que la API esté corriendo

La API debe estar corriendo en `http://localhost:3000` según la configuración del archivo `.env`:

```bash
VITE_API_BASE_URL=http://localhost:3000
```

## Navegación del Sistema

### Menú Hamburguesa

Se ha implementado un menú hamburguesa en la esquina superior izquierda con las siguientes opciones:

- **🏠 Inicio** - Página principal
- **📝 Vouchers** - Gestión de vouchers
- **💰 Transacciones Bancarias** - Carga y visualización de transacciones
- **🔄 Conciliación** - Conciliación bancaria manual y automática

### Acceso a las Funcionalidades

Hay dos formas de acceder a las funcionalidades de la API:

#### 1. Desde el Menú Hamburguesa
- Haz clic en el botón azul en la esquina superior izquierda
- Selecciona la opción deseada del menú lateral

#### 2. Desde los Botones de Acceso Rápido (Página de Inicio)
- **Botón Verde (📝 Vouchers)** - Acceso directo a vouchers
- **Botón Morado (💰 Transacciones)** - Acceso directo a transacciones
- **Botón Naranja (🔄 Conciliación)** - Acceso directo a conciliación

## Funcionalidades por Página

### 📝 Vouchers (`/vouchers`)

**Funciones disponibles:**
- ✅ Ver lista de vouchers pendientes (paginada)
- ✅ Crear nuevo voucher (botón "Crear Voucher")
- ✅ Aprobar voucher (botón "Aprobar" en cada fila)
- ✅ Eliminar voucher (botón "Eliminar" en cada fila)
- ✅ Paginación (botones "Anterior" y "Siguiente")

**Acciones de prueba:**
1. Haz clic en "Crear Voucher" para crear un voucher de ejemplo
2. Aprueba un voucher existente
3. Elimina un voucher
4. Navega entre páginas

**Endpoint consumido:**
- `GET /api/vouchers` - Obtener vouchers
- `POST /api/vouchers` - Crear voucher
- `PUT /api/vouchers/{id}` - Actualizar voucher
- `DELETE /api/vouchers/{id}` - Eliminar voucher

---

### 💰 Transacciones Bancarias (`/transactions`)

**Funciones disponibles:**
- ✅ Ver lista de transacciones no conciliadas
- ✅ Subir archivo de transacciones (CSV, Excel)
- ✅ Ver resultado de la importación
- ✅ Ver detalles de cada transacción

**Acciones de prueba:**
1. Selecciona un archivo (CSV o Excel) con transacciones bancarias
2. Haz clic en "Subir"
3. Observa el resultado de la importación (importadas, duplicadas, errores)
4. La lista de transacciones se actualizará automáticamente

**Endpoint consumido:**
- `POST /api/transactions-bank/upload` - Subir archivo
- `GET /api/transactions-bank` - Obtener transacciones

**Formato esperado del archivo:**
El archivo debe tener columnas como: fecha, descripción, referencia, débito, crédito, saldo

---

### 🔄 Conciliación Bancaria (`/reconciliation`)

**Funciones disponibles:**

#### 1. Conciliación Manual
- ✅ Seleccionar una transacción bancaria (panel izquierdo)
- ✅ Seleccionar un voucher aprobado (panel derecho)
- ✅ Hacer clic en "Conciliar" para vincularlos

#### 2. Conciliación Automática (Sugerencias)
- ✅ Ver coincidencias sugeridas por la API
- ✅ Seleccionar múltiples coincidencias (checkboxes)
- ✅ Conciliar en lote (botón "Conciliar Seleccionadas")
- ✅ Ver porcentaje de similitud de cada coincidencia

**Acciones de prueba:**
1. **Manual:**
   - Selecciona un radio button de una transacción
   - Selecciona un radio button de un voucher
   - Haz clic en "Conciliar"

2. **Automática:**
   - Marca los checkboxes de las sugerencias que quieras conciliar
   - Haz clic en "Conciliar Seleccionadas (N)"

**Endpoint consumido:**
- `POST /api/bank-reconciliation/reconcile` - Conciliar individual
- `POST /api/bank-reconciliation/bulk` - Conciliar en lote
- `GET /api/bank-reconciliation/suggestions` - Obtener sugerencias

---

## Estados de Carga y Errores

Todas las páginas muestran:
- **⏳ Estado de carga**: "Cargando..." mientras se obtienen datos
- **❌ Mensajes de error**: En cajas rojas si algo falla
- **✅ Mensajes de éxito**: En cajas verdes cuando las operaciones son exitosas

## Características Técnicas

### 1. Cancelación Automática
- Si cambias de página mientras se está cargando datos, la petición se cancela automáticamente

### 2. Recarga de Datos
- Después de cada acción (crear, actualizar, eliminar, conciliar), los datos se recargan automáticamente

### 3. Validaciones
- Los botones se deshabilitan mientras hay operaciones en curso
- Se muestran confirmaciones antes de eliminar

### 4. Paginación
- Las listas largas están paginadas (10 elementos por página por defecto)
- Puedes navegar entre páginas con los botones

## Probando la Integración

### Flujo de Prueba Completo:

1. **Crear Vouchers**
   - Ve a `/vouchers`
   - Crea 2-3 vouchers
   - Apruébalos

2. **Cargar Transacciones**
   - Ve a `/transactions`
   - Sube un archivo con transacciones bancarias
   - Verifica que se importaron correctamente

3. **Conciliar**
   - Ve a `/reconciliation`
   - Prueba la conciliación manual entre una transacción y un voucher
   - Observa las sugerencias automáticas
   - Prueba la conciliación en lote

4. **Verificar**
   - Vuelve a `/transactions` y verifica que las transacciones conciliadas tienen el estado "Conciliado"

## Personalización

### Cambiar el Puerto de la API

Edita el archivo `.env`:
```bash
VITE_API_BASE_URL=http://localhost:NUEVO_PUERTO
```

Luego reinicia el servidor de desarrollo:
```bash
npm run dev
```

### Modificar los Límites de Paginación

En los hooks (`src/hooks/use*.ts`), puedes cambiar:
```typescript
const [limit, setLimit] = useState(query?.limit || 10); // Cambiar 10 por otro número
```

## Solución de Problemas

### La API no responde
- Verifica que la API esté corriendo en el puerto correcto
- Revisa la consola del navegador (F12) para ver errores de red
- Asegúrate que el archivo `.env` tenga la URL correcta

### CORS Errors
- La API debe permitir peticiones desde `http://localhost:5173`
- Configura CORS en tu backend

### No se cargan los datos
- Abre la consola del navegador (F12)
- Ve a la pestaña "Network"
- Verifica que las peticiones se estén enviando correctamente
- Revisa los códigos de estado HTTP (200 = OK, 4xx/5xx = Error)

## Estructura de Rutas

```
/                   → Inicio (con acceso rápido)
/login              → Login (sin menú hamburguesa)
/vouchers           → Gestión de vouchers
/transactions       → Transacciones bancarias
/reconciliation     → Conciliación bancaria
```

## Próximos Pasos

- [ ] Implementar autenticación JWT
- [ ] Agregar filtros avanzados en las listas
- [ ] Implementar búsqueda en tiempo real
- [ ] Agregar gráficas y reportes
- [ ] Implementar notificaciones en tiempo real
