# 📝 Cómo Crear Entradas de Blog - ShopHub

Esta guía te explica cómo crear nuevas entradas de blog para la plataforma ShopHub utilizando archivos Markdown.

## 📁 Estructura de Archivos

Los artículos de blog se guardan en:
```
content/blog/
├── mi-articulo.md
├── otro-articulo.md
└── guia-compras.md
```

## 📝 Formato del Archivo

Cada artículo debe seguir este formato:

### Frontmatter (Metadatos)

Al inicio del archivo, incluye metadatos entre `---`:

```yaml
---
title: "Título del Artículo"
slug: "url-amigable-del-articulo"
excerpt: "Breve descripción que aparecerá en listados"
author: "Tu Nombre"
publishedAt: "2024-03-09T00:00:00Z"
updatedAt: "2024-03-09T00:00:00Z"
category: "tecnologia" # tecnologia, perfumes, blog
tags: "tag1,tag2,tag3"
featured: "true" # true o false
imageUrl: "https://ejemplo.com/imagen.jpg"
---
```

### Contenido

Después del frontmatter, escribe tu contenido en formato Markdown:

```markdown
# Título Principal

Este es el contenido de tu artículo en formato Markdown.

## Subtítulo

Puedes usar:
- **Negrita**
- *Cursiva*
- [Enlaces](https://ejemplo.com)
- Listas
- Código

### Otro subtítulo

Más contenido aquí...
```

## 🏷️ Campos Explicados

### `title` (Requerido)
- Título completo del artículo
- Aparece en la página del artículo y en listados

### `slug` (Requerido)
- URL amigable del artículo
- Solo letras minúsculas, números y guiones
- Ejemplo: `mejores-auriculares-gamer-2024`

### `excerpt` (Requerido)
- Breve descripción (1-2 frases)
- Aparece en listados del blog y previews

### `author` (Requerido)
- Nombre del autor
- Ejemplo: "ShopHub Team" o tu nombre

### `publishedAt` (Requerido)
- Fecha de publicación en formato ISO
- Formato: `YYYY-MM-DDTHH:MM:SSZ`
- Ejemplo: `2024-03-09T00:00:00Z`

### `updatedAt` (Opcional)
- Fecha de última actualización
- Si no se incluye, usa `publishedAt`

### `category` (Requerido)
- Categoría del artículo
- Valores válidos: `tecnologia`, `perfumes`, `blog`

### `tags` (Requerido)
- Etiquetas separadas por comas
- Ejemplo: `auriculares,gaming,tecnologia,mercadolibre`

### `featured` (Requerido)
- Si el artículo es destacado
- Valores: `"true"` o `"false"`

### `imageUrl` (Opcional)
- URL de imagen para el artículo
- Aparece en listados y página del artículo
- Si no se incluye, no mostrará imagen

## 📋 Ejemplo Completo

```markdown
---
title: "Los Mejores Auriculares Gamer de 2024: Guía Completa"
slug: "mejores-auriculares-gamer-2024"
excerpt: "Descubre los mejores auriculares gaming del mercado con análisis detallado."
author: "ShopHub Team"
publishedAt: "2024-03-09T00:00:00Z"
updatedAt: "2024-03-09T00:00:00Z"
category: "tecnologia"
tags: "auriculares,gaming,tecnologia,mercadolibre"
featured: "true"
imageUrl: "https://http2.mlstatic.com/D_NQ_NP_2X_707347-MLA45683457895_042021-F.webp"
---

# Los Mejores Auriculares Gamer de 2024: Guía Completa

En el mundo del gaming, tener el equipo adecuado puede marcar la diferencia...

## ¿Por Qué Invertir en Buenos Auriculares Gamer?

### 1. **Inmersión Total**
Los auriculares de gaming están diseñados específicamente...

## Nuestras Recomendaciones

Hemos analizado cuidadosamente las opciones disponibles...

---

*Este artículo participa en el programa de afiliados de MercadoLibre.*
```

## 🚀 Pasos para Crear un Artículo

1. **Crea el archivo** en `content/blog/`
   ```bash
   touch content/blog/mi-nuevo-articulo.md
   ```

2. **Añade el frontmatter** con los metadatos requeridos

3. **Escribe el contenido** en formato Markdown

4. **Guarda el archivo**

5. **Reinicia el servidor** si está corriendo
   ```bash
   npm run dev
   ```

6. **Visita** `http://localhost:3000/blog` para ver tu artículo

## 🌐 URL del Artículo

La URL de tu artículo será:
```
http://localhost:3000/blog/tu-slug
```

Ejemplo:
```
http://localhost:3000/blog/mejores-auriculares-gamer-2024
```

## 📸 Imágenes

Para imágenes:
- Usa URLs absolutas (comienza con `https://`)
- Optimiza las imágenes para web
- Tamaño recomendado: 1200x630px para social sharing
- Formatos recomendados: JPG, PNG, WebP

## ✅ Buenas Prácticas

1. **SEO Friendly**
   - Usa títulos descriptivos
   - Incluye palabras clave relevantes
   - Escribe meta descripciones claras

2. **Contenido de Valor**
   - Proporciona información útil
   - Incluye ejemplos prácticos
   - Sé específico y detallado

3. **Formato Limpio**
   - Usa encabezados jerárquicos
   - Incluye listas y párrafos cortos
   - Revisa la ortografía y gramática

4. **Affiliate Links**
   - Enlaza a productos relevantes
   - Usa enlaces de MercadoLibre cuando aplique
   - Incluye disclaimer de afiliados

## 🛠️ Herramientas Recomendadas

- **Editor**: VS Code con extensión Markdown Preview
- **Imágenes**: Canva, Figma, o Photoshop
- **SEO**: Google Keyword Planner para investigación

## ❌ Errores Comunes

1. **Olvidar el frontmatter** - El artículo no aparecerá
2. **Slug duplicado** - Causará conflictos
3. **Fecha inválida** - Puede causar errores de visualización
4. **Categoría incorrecta** - El artículo no se categorizará bien

## 📞 Soporte

Si tienes problemas creando artículos:

1. Revisa la consola del servidor para errores
2. Verifica que el frontmatter esté correcto
3. Asegúrate que el archivo esté en la carpeta correcta
4. Reinicia el servidor de desarrollo

---

**¡Listo! Ahora puedes crear contenido increíble para ShopHub.** 🎉
