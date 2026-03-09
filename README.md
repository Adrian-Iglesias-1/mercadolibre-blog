# 🛍️ ShopHub - Plataforma Moderna de Recomendaciones

Una plataforma moderna para descubrir y comprar los mejores productos de MercadoLibre con sistema de afiliados, búsqueda avanzada y blog integrado.

## ✨ Características Principales

### 🛒 E-commerce Features
- **Múltiples Categorías**: Tecnología, Perfumes y Blog
- **Búsqueda Avanzada**: Búsqueda global con filtros inteligentes
- **Sistema de Filtros**: Por categoría, precio, marca y rating
- **Ordenamiento**: Por precio, rating y relevancia
- **Product Cards Modernas**: Con badges, ratings y descuentos
- **Responsive Design**: Optimizado para móviles y desktop

### 📝 Blog System
- **Markdown Support**: Artículos en formato Markdown
- **Frontmatter**: Metadatos estructurados
- **SEO Optimized**: URLs amigables y meta tags
- **Categorización**: Artículos por categorías
- **Featured Posts**: Artículos destacados en portada

### 🔧 Technical Features
- **Next.js 14** con App Router
- **TypeScript** para type safety
- **TailwindCSS** para estilos modernos
- **Web Scraping** Automatizado con Axios + Cheerio
- **Client/Server Components** Arquitectura optimizada
- **Static Generation** para mejor performance

## 🚀 Quick Start

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd mercadolibre-blog

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Acceso
- **Aplicación**: http://localhost:3000
- **Tecnología**: http://localhost:3000/tecnologia
- **Perfumes**: http://localhost:3000/perfumes
- **Blog**: http://localhost:3000/blog
- **Búsqueda**: http://localhost:3000/search?q=producto

## 📁 Estructura del Proyecto

```
mercadolibre-blog/
├── app/                          # Páginas Next.js 14
│   ├── layout.tsx                # Layout principal
│   ├── page.tsx                  # Homepage
│   ├── tecnologia/               # Categoría tecnología
│   │   ├── page.tsx             # Server component
│   │   └── ClientPage.tsx       # Client component
│   ├── perfumes/                 # Categoría perfumes
│   │   ├── page.tsx
│   │   └── ClientPage.tsx
│   ├── blog/                     # Blog
│   │   ├── page.tsx             # Listado de artículos
│   │   └── [slug]/page.tsx     # Artículo individual
│   └── search/                   # Búsqueda
│       └── page.tsx
├── components/                    # Componentes React
│   ├── Navigation.tsx            # Navegación principal
│   ├── SearchBar.tsx            # Barra de búsqueda
│   ├── ProductCard.tsx           # Card de producto
│   ├── ProductGrid.tsx           # Grid de productos
│   ├── Filters.tsx               # Sistema de filtros
│   └── HeroSection.tsx          # Hero section
├── lib/                         # Utilidades y scrapers
│   ├── scraper.ts               # Scraper de tecnología
│   ├── scrapers/                # Scrapers específicos
│   │   └── perfume-scraper.ts   # Scraper de perfumes
│   ├── categories.ts             # Definición de categorías
│   └── blog.ts                  # Gestión de blog
├── types/                       # Tipos TypeScript
│   └── index.ts                 # Definiciones principales
├── data/                        # Datos locales
│   ├── products.json            # Productos de tecnología
│   └── perfumes.json            # Productos de perfumes
├── content/blog/                # Artículos de blog
├── docs/                        # Documentación
│   └── CREAR-ENTRADA-BLOG.md  # Guía para crear artículos
└── public/                      # Assets estáticos
```

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 14** - React framework con App Router
- **TypeScript** - Type safety y mejor DX
- **TailwindCSS** - Utility-first CSS framework
- **Lucide Icons** - Iconos modernos

### Backend/Scraping
- **Axios** - Cliente HTTP
- **Cheerio** - HTML parsing
- **Node.js** - Runtime environment

### Desarrollo
- **ESLint** - Linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS compatibility

## 📝 Crear Artículos de Blog

### Guía Rápida
1. Crea archivo en `content/blog/mi-articulo.md`
2. Añade frontmatter con metadatos
3. Escribe contenido en Markdown
4. Guarda y actualiza el servidor

### Ejemplo
```markdown
---
title: "Título del Artículo"
slug: "url-amigable"
excerpt: "Breve descripción"
author: "Autor"
publishedAt: "2024-03-09T00:00:00Z"
category: "tecnologia"
tags: "tag1,tag2,tag3"
featured: "true"
imageUrl: "https://ejemplo.com/imagen.jpg"
---

# Contenido del artículo...

*Este artículo participa en el programa de afiliados.*
```

📖 **Documentación completa**: `docs/CREAR-ENTRADA-BLOG.md`

## 🎯 Categorías Disponibles

### 💻 Tecnología
- Auriculares gamer
- Gadgets y accesorios
- Componentes PC
- Smartphones

### 🌸 Perfumes
- Fragancias masculinas
- Fragancias femeninas
- Perfumes de lujo
- Sets de regalo

