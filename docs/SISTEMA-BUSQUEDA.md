# 🔍 Sistema de Búsqueda Dinámico - ShopHub

## 📖 Descripción General

El sistema de búsqueda de ShopHub permite a los usuarios buscar productos en tiempo real directamente desde MercadoLibre, con scraping dinámico y resultados instantáneos.

## 🚀 Características Principales

### ✨ Búsqueda en Tiempo Real
- **Scraping Dinámico**: Cada búsqueda dispara una petición real a MercadoLibre
- **Resultados Actualizados**: Siempre obtienes los productos más recientes
- **Categorización Automática**: Detecta si es tecnología o perfume por keywords

### 🎯 Búsqueda Inteligente
- **Mínimo 2 caracteres**: Evita búsquedas demasiado cortas
- **Keywords Relevantes**: Busca por título, marca y categoría
- **Fallback Local**: Si el scraping falla, busca en datos locales

### 🔄 Sistema de Fallback
1. **Primero**: Intenta scraping en tiempo real
2. **Segundo**: Si falla, busca en productos locales
3. **Tercero**: Si no hay resultados, muestra productos similares

## 🛠️ Arquitectura del Sistema

### Componentes Principales

#### 1. **SearchBar Component** (`components/SearchBar.tsx`)
```tsx
// Características:
- Input con placeholder descriptivo
- Loading states
- Feedback visual al escribir
- Soporte para tecla Enter
- Deshabilitado si está vacío
```

#### 2. **Search Scraper** (`lib/search-scraper.ts`)
```typescript
// Funcionalidad:
- HTTP request a MercadoLibre
- Múltiples selectores CSS
- Limpieza de datos
- Detección automática de categoría
- Manejo de errores
```

#### 3. **Search Page** (`app/search/ClientPage.tsx`)
```tsx
// Lógica:
- Server + Client components
- Loading states
- Filtros dinámicos
- URL sync
- Suspense para mejor UX
```

## 🗂️ Flujo de Búsqueda

### 1. Usuario Inicia Búsqueda
```
Usuario escribe → "auriculares bluetooth"
↓
SearchBar detecta input (mínimo 2 caracteres)
↓
Muestra feedback: "💡 Presiona Enter para buscar..."
↓
Usuario presiona Enter
```

### 2. Proceso de Scraping
```
Router.push('/search?q=auriculares+bluetooth')
↓
ClientPage recibe query
↓
searchProducts() se ejecuta
↓
Request a: https://www.mercadolibre.com.ar/jm/search?as_word=auriculares+bluetooth
↓
Parse HTML con Cheerio
↓
Extrae: título, precio, imagen, URL
↓
Detecta categoría por keywords
↓
Retorna array de productos
```

### 3. Resultados y Filtros
```
Productos encontrados → ProductGrid
↓
Aplicar filtros (precio, marca, rating)
↓
Ordenar según selección
↓
Mostrar resultados
↓
Sincronizar filtros con URL
```

## 🎨 Experiencia de Usuario

### Estados de Búsqueda

#### 🔍 **Estado Inicial**
- Input vacío
- Botón deshabilitado
- Sin feedback

#### ⌨️ **Escribiendo**
- Input con texto
- Feedback visual: "💡 Presiona Enter..."
- Botón habilitado

#### ⏳ **Buscando**
- Loading spinner
- Texto: "Buscando productos..."
- Input deshabilitado temporalmente

#### ✅ **Resultados Encontrados**
- Grid de productos
- Contador: "Mostrando X resultados"
- Filtros funcionales

#### ❌ **Sin Resultados**
- Mensaje descriptivo
- Productos similares sugeridos
- Opción para modificar búsqueda

## 🔧 Configuración y Personalización

