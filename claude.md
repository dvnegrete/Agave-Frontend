# Claude Instructions – Proyecto React

## Contexto del proyecto

Este es un proyecto **React** ya avanzado y en producción activa. Claude Code se utiliza como apoyo continuo para implementar features, refactors y mejoras de calidad.

El objetivo principal es:

- Mantener **consistencia arquitectónica**
- Mejorar la **composición de componentes**
- Priorizar **simplicidad, legibilidad y reutilización**

Claude debe **adaptarse al código existente** y no imponer estructuras genéricas.

---

## Arquitectura (OBLIGATORIO)

La arquitectura actual del proyecto **debe respetarse estrictamente**.

Claude debe:

- Analizar la estructura existente antes de crear nuevos archivos
- Ubicar cada nuevo componente, hook o utilidad en la capa correcta
- Reutilizar código existente antes de crear algo nuevo

❌ Prohibido:

- Reorganizar carpetas sin indicación explícita
- Crear abstracciones paralelas
- Saltarse capas “por conveniencia”

Si hay dudas, **preguntar o asumir la opción más conservadora**.

---

## Componentes React – Principios clave

### 1. Simplicidad extrema

- Los componentes deben ser **lo más simples posibles**
- Idealmente **una sola responsabilidad**
- Preferir **una sola función por archivo**

Ejemplo preferido:

```tsx
function UserAvatar({ user }) {
  return (
    <img src={user.avatar} alt={user.name} />
  )
}
```

Evitar:

- Componentes gigantes
- Lógica compleja mezclada con JSX
- Múltiples responsabilidades en un mismo componente

---

### 2. Composición sobre complejidad

Claude debe **buscar activamente** oportunidades de composición:

- Componentes pequeños y reutilizables
- Contenedores que orquestan componentes simples
- Evitar condicionales complejos dentro del JSX

Preferir:

```tsx
<Page>
  <Header />
  <Content />
  <Footer />
</Page>
```

En lugar de:

```tsx
<Page>
  {condition ? <A /> : <B />}
</Page>
```

---

## Estilos y UI (MUY IMPORTANTE)

### Fuente principal de estilos

- La **colorimetría y estilos base** del proyecto están definidos en:

```
src/index.css
```

Este archivo contiene **clases personalizadas basadas en Tailwind**.

---

### Reglas de uso de Tailwind

✅ Permitido:

- Usar clases de Tailwind para:
  - Layout (flex, grid, spacing, sizing)
  - Tipografía (si no define colores)
  - Responsividad

❌ Prohibido:

- Definir colores directamente con Tailwind (`text-red-500`, `bg-blue-600`, etc.)
- Introducir nuevas decisiones de color fuera de `src/index.css`

👉 **Toda colorimetría debe provenir de clases personalizadas ya definidas**.

Si un color o variante no existe:

- Señalarlo
- Proponer extensión en `index.css`
- No improvisar colores

---

## Convenciones de componentes visuales

- Los componentes visuales deben:
  - Ser predecibles
  - No contener lógica de negocio
  - Recibir datos por props

Ejemplo:

```tsx
function Button({ children, onClick }) {
  return (
    <button className="btn-primary" onClick={onClick}>
      {children}
    </button>
  )
}
```

---

## Tipado TypeScript (OBLIGATORIO)

### Principios de tipado

Este proyecto usa **TypeScript con tipado fuerte**.

Claude debe:

- Tipar explícitamente **props, estados, hooks y retornos**
- Usar `interface` o `type` bien definidos
- Preferir tipos del dominio antes que tipos genéricos

❌ Prohibido:

- `any`
- `unknown`
- `as any`
- Tipados implícitos en lógica relevante

Si el tipo no está claro:

- Definirlo explícitamente
- Inferirlo a partir del dominio o datos existentes
- Preguntar o proponer el tipo más estricto posible

---

### Props y componentes

Todos los componentes deben:

- Definir un tipo o interface para sus props
- Evitar props "catch-all"

Ejemplo correcto:

```ts
interface ButtonProps {
  variant: 'primary' | 'secondary'
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}

function Button({ variant, disabled = false, onClick, children }: ButtonProps) {
  // ...
}
```

---

### Hooks

- Los hooks personalizados deben:
  - Tipar argumentos y retorno
  - Exponer contratos claros

Ejemplo:

```ts
interface UseUserResult {
  user: User | null
  isLoading: boolean
  error: UserError | null
}

function useUser(id: UserId): UseUserResult {
  // ...
}
```

---

### Datos y dominio

- Definir tipos de dominio en archivos dedicados cuando aplique
- Reutilizar tipos existentes antes de crear nuevos
- Evitar duplicación de shapes

Preferir:

```ts
type UserId = string

interface User {
  id: UserId
  name: string
  email: string
}
```

En lugar de objetos inline sin tipo.

---

### Excepciones

Solo se permite usar `unknown`:

- En límites externos (APIs, JSON.parse)
- Siempre seguido de validación o narrowing

Nunca debe propagarse `unknown` dentro del dominio.

---

## Estado y lógica

- Separar lógica de UI siempre que sea posible
- Preferir hooks personalizados para lógica reutilizable
- No duplicar lógica existente

Claude debe:

- Buscar hooks existentes antes de crear uno nuevo
- Extraer lógica compleja fuera del JSX

---

## Refactors

Al refactorizar:

- ❌ No cambiar comportamiento
- ❌ No cambiar API pública sin aviso
- ✅ Mejorar legibilidad
- ✅ Reducir complejidad
- ✅ Aumentar reutilización

Claude debe explicar **por qué** el refactor mejora el código.

---

## Testing (si aplica en el proyecto)

- Los componentes deben ser testeables
- Evitar lógica imposible de mockear
- Priorizar tests de comportamiento, no de implementación

---

## Qué NO hacer

- No introducir nuevas librerías de UI
- No redefinir estilos existentes
- No crear componentes “por si acaso”
- No escribir código innecesariamente abstracto

---

## Modo de trabajo esperado de Claude

Antes de implementar:

1. Analizar arquitectura existente
2. Identificar patrones ya usados
3. Proponer composición

Durante la implementación:

- Código claro
- JSX limpio
- Clases consistentes con `index.css`

Después:

- Revisar si el componente puede ser más simple
- Revisar si puede componerse mejor

---

## Principio final

> Si el componente parece complicado, probablemente está mal diseñado.

Preferir siempre:

- Simple > inteligente
- Composición > condicionales
- Consistencia > creatividad