### 📝 Blog
- Guías de compra
- Reseñas de productos
- Comparativas
- Tutoriales

## 🔍 Sistema de Búsqueda y Filtros

### Búsqueda Global
- Búsqueda por título, marca o categoría
- URLs amigables: `/search?q=producto`
- Resultados en tiempo real

### Filtros Avanzados
- **Categoría**: Filtrar por tipo de producto
- **Rango de Precio**: Mínimo y máximo deslizantes
- **Marca**: Búsqueda textual por marca
- **Rating**: Calificación mínima con estrellas
- **Ordenamiento**: Precio ascendente/descendente, rating, relevancia

## 🛒 Integración con MercadoLibre

### Scraping Automatizado
- **Tecnología**: `scrapeMercadoLibre('auriculares gamer')`
- **Perfumes**: `scrapePerfumes('perfume')`
- **Headers reales**: User-Agent y headers de navegador
- **Selectores múltiples**: Compatible con cambios en ML

### Enlaces de Afiliado
- URLs directas a productos de MercadoLibre
- Tracking automático de conversiones
- Enlaces `click1.mercadolibre.com.ar` cuando están disponibles

### Datos Locales
- **Fallback**: Archivos JSON como backup
- **Performance**: Evita multiple scraping
- **Offline**: Funciona sin conexión inicial

## 🎨 Diseño y UX

### Sistema de Diseño
- **Colores de marca**: Amarillo MercadoLibre (#FFE600)
- **Categorías codificadas**: Azul tecnología, Rosa perfumes, Púrpura blog
- **Responsive**: Mobile-first design
- **Interacciones**: Hover effects, transiciones suaves

### Componentes Reutilizables
- **ProductCard**: Badge de categoría, rating, descuento
- **Filters**: Interactivos con URL sync
- **Navigation**: Mobile menu, sticky header
- **SearchBar**: Autocomplete, loading states

## 🚀 Deployment

### Build para Producción
```bash
# Build optimizado
npm run build

# Start producción
npm start
```

### Variables de Entorno
```bash
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://tudominio.com
```

## 📊 Performance y SEO

### Optimizaciones
- **Static Generation**: Páginas estáticas cuando es posible
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automático por routes
- **Meta Tags**: Dinámicos por página

### SEO Features
- **URLs amigables**: `/categoria/slug`
- **Meta descriptions**: Únicas por página
- **Structured Data**: Product schema
- **Open Graph**: Social sharing

## 🧪 Testing

### Desarrollo Local
```bash
# Linting
npm run lint

# Type checking
npx tsc --noEmit
```

### Testing Manual
- **Responsive**: Mobile, tablet, desktop
- **Filtros**: Funcionalidad completa
- **Búsqueda**: Resultados correctos
- **Navegación**: Todos los enlaces funcionan

## 🔄 Actualización de Productos

### Scraping Automático
Los productos se actualizan automáticamente al visitar:
- `/tecnologia` - Actualiza productos de tecnología
- `/perfumes` - Actualiza productos de perfumes

### Manual
```bash
# Forzar scraping de tecnología
node -e "require('./lib/scraper.ts').scrapeMercadoLibre()"

# Forzar scraping de perfumes  
node -e "require('./lib/scrapers/perfume-scraper.ts').scrapePerfumes()"
```

## 🤝 Contribución

### Flujo de Trabajo
1. Fork del repositorio
2. Branch feature/nombre-feature
3. Commits descriptivos
4. Pull request con descripción

### Estándares de Código
- **TypeScript**: Siempre tipado
- **Components**: Reutilizables y testeados
- **Estilos**: TailwindCSS classes
- **Commits**: Convención conventional

## 📄 Licencia

Este proyecto es para fines educativos y demostración de técnicas de web scraping y desarrollo web moderno.

## 🆘 Troubleshooting

### Problemas Comunes

#### Error: "Event handlers cannot be passed to Client Component"
**Solución**: Usar Client Components para interactividad
```tsx
'use client'; // Al inicio del componente
```

#### Error: "Module not found"
**Solución**: Verificar imports y paths en `tsconfig.json`

#### Scraping falla
**Solución**: Verificar conexión y selectores de MercadoLibre

#### Blog no carga artículos
**Solución**: Revisar formato frontmatter en archivos `.md`

### Debug Mode
```bash
# Ver logs detallados
DEBUG=* npm run dev
```

## 📞 Soporte

Para ayuda o preguntas:
- Revisar la documentación en `/docs`
- Verificar issues del proyecto
- Revisar consola del navegador para errores

---

## 🎉 ¡Listo para Usar!

Con esta guía tienes todo lo necesario para:
- ✅ Desplegar la plataforma
- ✅ Crear contenido de blog  
- ✅ Personalizar categorías
- ✅ Optimizar para SEO
- ✅ Mantener actualizados los productos

**ShopHub está listo para generar comisiones de afiliados y proporcionar valor a los usuarios.** 🚀
