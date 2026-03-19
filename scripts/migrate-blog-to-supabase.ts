import { supabase } from '../lib/supabase';
import fs from 'fs';
import path from 'path';

const postsDirectory = path.join(process.cwd(), 'content', 'blog');

interface BlogPostFrontmatter {
  title: string;
  slug: string;
  excerpt?: string;
  author?: string;
  publishedAt?: string;
  updatedAt?: string;
  category?: string;
  tags?: string;
  featured?: string | boolean;
  imageUrl?: string;
  searchQuery?: string;
  content: string;
}

async function migrateBlogPosts() {
  try {
    if (!supabase) {
      console.error('Supabase no está configurado correctamente');
      return;
    }

    // Verificar si el directorio existe
    if (!fs.existsSync(postsDirectory)) {
      console.error(`Directorio de posts no encontrado: ${postsDirectory}`);
      return;
    }

    // Leer todos los archivos markdown
    const fileNames = fs.readdirSync(postsDirectory)
      .filter(name => name.endsWith('.md'));

    console.log(`Encontrados ${fileNames.length} archivos de blog para migrar`);

    for (const fileName of fileNames) {
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      
      // Parsear frontmatter
      const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---/;
      const match = fileContents.match(frontmatterRegex);
      
      if (!match) {
        console.warn(`Frontmatter no encontrado en ${fileName}, saltando...`);
        continue;
      }

      const frontmatter = match[1];
      const content = fileContents.replace(frontmatterRegex, '').trim();
      
      const data: BlogPostFrontmatter = {
        title: '',
        slug: '',
        content: content
      };
      
      frontmatter.split(/\r?\n/).forEach(line => {
        const separatorIndex = line.indexOf(':');
        if (separatorIndex !== -1) {
          const key = line.slice(0, separatorIndex).trim();
          const value = line.slice(separatorIndex + 1).trim();
          // Eliminar comillas si las hay
          const cleanedValue = value.replace(/^["']|["']$/g, '');
          (data as any)[key] = cleanedValue;
        }
      });

      // Preparar datos para Supabase
      const postData = {
        title: data.title || 'Sin título',
        slug: data.slug || fileName.replace(/\.md$/, ''),
        excerpt: data.excerpt || '',
        content: data.content,
        author: data.author || 'ShopHub Team',
        published_at: data.publishedAt || new Date().toISOString(),
        updated_at: data.updatedAt || data.publishedAt || new Date().toISOString(),
        category: data.category || 'blog',
        tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [],
        featured: data.featured === 'true' || data.featured === true,
        image_url: data.imageUrl || '',
        search_query: data.searchQuery || ''
      };

      console.log(`Migrando post: ${postData.title}`);

      // Verificar si ya existe un post con el mismo slug
      const { data: existingPost, error: checkError } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', postData.slug)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 significa que no se encontró ninguna fila
        console.error(`Error verificando post existente: ${checkError.message}`);
        continue;
      }

      let error;
      if (existingPost) {
        // Actualizar post existente
        ({ error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', existingPost.id));
        console.log(`Post actualizado: ${postData.title}`);
      } else {
        // Insertar nuevo post
        ({ error } = await supabase
          .from('blog_posts')
          .insert([postData]));
        console.log(`Post insertado: ${postData.title}`);
      }

      if (error) {
        console.error(`Error migrando post ${postData.title}:`, error.message);
      }
    }

    console.log('Migración completada');
  } catch (error) {
    console.error('Error durante la migración:', error);
  }
}

// Ejecutar la migración
migrateBlogPosts();