### Modificar Query de Búsqueda
```typescript
// En lib/search-scraper.ts
const searchUrl = `https://www.mercadolibre.com.ar/jm/search?as_word=${encodeURIComponent(query.trim())}`;
```

### Añadir Nuevas Categorías
```typescript
// Detección automática en search-scraper.ts
if (lowerQuery.includes('perfume') || lowerQuery.includes('fragancia')) {
  category = {
    id: 'perfumes',
    name: 'Perfumes',
    slug: 'perfumes',
    icon: '🌸',
    color: 'bg-pink-500'
  };
}
```

### Personalizar Selectores CSS
```typescript
// Múltiples patrones soportados
const selectors = [
  '.ui-search-layout__item',      // Selector actual
  '.poly-card__container',        // Selector alternativo
  '.ui-search-result__wrapper',   // Selector fallback
  '[data-testid="result-item"]'   // Selector por data attribute
];
```

## 📊 Métricas y Monitoreo

### Performance
- **Timeout**: 10 segundos por búsqueda
- **Límite**: 20 resultados por búsqueda
- **Cache**: No hay cache (siempre fresco)

### Errores Manejados
- **Network errors**: Fallback a datos locales
- **Parsing errors**: Múltiples selectores
- **Empty results**: Búsqueda local alternativa

## 🚨 Troubleshooting

### Problema: Búsqueda no retorna resultados
**Solución**:
1. Verificar conexión a internet
2. Revisar selectores CSS en MercadoLibre
3. Checkear headers HTTP
4. Probar con queries simples

### Problema: Categorización incorrecta
**Solución**:
1. Añadir más keywords en `search-scraper.ts`
2. Implementar ML para clasificación
3. Usar categorías de MercadoLibre

### Problema: Performance lenta
**Solución**:
1. Reducir timeout
2. Limitar número de resultados
3. Implementar cache
4. Usar CDN

## 🔄 Mejoras Futuras

### Sugerencias Autocompletar
```typescript
// Implementar autocomplete
const suggestions = await getSearchSuggestions(query);
// Mostrar dropdown con opciones
```

### Búsqueda por Voz
```tsx
// Usar Web Speech API
const recognition = new webkitSpeechRecognition();
// "Buscar auriculares por voz"
```

### Historial de Búsquedas
```typescript
// Guardar búsquedas anteriores
const searchHistory = localStorage.getItem('searchHistory');
// Mostrar búsquedas recientes
```

### Filtros Avanzados
- Rango de fechas
- Condición (nuevo/usado)
- Envío gratis
- Mejor vendedor

## 📱 Responsive Design

### Mobile
- Input full-width
- Teclado numérico para precios
- Swipe para filtros
- Pull-to-refresh

### Desktop
- Atajos de teclado
- Hover states
- Tooltips informativos
- Búsqueda avanzada

## 🎯 Ejemplos de Uso

### Búsqueda Simple
```
Input: "iphone"
Resultados: 15 productos de tecnología
Categoría: Automática → Tecnología
```

### Búsqueda Específica
```
Input: "perfume chanel n°5"
Resultados: 8 productos de perfumes
Categoría: Automática → Perfumes
```

### Búsqueda con Error
```
Input: "xyz"
Resultados: 0 productos
Fallback: Búsqueda local similar
```

## 📈 Análisis y Mejora

### Métricas a Monitorear
- **Tiempo de respuesta**: < 3 segundos
- **Tasa de éxito**: > 95%
- **Relevancia**: CTR en resultados
- **Conversiones**: Compras desde búsqueda

### A/B Testing
- **Posición de búsqueda**: Header vs sidebar
- **Texto del placeholder**: Múltiples variantes
- **Número de resultados**: 10 vs 20 vs 50

---

## 🎉 Conclusión

El sistema de búsqueda de ShopHub proporciona:
- ✅ Resultados en tiempo real
- ✅ Scraping dinámico
- ✅ Experiencia fluida
- ✅ Fallback robusto
- ✅ Filtros avanzados

**Los usuarios pueden buscar cualquier producto y obtener resultados actualizados al instante desde MercadoLibre.** 🚀
